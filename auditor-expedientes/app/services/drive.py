from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from sqlalchemy.orm import Session
from ..models import Expediente, Documento

def get_drive_service(creds_dict: dict):
    """
    Returns an authorized Google Drive API client using user OAuth credentials.
    """
    creds = Credentials.from_authorized_user_info(creds_dict)
    return build('drive', 'v3', credentials=creds)

def list_files_in_folder(service, folder_id: str):
    """
    Lists all files and subfolders directly inside a Google Drive folder.
    Handles pagination to ensure folders with >1000 items are fully listed.
    """
    query = f"'{folder_id}' in parents and trashed = false"
    all_files = []
    page_token = None
    
    while True:
        results = service.files().list(
            q=query,
            fields="nextPageToken, files(id, name, mimeType, size)",
            pageSize=1000,
            pageToken=page_token
        ).execute()
        
        all_files.extend(results.get('files', []))
        page_token = results.get('nextPageToken')
        if not page_token:
            break
    
    return all_files

def scan_drive_folder_recursive(db: Session, service, root_folder_id: str, folder_name: str = None, is_single_exp: bool = False):
    """
    Scans the Google Drive root folder. If is_single_exp is True, treats the 
    root folder as the one and only expediente. Otherwise, recursively detects
    year-based structures and registers folders and files in the database.
    """
    top_items = list_files_in_folder(service, root_folder_id)
    
    # Helper to register files for an expediente
    def scan_files_for_exp_drive(exp, folder_id, current_rel_path=""):
        items = list_files_in_folder(service, folder_id)
        for item in items:
            mime = item.get('mimeType', '')
            name = item.get('name', '')
            if name.startswith("."):
                continue
                
            # If subfolder inside the contract folder, recurse to find files
            if mime == 'application/vnd.google-apps.folder':
                sub_rel_path = f"{current_rel_path}/{name}" if current_rel_path else name
                scan_files_for_exp_drive(exp, item['id'], sub_rel_path)
            else:
                # Register file
                # Skip large files (> 20 MB)
                size_str = item.get('size', '0')
                size_bytes = int(size_str) if size_str.isdigit() else 0
                if size_bytes > 20 * 1024 * 1024:
                    continue
                    
                rel_file_path = f"{current_rel_path}/{name}" if current_rel_path else name
                
                # Check if document already exists
                doc = db.query(Documento).filter(
                    Documento.expediente_id == exp.id,
                    Documento.nombre_archivo == name,
                    Documento.ruta_relativa == rel_file_path
                ).first()
                
                if not doc:
                    doc = Documento(
                        expediente_id=exp.id,
                        nombre_archivo=name,
                        ruta_relativa=rel_file_path,
                        tipo_archivo=name.split(".")[-1] if "." in name else "otro",
                        tamano_bytes=size_bytes,
                        texto_extraido=None,
                        paginas_totales=0,
                        google_drive_file_id=item['id']
                    )
                    db.add(doc)
        db.commit()

    if is_single_exp:
        # User selected a specific expediente folder
        name = folder_name or "Expediente_Directo"
        exp = db.query(Expediente).filter(Expediente.google_drive_folder_id == root_folder_id).first()
        if not exp:
            exp = db.query(Expediente).filter(Expediente.ruta_relativa == name).first()
            
        if not exp:
            exp = Expediente(
                nombre_carpeta=name,
                ruta_relativa=name,
                anio="General",
                google_drive_folder_id=root_folder_id,
                estado_analisis="Pendiente"
            )
            db.add(exp)
            db.commit()
            db.refresh(exp)
        else:
            exp.google_drive_folder_id = root_folder_id
            db.commit()
            
        scan_files_for_exp_drive(exp, root_folder_id)
        return

    # Iterate over top items in the root folder
    for item in top_items:
        mime = item.get('mimeType', '')
        name = item.get('name', '')
        if mime != 'application/vnd.google-apps.folder' or name.startswith("."):
            continue
            
        # Check if the folder is a 4-digit year (e.g. 2020 to 2030)
        is_year_folder = name.isdigit() and len(name) == 4 and (2020 <= int(name) <= 2030)
        
        if is_year_folder:
            # Iterate through the subfolders of this year folder
            year_subfolders = list_files_in_folder(service, item['id'])
            for sub in year_subfolders:
                sub_mime = sub.get('mimeType', '')
                sub_name = sub.get('name', '')
                if sub_mime == 'application/vnd.google-apps.folder' and not sub_name.startswith("."):
                    rel_path = f"{name}/{sub_name}"
                    exp = db.query(Expediente).filter(Expediente.ruta_relativa == rel_path).first()
                    if not exp:
                        exp = Expediente(
                            nombre_carpeta=sub_name,
                            ruta_relativa=rel_path,
                            anio=name,
                            google_drive_folder_id=sub['id'],
                            estado_analisis="Pendiente"
                        )
                        db.add(exp)
                        db.commit()
                        db.refresh(exp)
                    else:
                        exp.google_drive_folder_id = sub['id']
                        db.commit()
                        
                    scan_files_for_exp_drive(exp, sub['id'])
        else:
            # Treat as a top-level expediente
            rel_path = name
            exp = db.query(Expediente).filter(Expediente.ruta_relativa == rel_path).first()
            if not exp:
                guessed_year = "General"
                for word in name.replace("-", " ").replace("_", " ").split():
                    if word.isdigit() and len(word) == 4 and (2020 <= int(word) <= 2030):
                        guessed_year = word
                        break
                exp = Expediente(
                    nombre_carpeta=name,
                    ruta_relativa=rel_path,
                    anio=guessed_year,
                    google_drive_folder_id=item['id'],
                    estado_analisis="Pendiente"
                )
                db.add(exp)
                db.commit()
                db.refresh(exp)
            else:
                exp.google_drive_folder_id = item['id']
                db.commit()
                
            scan_files_for_exp_drive(exp, item['id'])
