import os
import json
from datetime import datetime
import google.generativeai as genai
from sqlalchemy.orm import Session
from ..models import Criteria, Expediente, Documento, ResultadoAuditoria, Configuration

def configure_gemini(db: Session):
    """
    Configures the Google Gemini API using either the database config key
    or the environment variable.
    """
    config = db.query(Configuration).first()
    api_key = os.environ.get("GEMINI_API_KEY")
    if config and config.gemini_api_key:
        api_key = config.gemini_api_key
        
    if not api_key:
        raise ValueError("API Key de Gemini no configurada. Por favor, añádela en la configuración.")
    genai.configure(api_key=api_key)

def audit_expediente_against_criteria(db: Session, expediente_id: int):
    """
    Runs the semantic audit for a specific folder/expediente against all active criteria.
    Updates the database with findings and overall compliance scores.
    """
    expediente = db.query(Expediente).filter(Expediente.id == expediente_id).first()
    if not expediente:
        return
    
    expediente.estado_analisis = "Analizando"
    db.commit()

    try:
        configure_gemini(db)
        criterios = db.query(Criteria).filter(Criteria.activo == True).all()
        
        # Clear any previous audit results
        db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == expediente_id).delete()
        db.commit()
        
        docs = db.query(Documento).filter(Documento.expediente_id == expediente_id).all()
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        for criterio in criterios:
            # 1. Look for matching files (fuzzy match on expected document name)
            matching_docs = []
            expected_doc_name = (criterio.documento_esperado or "").lower().strip()
            
            for doc in docs:
                if expected_doc_name in doc.nombre_archivo.lower():
                    matching_docs.append(doc)
            
            # If no documents match, it's a direct "No cumple"
            if not matching_docs:
                resultado = ResultadoAuditoria(
                    expediente_id=expediente_id,
                    criterio_id=criterio.id,
                    estado="No cumple",
                    observacion=f"No se identificó evidencia documental que acredite la existencia del documento esperado: '{criterio.documento_esperado}'."
                )
                db.add(resultado)
                db.commit()
                continue
                
            # 2. Combine texts from matching documents for Gemini context
            combined_text = ""
            for m_doc in matching_docs:
                combined_text += f"\n=== Archivo: {m_doc.nombre_archivo} ===\n{m_doc.texto_extraido or ''}\n"
            
            # Truncate combined text to avoid hitting large token counts in standard flash API
            # 25,000 characters is a safe limit representing ~6,000 tokens
            max_char_len = 25000
            if len(combined_text) > max_char_len:
                combined_text = combined_text[:max_char_len] + "\n[Texto truncado por límite de tamaño...]"
                
            prompt = f"""
            Actúa como un Auditor Administrativo Gubernamental y de Control Interno experto.
            Evalúa el siguiente CRITERIO de auditoría sobre los documentos proporcionados:
            
            [CRITERIO A EVALUAR]
            Nombre del Criterio: {criterio.criterio}
            Tipo de Criterio: {criterio.tipo}
            Documento esperado: {criterio.documento_esperado}
            
            [TEXTO EXTRAÍDO DE LOS ARCHIVOS DEL EXPEDIENTE]
            {combined_text}
            
            [INSTRUCCIONES DE AUDITORÍA]
            1. Analiza semánticamente si el expediente cumple con el criterio. No te limites a buscar palabras clave; interpreta el significado e implicaciones del texto.
            2. Veredictos (estado):
               - "Cumple": Si el documento esperado existe y su contenido satisface plenamente el criterio de forma consistente (ej. firmas completas, fechas coherentes, montos coincidentes).
               - "Cumple parcialmente": Si el documento existe pero presenta discrepancias menores, faltan firmas no críticas, o hay ligeras inconsistencias de información.
               - "No cumple": Si el documento no cumple con los datos obligatorios o existe una discrepancia grave (ej. montos distintos, proveedores distintos, fechas imposibles).
               - "No aplica": Si el criterio no aplica al tipo de expediente o archivos analizados.
            3. Redacta observaciones claras y profesionales en español.
            4. Localiza el documento exacto, número de página (1-based), y un fragmento corto textual que demuestre/acredite tu veredicto (evidencia). Si no es aplicable o no se encontró, pon null.
            
            Debes retornar estrictamente un objeto JSON con las siguientes llaves:
            - estado: "Cumple" | "Cumple parcialmente" | "No cumple" | "No aplica"
            - observacion: Explicación profesional y detallada de la auditoría
            - evidencia_documento: Nombre exacto del archivo de origen de la prueba o null
            - evidencia_pagina: Número de página (entero) o null
            - evidencia_texto: Frase literal corta del documento que sirve de prueba o null
            """
            
            try:
                # Use standard generativeai JSON generation config
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                data = json.loads(response.text)
                
                resultado = ResultadoAuditoria(
                    expediente_id=expediente_id,
                    criterio_id=criterio.id,
                    estado=data.get("estado", "No cumple"),
                    observacion=data.get("observacion", "Sin observaciones registradas por la IA."),
                    evidencia_documento=data.get("evidencia_documento"),
                    evidencia_pagina=data.get("evidencia_pagina"),
                    evidencia_texto=data.get("evidencia_texto")
                )
                db.add(resultado)
                db.commit()
            except Exception as e:
                resultado = ResultadoAuditoria(
                    expediente_id=expediente_id,
                    criterio_id=criterio.id,
                    estado="No cumple",
                    observacion=f"Error durante el análisis del criterio por la IA: {str(e)}"
                )
                db.add(resultado)
                db.commit()
                
        # 3. Calculate compliance percentage
        resultados_eval = db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == expediente_id).all()
        total_weighted = 0.0
        earned_weighted = 0.0
        cumple_count = 0
        
        for r in resultados_eval:
            # Query the corresponding criterion weight
            peso = r.criterio.peso if (r.criterio and r.criterio.peso) else 1.0
            total_weighted += peso
            if r.estado == "Cumple":
                earned_weighted += peso
                cumple_count += 1
            elif r.estado == "Cumple parcialmente":
                earned_weighted += (peso * 0.5)
                
        expediente.porcentaje_cumplimiento = (earned_weighted / total_weighted * 100) if total_weighted > 0 else 0.0
        
        # Decide global state
        if cumple_count == len(resultados_eval) and len(resultados_eval) > 0:
            expediente.resultado_global = "Cumple"
        elif earned_weighted > (total_weighted * 0.5) and len(resultados_eval) > 0:
            expediente.resultado_global = "Cumple parcialmente"
        else:
            expediente.resultado_global = "No cumple"
            
        expediente.estado_analisis = "Completado"
        expediente.fecha_analisis = datetime.utcnow()
        expediente.error_mensaje = None
        db.commit()
        
    except Exception as e:
        expediente.estado_analisis = "Error"
        expediente.error_mensaje = str(e)
        db.commit()
