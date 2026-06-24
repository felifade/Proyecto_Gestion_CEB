import os
import json
import unicodedata
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import Criteria, Expediente, Documento, ResultadoAuditoria, Configuration
from .parser import parse_document


def normalize_text(text: str) -> str:
    """
    Removes diacritical marks (accents) and converts to lowercase for
    accent-insensitive comparison. e.g., 'Requisición' -> 'requisicion'
    """
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).lower().strip()

# Mapping of documento_esperado keywords -> terms to verify in document content
# Each key maps to a list of terms; at least some should appear in the document text
CONTENT_VERIFICATION_TERMS = {
    "autorización": ["autorización", "autoriza", "recursos", "presupuest", "firma"],
    "solicitud": ["solicitud", "adquisición", "bienes", "servicios", "requiere"],
    "requisición": ["requisición", "cantidad", "descripción", "autoriza", "unidad"],
    "ejercer": ["ejercer", "recursos", "oficialía", "mayor", "autoriza"],
    "validación": ["validación", "objeto", "gasto", "partida", "presupuestal"],
    "investigación de mercado": ["mercado", "investigación", "proveedor", "precio", "cotiza"],
    "cotización": ["cotización", "precio", "monto", "proveedor", "rfc", "vigencia"],
    "cuadro comparativo": ["comparativo", "proveedor", "precio", "resultado", "análisis"],
    "reducción de plazos": ["reducción", "plazos", "justificación", "fundado"],
    "aprobación del comité": ["comité", "aprobación", "adquisiciones", "acta"],
    "revisión de la documentación": ["revisión", "documentación", "comité", "registro"],
    "revisión y aprobación": ["revisión", "aprobación", "convocatoria", "bases"],
    "convocatoria": ["convocatoria", "licitación", "periódico", "oficial"],
    "bases": ["bases", "licitación", "requisitos", "participación"],
    "designación": ["designación", "personal", "ente", "ejecutor"],
    "junta de aclaraciones": ["junta", "aclaraciones", "invitados", "asistencia"],
    "presentación y apertura": ["presentación", "apertura", "proposiciones", "registro"],
    "propuesta completa": ["propuesta", "documentos", "anexos", "ganador", "licitante"],
    "propuesta no ganadores": ["propuesta", "no ganador", "licitante", "descalificado"],
    "garantía de seriedad": ["garantía", "seriedad", "fianza", "monto"],
    "evaluación": ["evaluación", "proposiciones", "dictamen", "técnic"],
    "fallo": ["fallo", "adjudicación", "resultado", "ganador"],
    "informe": ["informe", "órgano", "control", "interno"],
    "notificación": ["notificación", "contrato", "proveedor", "adjudicación"],
    "contrato": ["contrato", "firma", "cláusula", "vigencia", "monto", "objeto"],
    "garantía": ["garantía", "cumplimiento", "fianza", "póliza", "aseguradora"],
    "acta constitutiva": ["acta", "constitutiva", "sociedad", "notari"],
    "poder": ["poder", "representante", "legal", "facultades", "notari"],
    "identificación oficial": ["identificación", "oficial", "ine", "pasaporte", "fotografía"],
    "rfc": ["rfc", "contribuyente", "registro", "federal", "fiscal"],
    "padrón": ["padrón", "proveedor", "gobierno", "hidalgo", "registro"],
    "sat": ["sat", "opinión", "cumplimiento", "positiv"],
    "opinión del estado": ["opinión", "estado", "cumplimiento", "hidalgo"],
    "domicilio": ["domicilio", "comprobante", "dirección", "calle"],
    "caratula": ["bancar", "cuenta", "clabe", "caratula", "estado de cuenta"],
    "solicitud programática": ["solicitud", "programática", "gasto", "partida"],
    "contra-recibo": ["contra-recibo", "contrarecibo", "hacienda", "secretaría"],
    "póliza": ["póliza", "egreso", "comprometido", "devengado", "ejercido"],
    "transferencia": ["transferencia", "pago", "bancar", "depósito", "spei"],
    "cfdi": ["cfdi", "rfc", "total", "folio", "fiscal", "factura"],
    "entrega-recepción": ["entrega", "recepción", "acta", "firma", "bien"],
    "entera satisfacción": ["satisfacción", "conformidad", "entera", "servicio"],
    "área requirente": ["área", "requirente", "satisfacción", "conformidad"],
    "entregable": ["entregable", "justificación", "recurso", "aplicación", "conforme"],
    "fotográfica": ["foto", "memoria", "firmada", "lugar", "tiempo"],
    "remisión": ["remisión", "nota", "entrega", "cantidad"],
    "vale": ["vale", "almacén", "entrada", "salida", "resguardo"],
    "respaldo": ["respaldo", "evidencia", "verificación", "cédula", "copia"],
    "eximición": ["eximición", "garantía", "cumplimiento", "solicitud"],
    "desierto": ["desierto", "procedimiento", "antecedente", "declarar"],
}


