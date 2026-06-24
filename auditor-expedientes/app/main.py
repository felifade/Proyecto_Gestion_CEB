import os
import json
import subprocess
from fastapi import FastAPI, Depends, Request, Form, BackgroundTasks
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime

from .database import engine, Base, get_db, SessionLocal
from .models import Configuration, Criteria, Expediente, Documento, ResultadoAuditoria
from .services.parser import parse_document
from .services.auditor import audit_expediente_against_criteria, audit_all_expedientes_task
from .services.reports import generate_consolidated_excel, generate_executive_word, generate_executive_pdf

# Initialize SQLite tables on startup
Base.metadata.create_all(bind=engine)

def seed_default_criteria():
    db = SessionLocal()
    try:
        count = db.query(Criteria).count()
        if count == 0:
            mock_criteria = [
                Criteria(criterio="Validar la formalización y firmas completas del Contrato.", tipo="Contratos", peso=2.0, documento_esperado="contrato", activo=True),
                Criteria(criterio="Verificar Requisición de compra debidamente autorizada.", tipo="Requisición", peso=1.5, documento_esperado="requisición", activo=True),
                Criteria(criterio="Comprobar pólizas de garantía de cumplimiento vigentes.", tipo="Garantías", peso=1.0, documento_esperado="garantía", activo=True),
                Criteria(criterio="Verificar existencia del Acta de entrega-recepción de bienes/servicios.", tipo="Actas", peso=1.5, documento_esperado="acta", activo=True),
                Criteria(criterio="Comprobar Constancia de satisfacción debidamente requisitada.", tipo="Satisfacción", peso=1.0, documento_esperado="satisfacción", activo=True),
                Criteria(criterio="Validar el Trámite de pago (facturas y comprobantes fiscales conciliados).", tipo="Pagos", peso=2.0, documento_esperado="pago", activo=True)
            ]
            db.bulk_save_objects(mock_criteria)
            db.commit()
    except Exception as e:
        print(f"Error seeding default criteria: {str(e)}")
    finally:
        db.close()

seed_default_criteria()

app = FastAPI(title="Auditor de Expedientes")

# Mount static files folder
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize Jinja2 Templates
os.makedirs("app/templates", exist_ok=True)
templates = Jinja2Templates(directory="app/templates")

@app.get("/")
def read_dashboard(request: Request, db: Session = Depends(get_db)):
    """
    Renders the main dashboard page with metrics, compliances, and folders lists.
    """
    expedientes = db.query(Expediente).all()
    total = len(expedientes)
    completados = sum(1 for e in expedientes if e.resultado_global == "Cumple")
    parciales = sum(1 for e in expedientes if e.resultado_global == "Cumple parcialmente")
    no_cumple = sum(1 for e in expedientes if e.resultado_global == "No cumple")
    pendientes = sum(1 for e in expedientes if e.estado_analisis == "Pendiente")
    
    cumplimiento_promedio = sum(e.porcentaje_cumplimiento for e in expedientes) / total if total > 0 else 0.0
    
    # Render main dashboard template
    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={
            "expedientes": expedientes,
            "total": total,
            "cumplimiento_promedio": cumplimiento_promedio,
            "completados": completados,
            "parciales": parciales,
            "no_cumple": no_cumple,
            "pendientes": pendientes
        }
    )

@app.post("/api/pick-folder")
def api_pick_folder():
    """
    Triggers a native macOS folder selector dialog via AppleScript.
    Returns the POSIX path or null if canceled.
    """
    try:
        script = 'POSIX path of (choose folder with prompt "Seleccione la carpeta de expedientes:")'
        output = subprocess.check_output(['osascript', '-e', script], stderr=subprocess.DEVNULL)
        path = output.decode('utf-8').strip()
        return {"path": path}
    except subprocess.CalledProcessError:
        return {"path": None}

@app.post("/api/pick-file")
def api_pick_file():
    """
    Triggers a native macOS file selector dialog via AppleScript.
    Returns the POSIX path or null if canceled.
    """
    try:
        script = 'POSIX path of (choose file of type {"xlsx", "xls"} with prompt "Seleccione el archivo Excel de la Lista de Cotejo:")'
        output = subprocess.check_output(['osascript', '-e', script], stderr=subprocess.DEVNULL)
        path = output.decode('utf-8').strip()
        return {"path": path}
    except subprocess.CalledProcessError:
        return {"path": None}

