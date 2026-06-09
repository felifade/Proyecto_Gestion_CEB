import os
import re
import csv
import json
import shutil
import pdfplumber

# Mapeo de archivos, semestres y turnos
PDF_FILES = [
    {"filename": "globales sem b 25-26 - 2do M.pdf", "semestre": "2", "turno": "Matutino"},
    {"filename": "globales sem b 25-26 - 2do V.pdf", "semestre": "2", "turno": "Vespertino"},
    {"filename": "globales sem b 25-26 - 4TO M.pdf", "semestre": "4", "turno": "Matutino"},
    {"filename": "globales sem b 25-26 - 4TO V.pdf", "semestre": "4", "turno": "Vespertino"},
    {"filename": "globales sem b 25-26 - 6TO M.pdf", "semestre": "6", "turno": "Matutino"},
    {"filename": "globales sem b 25-26 - 6TO V.pdf", "semestre": "6", "turno": "Vespertino"},
]

def clean_text(text):
    if not text:
        return ""
    # Reemplazar saltos de línea por espacios y quitar espacios dobles
    text = text.replace("\n", " ").strip()
    return re.sub(r'\s+', ' ', text)

def parse_exams():
    all_exams = []
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    for pdf_info in PDF_FILES:
        pdf_path = os.path.join(script_dir, pdf_info["filename"])
        if not os.path.exists(pdf_path):
            print(f"Advertencia: No existe {pdf_path}")
            continue
            
        print(f"Procesando {pdf_info['filename']}...")
        
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    # Variables de estado para propagar celdas combinadas (None)
                    curr_fecha = ""
                    curr_materia = ""
                    curr_horario = ""
                    curr_titular = ""
                    
                    # Encontrar fila de cabecera
                    header_index = -1
                    for idx, row in enumerate(table):
                        if row and "FECHA" in [clean_text(cell) for cell in row if cell]:
                            header_index = idx
                            break
                            
                    if header_index == -1:
                        continue # Omitir páginas sin cabecera
                        
                    for row in table[header_index + 1:]:
                        # Omitir filas vacías o con formato institucional/pie de página
                        clean_row = [clean_text(cell) for cell in row]
                        if not any(clean_row) or "ATENTAMENTE" in clean_row[0] or "NOTA:" in clean_row[0]:
                            continue
                            
                        # Propagar celdas combinadas si no son nulas
                        if row[0]: curr_fecha = clean_text(row[0])
                        if row[1]: curr_materia = clean_text(row[1])
                        if row[2]: curr_horario = clean_text(row[2])
                        if row[4]: curr_titular = clean_text(row[4])
                        
                        grupo_raw = clean_text(row[3])
                        if not grupo_raw:
                            continue # Fila sin grupo
                            
                        docente_apoyo = clean_text(row[5]) if len(row) > 5 else ""
                        
                        # Formatear grupo (M201, V207)
                        shift_prefix = "M" if pdf_info["turno"] == "Matutino" else "V"
                        grupo_code = f"{shift_prefix}{grupo_raw}"
                        
                        all_exams.append({
                            "fecha": curr_fecha,
                            "materia": curr_materia,
                            "horario": curr_horario,
                            "grupo": grupo_code,
                            "semestre": pdf_info["semestre"],
                            "turno": pdf_info["turno"],
                            "docente_titular": curr_titular,
                            "docente_apoyo": docente_apoyo
                        })
    return all_exams

if __name__ == "__main__":
    exams = parse_exams()
    print(f"Total exámenes parseados: {len(exams)}")