def verify_document_content(doc, keyword: str) -> tuple:
    """
    Verifies if a matched document's extracted text contains the expected
    content terms for the given criterion keyword.
    
    Returns (status, detail) where:
    - status: 'Verificado', 'Parcial', 'No verificado', 'Sin texto'
    - detail: human-readable explanation of what was found/missing
    """
    if not doc.texto_extraido or len(doc.texto_extraido.strip()) == 0:
        return "Sin texto", "No se pudo extraer texto del documento para verificar su contenido."
    
    normalized_keyword = normalize_text(keyword)
    terms = CONTENT_VERIFICATION_TERMS.get(normalized_keyword, [])
    
    if not terms:
        # No verification terms defined for this keyword, check basic presence
        if normalized_keyword in normalize_text(doc.texto_extraido):
            return "Verificado", f"El término '{keyword}' fue encontrado en el contenido del documento."
        else:
            return "No verificado", f"El término '{keyword}' no fue encontrado en el contenido del documento."
    
    # Check which terms are present in the document text
    doc_text_normalized = normalize_text(doc.texto_extraido)
    found_terms = []
    missing_terms = []
    
    for term in terms:
        if normalize_text(term) in doc_text_normalized:
            found_terms.append(term)
        else:
            missing_terms.append(term)
    
    ratio = len(found_terms) / len(terms) if terms else 0
    
    if ratio >= 0.5:
        status = "Verificado"
        detail = f"Contenido validado ({len(found_terms)}/{len(terms)} términos). Encontrados: {', '.join(found_terms)}."
    elif ratio > 0:
        status = "Parcial"
        detail = f"Contenido parcial ({len(found_terms)}/{len(terms)} términos). Encontrados: {', '.join(found_terms)}. Faltantes: {', '.join(missing_terms)}."
    else:
        status = "No verificado"
        detail = f"No se encontraron los términos esperados en el documento. Faltantes: {', '.join(missing_terms)}."
    
    return status, detail


def get_gemini_client(db: Session):
    """
    Returns an initialized Google GenAI client using either the database config key
    or the environment variable. Pops GOOGLE_API_KEY from environment temporarily
    to prevent client override issues.
    """
    config = db.query(Configuration).first()
    api_key = os.environ.get("GEMINI_API_KEY")
    if config and config.gemini_api_key:
        api_key = config.gemini_api_key
        
    if not api_key:
        raise ValueError("API Key de Gemini no configurada.")
        
    orig_google_key = os.environ.pop("GOOGLE_API_KEY", None)
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
    finally:
        if orig_google_key is not None:
            os.environ["GOOGLE_API_KEY"] = orig_google_key
            
    return client


def ensure_document_texts_cached(db: Session, expediente: Expediente, docs: list[Documento], creds_dict: dict = None):
    """
    Checks if any document has unextracted text, and extracts it in the background thread.
    This defers the heavy PDF/OCR processing from the synchronous folder scan.
    Supports local file systems or in-memory downloads from Google Drive.
    """
    config = db.query(Configuration).first()
    
    # Extensions that are useful for text extraction
    TEXT_EXTENSIONS = {'.pdf', '.docx', '.doc', '.xlsx', '.xls', '.txt', '.csv', '.xml', '.json'}
    
    for doc in docs:
        if doc.texto_extraido is None:
            # Skip downloading and parsing non-text/media files
            _, ext = os.path.splitext(doc.nombre_archivo.lower())
            if ext not in TEXT_EXTENSIONS:
                doc.texto_extraido = ""
                doc.paginas_totales = 0
                db.commit()
                continue
                
            # 1. Try Google Drive API download if credentials and file ID are available
            if creds_dict and doc.google_drive_file_id:
                try:
                    import io
                    from googleapiclient.http import MediaIoBaseDownload
                    from .drive import get_drive_service
                    
                    drive_service = get_drive_service(creds_dict)
                    request = drive_service.files().get_media(fileId=doc.google_drive_file_id)
                    fh = io.BytesIO()
                    downloader = MediaIoBaseDownload(fh, request)
                    done = False
                    while done is False:
                        status, done = downloader.next_chunk()
                    file_data = fh.getvalue()
                    
                    text, pages = parse_document(doc.nombre_archivo, file_data=file_data)
                    doc.texto_extraido = text
                    doc.paginas_totales = pages
                    db.commit()
                except Exception as e:
                    print(f"Error extracting text from Google Drive file {doc.nombre_archivo} in background: {str(e)}")
            else:
                # 2. Fallback to local files if path configuration is present
                if config and config.ruta_expedientes:
                    full_file_path = os.path.join(config.ruta_expedientes, expediente.ruta_relativa, doc.ruta_relativa)
                    if os.path.exists(full_file_path):
                        try:
                            text, pages = parse_document(full_file_path)
                            doc.texto_extraido = text
                            doc.paginas_totales = pages
                            db.commit()
                        except Exception as e:
                            print(f"Error extracting text from local file {doc.nombre_archivo} in background: {str(e)}")