@app.get("/configuracion")
def get_config(request: Request, db: Session = Depends(get_db)):
    """
    Renders the settings screen, listing available columns from the checklist
    to allow dynamic mapping.
    """
    config = db.query(Configuration).first()
    headers = []
    if config and config.ruta_lista_cotejo and os.path.exists(config.ruta_lista_cotejo):
        try:
            df = pd.read_excel(config.ruta_lista_cotejo, nrows=1)
            headers = list(df.columns)
        except Exception:
            pass
            
    mapeo = json.loads(config.mapeo_columnas) if (config and config.mapeo_columnas) else {}
    
    return templates.TemplateResponse(
        request=request,
        name="configuracion.html",
        context={
            "config": config,
            "headers": headers,
            "mapeo": mapeo
        }
    )

@app.post("/configuracion")
def save_config(
    ruta_expedientes: str = Form(...),
    ruta_lista_cotejo: str = Form(None),
    gemini_api_key: str = Form(None),
    col_criterio: str = Form("Criterio"),
    col_tipo: str = Form("Tipo"),
    col_peso: str = Form("Peso"),
    col_documento: str = Form("Documento esperado"),
    db: Session = Depends(get_db)
):
    """
    Saves folder configuration, and loads Criteria rules from the Checklist spreadsheet.
    """
    config = db.query(Configuration).first()
    mapeo = {
        "criterio": col_criterio,
        "tipo": col_tipo,
        "peso": col_peso,
        "documento_esperado": col_documento
    }
    mapeo_str = json.dumps(mapeo)
    
    ruta_lista_cotejo_clean = ruta_lista_cotejo.strip() if (ruta_lista_cotejo and ruta_lista_cotejo.strip()) else None
    
    if not config:
        config = Configuration(
            ruta_expedientes=ruta_expedientes.strip(),
            ruta_lista_cotejo=ruta_lista_cotejo_clean,
            mapeo_columnas=mapeo_str,
            gemini_api_key=gemini_api_key.strip() if gemini_api_key else None
        )
        db.add(config)
    else:
        config.ruta_expedientes = ruta_expedientes.strip()
        config.ruta_lista_cotejo = ruta_lista_cotejo_clean
        config.mapeo_columnas = mapeo_str
        if gemini_api_key:
            config.gemini_api_key = gemini_api_key.strip()
            
    db.commit()
    
    # Reload Criteria table using the mapped columns from Excel
    if config.ruta_lista_cotejo and os.path.exists(config.ruta_lista_cotejo):
        try:
            df = pd.read_excel(config.ruta_lista_cotejo)
            
            # Clear previous criteria
            db.query(Criteria).delete()
            db.commit()
            
            for _, row in df.iterrows():
                # Avoid empty rows
                if pd.isna(row.get(col_criterio)):
                    continue
                    
                crit = Criteria(
                    criterio=str(row[col_criterio]),
                    tipo=str(row.get(col_tipo, "General")) if not pd.isna(row.get(col_tipo)) else "General",
                    peso=float(row.get(col_peso, 1.0)) if not pd.isna(row.get(col_peso)) else 1.0,
                    documento_esperado=str(row[col_documento]) if not pd.isna(row.get(col_documento)) else "",
                    activo=True
                )
                db.add(crit)
            db.commit()
        except Exception as e:
            print(f"Error parsing Checklist: {str(e)}")
            
    return RedirectResponse(url="/configuracion", status_code=303)

