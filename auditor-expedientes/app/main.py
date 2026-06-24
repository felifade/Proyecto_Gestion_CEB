import os
from dotenv import load_dotenv
load_dotenv()
# Allow HTTP for local Google OAuth testing
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
import json
import subprocess
from fastapi import FastAPI, Depends, Request, Form, BackgroundTasks
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
from starlette.middleware.sessions import SessionMiddleware
from google_auth_oauthlib.flow import Flow

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
            real_criteria = [
                # 1-5: Requerimientos iniciales y autorizaciones
                Criteria(criterio="1. Oficio de autorización de recursos y adecuación presupuestaria (incluyendo sus respectivos anexos).", tipo="Autorizaciones", peso=1.0, documento_esperado="autorización", activo=True),
                Criteria(criterio="2. Oficio de solicitud del área requirente para la adquisición de bienes o servicios.", tipo="Autorizaciones", peso=1.0, documento_esperado="solicitud", activo=True),
                Criteria(criterio="3. Formato de requisición.", tipo="Autorizaciones", peso=1.0, documento_esperado="requisición", activo=True),
                Criteria(criterio="4. Oficio para ejercer recursos autorizados emitido por oficialía mayor.", tipo="Autorizaciones", peso=1.0, documento_esperado="ejercer", activo=True),
                Criteria(criterio="5. Oficio de validación del objeto del gasto.", tipo="Autorizaciones", peso=1.0, documento_esperado="validación", activo=True),
                
                # 6: Proceso de adjudicación e investigación de mercado
                Criteria(criterio="6.1 Investigación de mercado de acuerdo con la normativa jurídica aplicable con soporte documental. / Oficio de solicitud de cotización (si fue por internet, imprimir el soporte del correo electrónico).", tipo="Adjudicación", peso=1.5, documento_esperado="investigación de mercado", activo=True),
                Criteria(criterio="6.2 Cotizaciones en original o auténticas (RFC, domicilio, teléfono, sello en caso de aplicar y firmada).", tipo="Adjudicación", peso=1.5, documento_esperado="cotización", activo=True),
                Criteria(criterio="6.3 Cuadro comparativo (resultado del análisis).", tipo="Adjudicación", peso=1.5, documento_esperado="cuadro comparativo", activo=True),
                
                # 7-9: Reducción de plazos y bases
                Criteria(criterio="7. Oficio de reducción de plazos con justificación fundado y motivado (en caso de aplicar).", tipo="Licitación", peso=1.0, documento_esperado="reducción de plazos", activo=True),
                Criteria(criterio="8. Acta de aprobación del comité de adquisiciones de la reducción de plazos (en caso de aplicar).", tipo="Licitación", peso=1.0, documento_esperado="aprobación del comité", activo=True),
                Criteria(criterio="9. Acta de revisión de la documentación (comité de adquisiciones, arrendamientos y servicios del Estado de Hidalgo) y registro de invitados.", tipo="Licitación", peso=1.0, documento_esperado="revisión de la documentación", activo=True),
                Criteria(criterio="9.1 Acta de revisión y aprobación de la convocatoria que contenga las bases de licitación.", tipo="Licitación", peso=1.0, documento_esperado="revisión y aprobación", activo=True),
                Criteria(criterio="9.2 Convocatoria a la licitación pública, con oficio enviado al periódico oficial.", tipo="Licitación", peso=1.0, documento_esperado="convocatoria", activo=True),
                Criteria(criterio="9.3 Bases de la licitación pública con requisitos de participación.", tipo="Licitación", peso=1.0, documento_esperado="bases", activo=True),
                Criteria(criterio="9.4 Oficio de designación del personal por parte del ente ejecutor.", tipo="Licitación", peso=1.0, documento_esperado="designación", activo=True),
                
                # 10-13: Actas y propuestas
                Criteria(criterio="10. Junta de aclaraciones y registro de invitados.", tipo="Propuestas", peso=1.0, documento_esperado="junta de aclaraciones", activo=True),
                Criteria(criterio="11. Presentación y apertura de proposiciones, con registro de invitados.", tipo="Propuestas", peso=1.0, documento_esperado="presentación y apertura", activo=True),
                Criteria(criterio="11.1 Propuesta completa conforme a los documentos y anexos que establecen las bases de la licitación pública, correspondiente al licitante ganador.", tipo="Propuestas", peso=1.5, documento_esperado="propuesta completa", activo=True),
                Criteria(criterio="11.2 Propuesta completa conforme a los documentos y anexos que establecen las bases de la licitación pública, de los licitantes no ganadores.", tipo="Propuestas", peso=1.0, documento_esperado="propuesta no ganadores", activo=True),
                Criteria(criterio="11.3 Garantía de seriedad.", tipo="Propuestas", peso=1.0, documento_esperado="garantía de seriedad", activo=True),
                Criteria(criterio="12. Evaluación de proposiciones y dictamen técnico.", tipo="Fallo", peso=1.5, documento_esperado="evaluación", activo=True),
                Criteria(criterio="13. Acta de fallo.", tipo="Fallo", peso=1.5, documento_esperado="fallo", activo=True),
                Criteria(criterio="13.1 Informe enviado al órgano interno de control (en caso de aplicar).", tipo="Fallo", peso=1.0, documento_esperado="informe", activo=True),
                
                # 14-16: Contrato y Garantías
                Criteria(criterio="14. Documentación que ampare la notificación del contrato al proveedor o prestador de servicios.", tipo="Contrato", peso=1.0, documento_esperado="notificación", activo=True),
                Criteria(criterio="15. Contrato celebrado con sus respectivos anexos y modificaciones, así como la documentación que lo ampara.", tipo="Contrato", peso=2.0, documento_esperado="contrato", activo=True),
                Criteria(criterio="16. Garantías de anticipo, cumplimiento y/o calidad, en su caso.", tipo="Contrato", peso=1.5, documento_esperado="garantía", activo=True),
                
                # 17: Información del Proveedor
                Criteria(criterio="17.1 a) Acta constitutiva o acta de nacimiento.", tipo="Proveedor", peso=1.0, documento_esperado="acta constitutiva", activo=True),
                Criteria(criterio="17.2 b) Documento legal (notariado o protocolizado) donde se le otorga las facultades al representante legal para presentar propuesta, en su caso, y firma del contrato.", tipo="Proveedor", peso=1.0, documento_esperado="poder", activo=True),
                Criteria(criterio="17.3 c) Identificación oficial con fotografía.", tipo="Proveedor", peso=1.0, documento_esperado="identificación oficial", activo=True),
                Criteria(criterio="17.4 d) Registro federal de contribuyentes (RFC).", tipo="Proveedor", peso=1.0, documento_esperado="rfc", activo=True),
                Criteria(criterio="17.5 e) Registro vigente del padrón de proveedores que emite el Gobierno del Estado de Hidalgo.", tipo="Proveedor", peso=1.0, documento_esperado="padrón", activo=True),
                Criteria(criterio="17.6 f) Opinión de cumplimiento en sentido positivo emitida por el SAT.", tipo="Proveedor", peso=1.0, documento_esperado="sat", activo=True),
                Criteria(criterio="17.7 g) Opinión de cumplimiento en sentido positivo emitida por Gobierno del Estado de Hidalgo.", tipo="Proveedor", peso=1.0, documento_esperado="opinión del estado", activo=True),
                Criteria(criterio="17.8 h) Comprobante de domicilio.", tipo="Proveedor", peso=1.0, documento_esperado="domicilio", activo=True),
                Criteria(criterio="17.9 i) Carátula bancaria o de datos Bancarios en hoja membretada y firmada, así como el estado de cuenta bancario.", tipo="Proveedor", peso=1.0, documento_esperado="caratula", activo=True),
                Criteria(criterio="17.10 Identificación oficial de quienes firman el contrato.", tipo="Proveedor", peso=1.0, documento_esperado="identificación oficial", activo=True),
                
                # 18: Trámite de Pago
                Criteria(criterio="18.1 Solicitud programática del gasto.", tipo="Trámite de Pago", peso=1.0, documento_esperado="solicitud programática", activo=True),
                Criteria(criterio="18.2 Contra-recibos emitidos por la secretaría de Hacienda del Poder Ejecutivo del Estado de Hidalgo.", tipo="Trámite de Pago", peso=1.5, documento_esperado="contra-recibo", activo=True),
                Criteria(criterio="18.3 Póliza de egresos [comprometido, devengado, ejercido y pagado].", tipo="Trámite de Pago", peso=1.5, documento_esperado="póliza", activo=True),
                Criteria(criterio="18.4 Transferencias bancarias por concepto de pago a proveedor.", tipo="Trámite de Pago", peso=2.0, documento_esperado="transferencia", activo=True),
                Criteria(criterio="18.5 Comprobantes fiscales digitales por internet (CFDI), con sello de responsabilidad y firma.", tipo="Trámite de Pago", peso=2.0, documento_esperado="cfdi", activo=True),
                
                # 19: Entrega
                Criteria(criterio="19. Documento que ampare la entrega oficial del bien o servicio adquirido (acta entrega-recepción).", tipo="Entrega", peso=2.0, documento_esperado="entrega-recepción", activo=True),
                Criteria(criterio="19.1 Constancia de entera satisfacción.", tipo="Entrega", peso=1.0, documento_esperado="entera satisfacción", activo=True),
                Criteria(criterio="19.2 Constancia de entera satisfacción del área requirente.", tipo="Entrega", peso=1.0, documento_esperado="área requirente", activo=True),
                Criteria(criterio="19.3 Documentación que justifique la aplicación de los recursos (entregables conforme al contrato).", tipo="Entrega", peso=1.5, documento_esperado="entregable", activo=True),
                Criteria(criterio="19.4 Memoria fotográfica que indique tiempo, lugar, circunstancias y encontrarse debidamente firmadas por el responsable de generar la información.", tipo="Entrega", peso=1.0, documento_esperado="fotográfica", activo=True),
                Criteria(criterio="19.5 Nota de remisión.", tipo="Entrega", peso=1.0, documento_esperado="remisión", activo=True),
                Criteria(criterio="19.6 Vale de almacén.", tipo="Entrega", peso=1.0, documento_esperado="vale", activo=True),
                
                # 20: Evidencia
                Criteria(criterio="20. El Respaldo de evidencia (actas/cédulas de verificación por el OIC, resguardos, impresos, copias).", tipo="Evidencia", peso=1.0, documento_esperado="respaldo", activo=True)
            ]
            db.bulk_save_objects(real_criteria)
            db.commit()
    except Exception as e:
        print(f"Error seeding default criteria: {str(e)}")
    finally:
        db.close()