def audit_expediente_simulated(db: Session, expediente_id: int, creds_dict: dict = None):
    """
    Runs a simulated audit to let users test folder parsing, metrics, 
    semaphores, and details without requiring a Gemini API Key or Checklist Excel.
    """
    expediente = db.query(Expediente).filter(Expediente.id == expediente_id).first()
    criterios = db.query(Criteria).filter(Criteria.activo == True).all()
    
    # Clean previous results
    db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == expediente_id).delete()
    
    docs = db.query(Documento).filter(Documento.expediente_id == expediente_id).all()
    ensure_document_texts_cached(db, expediente, docs, creds_dict)
    
    for criterio in criterios:
        expected_doc_name = normalize_text(criterio.documento_esperado or "")
        matching_docs = []
        for doc in docs:
            # Check if normalized keyword matches filename or relative path (accent-insensitive)
            if expected_doc_name in normalize_text(doc.nombre_archivo) or expected_doc_name in normalize_text(doc.ruta_relativa):
                matching_docs.append(doc)
                
        if not matching_docs:
            resultado = ResultadoAuditoria(
                expediente_id=expediente_id,
                criterio_id=criterio.id,
                estado="No cumple",
                observacion=f"Simulado: No se identificó evidencia documental que acredite la existencia del documento esperado: '{criterio.documento_esperado}'."
            )
        else:
            doc = matching_docs[0]
            # Simulation of realistic audit findings based on document type
            if "contrato" in doc.nombre_archivo.lower():
                estado = "Cumple"
                observacion = "Simulado: Se verificó la existencia del Contrato de Adhesión. El documento se encuentra debidamente formalizado y firmado por el proveedor y el representante del CEB."
                ev_texto = "El presente contrato surtirá efectos a partir de la firma..."
                ev_pag = 1
            elif "requisición" in doc.nombre_archivo.lower():
                estado = "Cumple"
                observacion = "Simulado: Requisición de compra validada por el área administrativa. Se constató la firma de autorización del titular."
                ev_texto = "Autorización de adquisición de consumibles y papelería."
                ev_pag = 1
            elif "garantía" in doc.nombre_archivo.lower() or "garantia" in doc.nombre_archivo.lower():
                estado = "Cumple parcialmente"
                observacion = "Simulado: Se localizó la fianza de cumplimiento en subcarpeta de garantías, pero falta el acuse de validación de la fianza."
                ev_texto = "Garantía de cumplimiento equivalente al 10% del monto total."
                ev_pag = 2
            elif "pago" in doc.nombre_archivo.lower() or "factura" in doc.nombre_archivo.lower() or "anexo" in doc.nombre_archivo.lower():
                estado = "Cumple"
                observacion = "Simulado: Comprobante de pago y facturas revisadas. El monto coincide plenamente con los anexos contables."
                ev_texto = "Total liquidado de la factura fiscal."
                ev_pag = 1
            elif "acta" in doc.nombre_archivo.lower() or "entrega" in doc.nombre_archivo.lower():
                estado = "Cumple"
                observacion = "Simulado: Acta de entrega-recepción del bien o servicio localizada y firmada con satisfacción."
                ev_texto = "Constancia física de recepción de los bienes."
                ev_pag = 1
            elif "satisfacción" in doc.nombre_archivo.lower() or "satisfaccion" in doc.nombre_archivo.lower() or "constancia" in doc.nombre_archivo.lower():
                estado = "Cumple"
                observacion = "Simulado: Se identificó la constancia de conformidad de los servicios recibidos."
                ev_texto = "Servicios entregados de conformidad."
                ev_pag = 1
            else:
                estado = "Cumple"
                observacion = f"Simulado: Documento de respaldo '{doc.nombre_archivo}' validado con éxito."
                ev_texto = doc.texto_extraido[:80] if doc.texto_extraido else "Contenido del archivo validado."
                ev_pag = 1
                
            resultado = ResultadoAuditoria(
                expediente_id=expediente_id,
                criterio_id=criterio.id,
                estado=estado,
                observacion=observacion,
                evidencia_documento=doc.nombre_archivo,
                evidencia_pagina=ev_pag,
                evidencia_texto=ev_texto
            )
        db.add(resultado)
        
    db.commit()
    calculate_compliance_metrics(db, expediente)