@app.post("/scan")
def scan_folders(db: Session = Depends(get_db)):
    """
    Scans the local directory on demand, detecting subfolders as "expedientes" 
    and extracting texts to database cache.
    """
    config = db.query(Configuration).first()
    if not config or not config.ruta_expedientes or not os.path.exists(config.ruta_expedientes):
        return RedirectResponse(url="/configuracion", status_code=303)
        
    root_path = config.ruta_expedientes
    
    # Iterate and detect top-level subfolders as expedientes
    for folder_name in os.listdir(root_path):
        full_folder_path = os.path.join(root_path, folder_name)
        if os.path.isdir(full_folder_path) and not folder_name.startswith("."):
            # Check if this folder is already tracked
            exp = db.query(Expediente).filter(Expediente.nombre_carpeta == folder_name).first()
            if not exp:
                exp = Expediente(
                    nombre_carpeta=folder_name,
                    ruta_relativa=folder_name,
                    estado_analisis="Pendiente"
                )
                db.add(exp)
                db.commit()
                db.refresh(exp)
                
            # Scan files inside this folder
            for sub_root, dirs, files in os.walk(full_folder_path):
                for file_name in files:
                    if file_name.startswith(".") or file_name == "Thumbs.db":
                        continue
                    
                    full_file_path = os.path.join(sub_root, file_name)
                    rel_path = os.path.relpath(full_file_path, full_folder_path)
                    
                    # Check if file is already cached in db
                    doc_entry = db.query(Documento).filter(
                        Documento.expediente_id == exp.id,
                        Documento.nombre_archivo == file_name,
                        Documento.ruta_relativa == rel_path
                    ).first()
                    
                    # Omit large files from processing (> 20 MB)
                    if os.path.getsize(full_file_path) > 20 * 1024 * 1024:
                        continue
                        
                    if not doc_entry:
                        # Extract content (fitz/pdfplumber/OCR/docx/excel)
                        text_extracted, total_pages = parse_document(full_file_path)
                        
                        doc_entry = Documento(
                            expediente_id=exp.id,
                            nombre_archivo=file_name,
                            ruta_relativa=rel_path,
                            tipo_archivo=file_name.split(".")[-1] if "." in file_name else "otro",
                            tamano_bytes=os.path.getsize(full_file_path),
                            texto_extraido=text_extracted,
                            paginas_totales=total_pages
                        )
                        db.add(doc_entry)
            db.commit()
            
    return RedirectResponse(url="/", status_code=303)

@app.post("/audit/{exp_id}")
def run_audit(exp_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Triggers the audit task in the background using FastAPI workers.
    """
    exp = db.query(Expediente).filter(Expediente.id == exp_id).first()
    if exp:
        exp.estado_analisis = "Analizando"
        db.commit()
        # Add to background worker queue
        background_tasks.add_task(audit_expediente_against_criteria, db, exp_id)
        
    return RedirectResponse(url="/", status_code=303)

@app.post("/audit-all")
def run_audit_all(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Triggers sequential background audits for all registered Folders/Expedientes.
    """
    expedientes = db.query(Expediente).all()
    exp_ids = []
    for exp in expedientes:
        if exp.estado_analisis != "Analizando":
            exp.estado_analisis = "Analizando"
            exp_ids.append(exp.id)
            
    db.commit()
    
    if exp_ids:
        # Add sequential bulk audit queue to background worker thread
        background_tasks.add_task(audit_all_expedientes_task, exp_ids)
        
    return RedirectResponse(url="/", status_code=303)

@app.get("/expediente/{exp_id}")
def get_expediente_detail(exp_id: int, request: Request, db: Session = Depends(get_db)):
    """
    Renders detailed results for a single folder, listing all observations and page citations.
    """
    exp = db.query(Expediente).filter(Expediente.id == exp_id).first()
    resultados = db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == exp_id).all()
    return templates.TemplateResponse(
        request=request,
        name="detalle.html",
        context={
            "expediente": exp,
            "resultados": resultados
        }
    )

@app.get("/export/excel")
def download_excel(db: Session = Depends(get_db)):
    """
    Endpoint generating consolidated spreadsheet for download.
    """
    output_path = "/tmp/Consolidado_Auditoria.xlsx"
    generate_consolidated_excel(db, output_path)
    return FileResponse(output_path, filename="Consolidado_Auditoria.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.get("/export/word")
def download_word(db: Session = Depends(get_db)):
    """
    Endpoint generating word report file for download.
    """
    output_path = "/tmp/Reporte_Ejecutivo.docx"
    generate_executive_word(db, output_path)
    return FileResponse(output_path, filename="Reporte_Ejecutivo.docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")

@app.get("/export/pdf")
def download_pdf(db: Session = Depends(get_db)):
    """
    Endpoint generating printable pdf report file for download.
    """
    output_path = "/tmp/Reporte_Ejecutivo.pdf"
    generate_executive_pdf(db, output_path)
    return FileResponse(output_path, filename="Reporte_Ejecutivo.pdf", media_type="application/pdf")
