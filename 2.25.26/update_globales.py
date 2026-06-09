import os
import re
import csv
import json
import shutil
import difflib
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

def get_plantilla_docentes(script_dir):
    directorio_path = os.path.join(script_dir, "..", "Web_Portal", "directorio.js")
    if not os.path.exists(directorio_path):
        print(f"Error: no existe {directorio_path}")
        return set()
    with open(directorio_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Encontrar el bloque de directorioFallbackData
    match = re.search(r'const directorioFallbackData\s*=\s*(\[.*?\])\s*;', content, re.DOTALL)
    if not match:
        print("No se pudo extraer directorioFallbackData por JS parse")
        # Fallback a regex matching
        names = re.findall(r'"docente"\s*:\s*"([^"]+)"', content)
        return {clean_text(name) for name in names}
    try:
        data = json.loads(match.group(1))
        return {clean_text(d["docente"]) for d in data if "docente" in d}
    except Exception as e:
        print(f"Error al decodificar directorioFallbackData: {e}. Usando regex.")
        names = re.findall(r'"docente"\s*:\s*"([^"]+)"', content)
        return {clean_text(name) for name in names}

def find_similar_teacher(name, plantilla):
    # Buscar la coincidencia más cercana en plantilla
    matches = difflib.get_close_matches(name.upper(), [p.upper() for p in plantilla], n=1, cutoff=0.55)
    if matches:
        for p in plantilla:
            if p.upper() == matches[0]:
                return p
    return None

def split_teachers(teacher_string):
    if not teacher_string:
        return []
    # Dividir por '/' y limpiar espacios vacíos
    parts = [clean_text(p) for p in teacher_string.split('/')]
    return [p for p in parts if p and p.upper() not in ["", "VACANTE", "SIN DOCENTE"]]

def run_audit(exams, plantilla):
    warnings = []
    
    # 1. Auditoría de cruce de horarios para docentes (titular y apoyo)
    # Slot assignments: key = (teacher_name, fecha, horario), value = list of exams
    teacher_slots = {}
    
    for exam in exams:
        teachers = []
        if exam["docente_titular"]:
            teachers.extend(split_teachers(exam["docente_titular"]))
        if exam["docente_apoyo"]:
            teachers.extend(split_teachers(exam["docente_apoyo"]))
            
        for teacher in teachers:
            key = (teacher, exam["fecha"], exam["horario"])
            if key not in teacher_slots:
                teacher_slots[key] = []
            teacher_slots[key].append(exam)
            
    for (teacher, fecha, horario), assigned_exams in teacher_slots.items():
        # Obtener materias únicas
        unique_subjects = {e["materia"] for e in assigned_exams}
        if len(unique_subjects) > 1:
            groups = sorted(list({e["grupo"] for e in assigned_exams}))
            subjects_str = ", ".join(sorted(list(unique_subjects)))
            groups_str = ", ".join(groups)
            warnings.append({
                "type": "cruce_docente_materias_diferentes",
                "severity": "HIGH",
                "message": f"El docente {teacher} está programado para aplicar exámenes de materias diferentes al mismo tiempo ({fecha} {horario}): {subjects_str} en los grupos {groups_str}"
            })
            
    # 2. Auditoría de discrepancias de nombres con plantilla
    for exam in exams:
        for role, field in [("docente_titular", "docente_titular"), ("docente_apoyo", "docente_apoyo")]:
            teacher_string = exam[field]
            if not teacher_string:
                continue
                
            sub_teachers = split_teachers(teacher_string)
            for teacher in sub_teachers:
                # Si es un nombre extremadamente corto (como iniciales o un solo apellido abreviado, ej. SIVO, GRIN), omitimos
                if len(teacher) <= 5:
                    continue
                    
                if teacher not in plantilla:
                    closest = find_similar_teacher(teacher, plantilla)
                    if closest:
                        msg = f"Discrepancia en {exam['grupo']} - '{exam['materia']}': El docente programado para el examen es {teacher}, pero en la plantilla general es {closest}."
                    else:
                        msg = f"Docente '{teacher}' en {exam['grupo']} - '{exam['materia']}' no se encontró en la plantilla general."
                    
                    # Evitar alertas de advertencia idénticas
                    if msg not in [w["message"] for w in warnings]:
                        warnings.append({
                            "type": "discrepancia_plantilla",
                            "severity": "LOW",
                            "message": msg
                        })
                    
    return warnings

def write_js_database(exams, warnings, script_dir):
    js_path = os.path.join(script_dir, "..", "Web_Portal", "globales.js")
    
    data = {
        "exams": exams,
        "warnings": warnings
    }
    
    content = f"const globalesFallbackData = {json.dumps(data, ensure_ascii=False, indent=2)};\n"
    
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Base de datos escrita con éxito en {js_path}")

def write_csv_files(exams, script_dir):
    detalle_path = os.path.join(script_dir, "calendario_examenes_globales_detalle.csv")
    resumen_path = os.path.join(script_dir, "calendario_examenes_globales_resumen.csv")
    
    # 1. Escribir Detalle CSV
    # FECHA;HORARIO;SEMESTRE;TURNO;GRUPO;MATERIA (UAC);DOCENTE TITULAR;DOCENTE DE APOYO
    with open(detalle_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(["FECHA", "HORARIO", "SEMESTRE", "TURNO", "GRUPO", "MATERIA (UAC)", "DOCENTE TITULAR", "DOCENTE DE APOYO"])
        for e in exams:
            writer.writerow([e["fecha"], e["horario"], e["semestre"], e["turno"], e["grupo"], e["materia"], e["docente_titular"], e["docente_apoyo"]])
            
    # 2. Escribir Resumen CSV
    # Agrupar por todo excepto grupo
    grouped_map = {}
    grouped_list = []
    
    for e in exams:
        key = (e["fecha"], e["horario"], e["semestre"], e["turno"], e["materia"], e["docente_titular"], e["docente_apoyo"])
        if key not in grouped_map:
            grouped_map[key] = []
            grouped_list.append(key)
        grouped_map[key].append(e["grupo"])
        
    with open(resumen_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(["FECHA", "HORARIO", "SEMESTRE", "TURNO", "GRUPOS", "MATERIA (UAC)", "DOCENTE TITULAR", "DOCENTES DE APOYO"])
        for key in grouped_list:
            groups = sorted(grouped_map[key])
            groups_str = ", ".join(groups)
            writer.writerow([key[0], key[1], key[2], key[3], groups_str, key[4], key[5], key[6]])
            
    print(f"Archivos CSV escritos con éxito:\n - {detalle_path}\n - {resumen_path}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Parsear los exámenes
    exams = parse_exams()
    print(f"Total exámenes parseados: {len(exams)}")
    
    # 2. Cargar plantilla docente
    plantilla = get_plantilla_docentes(script_dir)
    print(f"Total docentes cargados de plantilla: {len(plantilla)}")
    
    # 3. Correr auditoría
    warnings = run_audit(exams, plantilla)
    print(f"Total advertencias de auditoría encontradas: {len(warnings)}")
    for w in warnings:
        print(f" [{w['severity']}] {w['message']}")
        
    # 4. Escribir archivos
    write_js_database(exams, warnings, script_dir)
    write_csv_files(exams, script_dir)