seed_default_criteria()

app = FastAPI(title="Auditor de Expedientes")

# Add SessionMiddleware to support encrypted session cookies (for OAuth state & tokens)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ.get("SESSION_SECRET", "super-secret-key-change-it-in-prod-12345")
)

# Mount static files folder
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize Jinja2 Templates
os.makedirs("app/templates", exist_ok=True)
templates = Jinja2Templates(directory="app/templates")

@app.get("/login/google")
def login_google(request: Request):
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    if not client_id or not client_secret:
        return RedirectResponse(url="/configuracion?error=no_oauth_creds")
        
    flow = Flow.from_client_config(
        client_config={
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=["https://www.googleapis.com/auth/drive.readonly"]
    )
    
    redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI")
    if not redirect_uri:
        redirect_uri = f"{request.url.scheme}://{request.url.netloc}/auth/callback"
        
    flow.redirect_uri = redirect_uri
    
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )
    request.session["state"] = state
    if hasattr(flow, "code_verifier"):
        request.session["code_verifier"] = flow.code_verifier
    return RedirectResponse(authorization_url)

@app.get("/auth/callback")
def auth_callback(request: Request):
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    if not client_id or not client_secret:
        return RedirectResponse(url="/configuracion?error=no_oauth_creds")
    
    flow = Flow.from_client_config(
        client_config={
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=["https://www.googleapis.com/auth/drive.readonly"],
        state=request.session.get("state")
    )
    
    # Restore code_verifier to fix 'Missing code verifier' error
    if "code_verifier" in request.session:
        flow.code_verifier = request.session.pop("code_verifier")
        
    redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI")
    if not redirect_uri:
        redirect_uri = f"{request.url.scheme}://{request.url.netloc}/auth/callback"
        
    flow.redirect_uri = redirect_uri
    
    authorization_response = str(request.url)
    if "http://" in authorization_response and os.environ.get("GOOGLE_REDIRECT_URI", "").startswith("https"):
        authorization_response = authorization_response.replace("http://", "https://")
        
    flow.fetch_token(authorization_response=authorization_response)
    
    credentials = flow.credentials
    request.session["google_creds"] = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes
    }
    return RedirectResponse(url="/configuracion")

