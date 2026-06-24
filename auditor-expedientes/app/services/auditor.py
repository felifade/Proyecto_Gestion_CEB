import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import Criteria, Expediente, Documento, ResultadoAuditoria, Configuration
from .parser import parse_document

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
    
    for doc in docs:
        if doc.texto_extraido is None:
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
        expected_doc_name = (criterio.documento_esperado or "").lower().strip()
        matching_docs = []
        for doc in docs:
            # Check if keyword matches filename or relative path
            if expected_doc_name in doc.nombre_archivo.lower() or expected_doc_name in doc.ruta_relativa.lower():
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
            expected_keyword = (criterio.documento_esperado or "").lower().strip()
            matching_docs = []
            
            if expected_keyword:
                for doc in docs:
                    if expected_keyword in doc.nombre_archivo.lower() or expected_keyword in doc.ruta_relativa.lower():
                        matching_docs.append(doc)
            
            if not matching_docs:
                resultado = ResultadoAuditoria(
                    expediente_id=expediente_id,
                    criterio_id=criterio.id,
                    estado="No cumple",
                    observacion=f"Documento no localizado. No se encontró ningún archivo con el término esperado: '{criterio.documento_esperado}'."
                )
            else:
                doc = matching_docs[0]
                resultado = ResultadoAuditoria(
                    expediente_id=expediente_id,
                    criterio_id=criterio.id,
                    estado="Cumple",
                    observacion=f"Documento localizado. Se verificó la existencia del archivo '{doc.nombre_archivo}' en la carpeta del expediente.",
                    evidencia_documento=doc.nombre_archivo,
                    evidencia_pagina=1,
                    evidencia_texto=f"Archivo detectado en la ruta: {doc.ruta_relativa}"
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
