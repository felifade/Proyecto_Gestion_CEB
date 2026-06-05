import sys
import os
import urllib.request
import csv
import json
import re

def get_sheet_csv_url(sheet_url):
    """
    Convierte una URL normal de Google Sheets en su correspondiente URL de exportación CSV.
    """
    # Expresión regular para extraer el ID de la hoja de cálculo
    match = re.search(r'/spreadsheets/d/([a-zA-Z0-9-_]+)', sheet_url)
    if not match:
        raise ValueError("URL de Google Sheets inválida. No se pudo encontrar el ID de la hoja.")
    
    sheet_id = match.group(1)
    
    # Extraer el ID de la pestaña específica (gid) si existe, de lo contrario no agregar gid
    gid_match = re.search(r'[#&]gid=([0-9]+)', sheet_url)
    if gid_match:
        return f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid_match.group(1)}"
    else:
        return f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"

def read_google_sheet(sheet_url):
    """
    Descarga el contenido de la hoja en formato CSV y lo parsea.
    """
    csv_url = get_sheet_csv_url(sheet_url)
    print(f"Descargando datos desde la URL de exportación...")
    
    # Configurar headers para simular un navegador
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    req = urllib.request.Request(csv_url, headers=headers)
    
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        
    # Leer el CSV
    csv_reader = csv.reader(content.splitlines())
    rows = list(csv_reader)
    
    return rows

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 read_sheet.py <URL_DE_GOOGLE_SHEETS> [nombre_salida.json]")
        sys.exit(1)
        
    url = sys.argv[1]
    output_filename = sys.argv[2] if len(sys.argv) > 2 else "sheet_data_preview.json"
    
    try:
        data_rows = read_google_sheet(url)
        if not data_rows:
            print("La hoja está vacía.")
            sys.exit(0)
            
        headers = data_rows[0]
        rows = data_rows[1:]
        
        # Estructurar la información
        structured_data = {
            "headers": headers,
            "total_rows": len(rows),
            "rows": rows # Guardar todas las filas para análisis completo
        }
        
        # Guardar en JSON en el mismo directorio del script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(script_dir, output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(structured_data, f, ensure_ascii=False, indent=2)
            
        print(f"\n¡Éxito! Se leyeron {len(rows)} filas.")
        print(f"Columnas detectadas: {', '.join(headers)}")
        print(f"Los datos se guardaron temporalmente en: {output_path}")
        
    except Exception as e:
        print(f"Error al leer la hoja de cálculo: {str(e)}")
        print("Asegúrate de que la hoja de cálculo de Google tenga activado el permiso:")
        print("'Cualquier persona con el enlace puede ver' (Lector).")
        sys.exit(1)