@app.get("/logout/google")
def logout_google(request: Request):
    request.session.pop("google_creds", None)
    return RedirectResponse(url="/configuracion")

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
    
    # Extraer lista única de años ordenada de manera descendente
    years = sorted(list(set(e.anio for e in expedientes if e.anio)), reverse=True)
    
    # Render main dashboard template
    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={
            "expedientes": expedientes,
            "years": years,
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
            "mapeo": mapeo,
            "google_connected": "google_creds" in request.session,
            "google_access_token": request.session.get("google_creds", {}).get("token", ""),
            "google_client_id": os.environ.get("GOOGLE_CLIENT_ID", ""),
            "google_api_key": os.environ.get("GOOGLE_API_KEY", "")
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

def scan_files_for_expediente(db: Session, exp: Expediente, folder_path: str):
    """
    Helper to walk through files of a single expediente folder and cache entries.
    """
    for sub_root, dirs, files in os.walk(folder_path):
        for file_name in files:
            if file_name.startswith(".") or file_name == "Thumbs.db":
                continue
            
            full_file_path = os.path.join(sub_root, file_name)
            rel_path = os.path.relpath(full_file_path, folder_path)
            
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
                # Register document; text extraction is deferred to background audit task
                doc_entry = Documento(
                    expediente_id=exp.id,
                    nombre_archivo=file_name,
                    ruta_relativa=rel_path,
                    tipo_archivo=file_name.split(".")[-1] if "." in file_name else "otro",
                    tamano_bytes=os.path.getsize(full_file_path),
                    texto_extraido=None,
                    paginas_totales=0
                )
                db.add(doc_entry)
    db.commit()

@app.post("/scan")
def scan_folders(
    request: Request,
    folder_id: str = Form(None),
    folder_name: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Scans folders. Supports both Google Drive API (if folder_id is supplied)
    and local filesystem directory scanning (fallback).
    """
    # 1. Google Drive Cloud Scan
    if folder_id:
        creds_dict = request.session.get("google_creds")
        if not creds_dict:
            return RedirectResponse(url="/login/google", status_code=303)
            
        try:
            from .services.drive import get_drive_service, scan_drive_folder_recursive
            service = get_drive_service(creds_dict)
            scan_drive_folder_recursive(db, service, folder_id)
        except Exception as e:
            print(f"Error scanning Google Drive: {str(e)}")
            
        return RedirectResponse(url="/", status_code=303)
        
    # 2. Local Filesystem Scan Fallback
    config = db.query(Configuration).first()
    if not config or not config.ruta_expedientes or not os.path.exists(config.ruta_expedientes):
        return RedirectResponse(url="/configuracion", status_code=303)
        
    root_path = config.ruta_expedientes
    
    # Iterate and detect subfolders
    for folder_name_local in os.listdir(root_path):
        full_folder_path = os.path.join(root_path, folder_name_local)
        if not os.path.isdir(full_folder_path) or folder_name_local.startswith("."):
            continue
            
        # Check if the folder name is a 4-digit year (e.g. 2020 to 2030)
        is_year_folder = folder_name_local.isdigit() and len(folder_name_local) == 4 and (2020 <= int(folder_name_local) <= 2030)
        
        if is_year_folder:
            # Iterate through the subfolders of this year folder
            for sub_name in os.listdir(full_folder_path):
                full_sub_path = os.path.join(full_folder_path, sub_name)
                if os.path.isdir(full_sub_path) and not sub_name.startswith("."):
                    rel_path = f"{folder_name_local}/{sub_name}"
                    exp = db.query(Expediente).filter(Expediente.ruta_relativa == rel_path).first()
                    if not exp:
                        exp = Expediente(
                            nombre_carpeta=sub_name,
                            ruta_relativa=rel_path,
                            anio=folder_name_local,
                            estado_analisis="Pendiente"
                        )
                        db.add(exp)
                        db.commit()
                        db.refresh(exp)
                        
                    scan_files_for_expediente(db, exp, full_sub_path)
        else:
            # Treat as a top-level expediente
            rel_path = folder_name_local
            exp = db.query(Expediente).filter(Expediente.ruta_relativa == rel_path).first()
            if not exp:
                guessed_year = "General"
                for word in folder_name_local.replace("-", " ").replace("_", " ").split():
                    if word.isdigit() and len(word) == 4 and (2020 <= int(word) <= 2030):
                        guessed_year = word
                        break
                exp = Expediente(
                    nombre_carpeta=folder_name_local,
                    ruta_relativa=rel_path,
                    anio=guessed_year,
                    estado_analisis="Pendiente"
                )
                db.add(exp)
                db.commit()
                db.refresh(exp)
                
            scan_files_for_expediente(db, exp, full_folder_path)
            
    return RedirectResponse(url="/", status_code=303)

@app.get("/scan")
def scan_folders_fallback():
    """
    Defensive redirection for GET requests to /scan.
    """
    return RedirectResponse(url="/", status_code=303)

@app.post("/audit/{exp_id}")
def run_audit(exp_id: int, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Triggers the audit task in the background using FastAPI workers.
    """
    exp = db.query(Expediente).filter(Expediente.id == exp_id).first()
    if exp:
        exp.estado_analisis = "Analizando"
        db.commit()
        
        # Get credentials if Google Drive is authorized
        creds_dict = request.session.get("google_creds")
        
        # Add to background worker queue
        background_tasks.add_task(audit_expediente_against_criteria, db, exp_id, creds_dict)
        
    return RedirectResponse(url="/", status_code=303)

@app.get("/audit/{exp_id}")
def run_audit_fallback(exp_id: int):
    """
    Defensive redirection for GET requests to /audit/{exp_id}.
    """
    return RedirectResponse(url="/", status_code=303)

@app.post("/audit-all")
def run_audit_all(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
        # Get credentials if Google Drive is authorized
        creds_dict = request.session.get("google_creds")
        
        # Add sequential bulk audit queue to background worker thread
        background_tasks.add_task(audit_all_expedientes_task, exp_ids, creds_dict)
        
    return RedirectResponse(url="/", status_code=303)

@app.get("/audit-all")
def run_audit_all_fallback():
    """
    Defensive redirection for GET requests to /audit-all.
    """
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