def calculate_compliance_metrics(db: Session, expediente: Expediente):
    """
    Computes weighted compliance scores and registers overall status.
    """
    resultados_eval = db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == expediente.id).all()
    total_weighted = 0.0
    earned_weighted = 0.0
    cumple_count = 0
    
    for r in resultados_eval:
        peso = r.criterio.peso if (r.criterio and r.criterio.peso) else 1.0
        total_weighted += peso
        if r.estado == "Cumple":
            earned_weighted += peso
            cumple_count += 1
        elif r.estado == "Cumple parcialmente":
            earned_weighted += (peso * 0.5)
            
    expediente.porcentaje_cumplimiento = (earned_weighted / total_weighted * 100) if total_weighted > 0 else 0.0
    
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

def audit_expediente_against_criteria(db: Session, expediente_id: int, creds_dict: dict = None):
    """
    Runs a deterministic checklist check for the expediente.
    Verifies if files matching the 'documento_esperado' keyword exist in the folder structure.
    Bypasses Gemini API calls for offline stability and speed, as requested by the user.
    """
    expediente = db.query(Expediente).filter(Expediente.id == expediente_id).first()
    if not expediente:
        return
    
    expediente.estado_analisis = "Analizando"
    db.commit()

    try:
        criterios = db.query(Criteria).filter(Criteria.activo == True).all()
        
        # Clear previous results
        db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == expediente_id).delete()
        db.commit()
        
        docs = db.query(Documento).filter(Documento.expediente_id == expediente_id).all()
        ensure_document_texts_cached(db, expediente, docs, creds_dict)
        
        for criterio in criterios:
            expected_keyword = normalize_text(criterio.documento_esperado or "")
            matching_docs = []
            matched_by_text = False
            
            if expected_keyword:
                # Phase 1: Match by filename or path (accent-insensitive)
                for doc in docs:
                    if expected_keyword in normalize_text(doc.nombre_archivo) or expected_keyword in normalize_text(doc.ruta_relativa):
                        matching_docs.append(doc)
                
                # Phase 2: Fallback — search inside extracted text content
                if not matching_docs:
                    for doc in docs:
                        if doc.texto_extraido and expected_keyword in normalize_text(doc.texto_extraido):
                            matching_docs.append(doc)
                            matched_by_text = True
            
            if not matching_docs:
                resultado = ResultadoAuditoria(
                    expediente_id=expediente_id,
                    criterio_id=criterio.id,
                    estado="No cumple",
                    observacion=f"Documento no localizado. No se encontró ningún archivo con el término esperado: '{criterio.documento_esperado}'.",
                    contenido_verificado="N/A",
                    detalle_contenido="No aplica — archivo no encontrado."
                )
            else:
                doc = matching_docs[0]
                # Verify document content
                content_status, content_detail = verify_document_content(
                    doc, criterio.documento_esperado or ""
                )
                
                if matched_by_text:
                    resultado = ResultadoAuditoria(
                        expediente_id=expediente_id,
                        criterio_id=criterio.id,
                        estado="Cumple",
                        observacion=f"Documento localizado por contenido. El término '{criterio.documento_esperado}' fue encontrado dentro del texto del archivo '{doc.nombre_archivo}'.",
                        evidencia_documento=doc.nombre_archivo,
                        evidencia_pagina=1,
                        evidencia_texto=f"Término detectado en contenido del archivo: {doc.ruta_relativa}",
                        contenido_verificado=content_status,
                        detalle_contenido=content_detail
                    )
                else:
                    resultado = ResultadoAuditoria(
                        expediente_id=expediente_id,
                        criterio_id=criterio.id,
                        estado="Cumple",
                        observacion=f"Documento localizado. Se verificó la existencia del archivo '{doc.nombre_archivo}' en la carpeta del expediente.",
                        evidencia_documento=doc.nombre_archivo,
                        evidencia_pagina=1,
                        evidencia_texto=f"Archivo detectado en la ruta: {doc.ruta_relativa}",
                        contenido_verificado=content_status,
                        detalle_contenido=content_detail
                    )
            db.add(resultado)
            
        db.commit()
        calculate_compliance_metrics(db, expediente)
        
    except Exception as e:
        expediente.estado_analisis = "Error"
        expediente.error_mensaje = str(e)
        db.commit()


def audit_all_expedientes_task(expediente_ids: list[int], creds_dict: dict = None):
    """
    Runs audit for multiple expedientes sequentially in a background thread
    to prevent SQLite concurrency locks.
    """
    from ..database import SessionLocal
    for exp_id in expediente_ids:
        db = SessionLocal()
        try:
            audit_expediente_against_criteria(db, exp_id, creds_dict)
        except Exception as e:
            print(f"Error al auditar expediente {exp_id}: {str(e)}")
        finally:
            db.close()
