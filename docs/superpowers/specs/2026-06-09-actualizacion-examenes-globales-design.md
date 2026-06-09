# Especificación de Diseño: Actualización de Exámenes Globales v2.0

Este documento detalla el diseño para actualizar la sección de Exámenes Globales en el Portal Web con las nuevas modificaciones de la versión 2.0 (que incluyen docentes de apoyo y asignaciones actualizadas).

## Objetivo
Actualizar la base de datos de exámenes globales en la aplicación web (`Web_Portal/globales.js`), regenerar los archivos CSV (`calendario_examenes_globales_detalle.csv` y `calendario_examenes_globales_resumen.csv`) y reemplazar los PDFs antiguos en `2.25.26/` con las versiones actualizadas de `2.25.26/Globales V 2.0/`.

---

## 🛠️ Enfoque Propuesto: Script de Automatización en Python (`update_globales.py`)

Para garantizar precisión absoluta y facilitar futuras actualizaciones, desarrollaremos un script en Python que automatice el proceso de extracción, auditoría y exportación de datos.

### 1. Reemplazo de Archivos PDF
El script copiará los 6 archivos PDF desde la carpeta `2.25.26/Globales V 2.0/` a `2.25.26/`, sobrescribiendo las versiones antiguas.

### 2. Motor de Extracción con `pdfplumber`
El script procesará los siguientes archivos:
- `globales sem b 25-26 - 2do M.pdf` (Semestre 2, Turno M)
- `globales sem b 25-26 - 2do V.pdf` (Semestre 2, Turno V)
- `globales sem b 25-26 - 4TO M.pdf` (Semestre 4, Turno M)
- `globales sem b 25-26 - 4TO V.pdf` (Semestre 4, Turno V)
- `globales sem b 25-26 - 6TO M.pdf` (Semestre 6, Turno M)
- `globales sem b 25-26 - 6TO V.pdf` (Semestre 6, Turno V)

#### Algoritmo de extracción por PDF:
1. Extraer la tabla de cada página usando `extract_tables()`.
2. Omitir filas de encabezado y metadatos del PDF.
3. Mantener variables de estado persistentes: `fecha`, `materia`, `horario` y `docente_titular`.
4. Si la celda contiene un valor no nulo, actualizar la variable de estado correspondiente (eliminando saltos de línea y normalizando espacios).
5. Para celdas nulas (`None`), heredar el último valor de la variable de estado.
6. Formatear el código del grupo agregando el prefijo del turno (ej: `201` en matutino -> `M201`).
7. Extraer el docente de apoyo si está presente en la fila.

### 3. Lógica de Auditoría de Conflictos
El script analizará los datos extraídos para generar advertencias en dos categorías:
- **Cruces de horarios (`cruce_docente_materias_diferentes`):** Si un docente (titular o apoyo) tiene asignadas materias distintas en la misma fecha y hora. Severidad: `HIGH`.
- **Discrepancia de plantilla (`discrepancia_plantilla`):** Si el nombre del docente en el examen no coincide exactamente con el listado oficial en `Web_Portal/directorio.js`. Severidad: `LOW`.

### 4. Generación de Archivos de Salida
- **`Web_Portal/globales.js`**: Escribir el objeto JS con los datos de exámenes y advertencias generados.
- **`2.25.26/calendario_examenes_globales_detalle.csv`**: CSV con una fila por examen/grupo individual.
- **`2.25.26/calendario_examenes_globales_resumen.csv`**: CSV agrupando los exámenes concurrentes por docente y materia en una sola fila.

---

## 🧪 Plan de Verificación

1. **Prueba de Extracción:** Ejecutar el script y validar que se extraigan exactamente la cantidad esperada de registros.
2. **Validación de Datos:** Comparar una muestra de registros del nuevo `globales.js` contra los PDFs originales para verificar que los docentes de apoyo se mapeen correctamente a sus respectivos grupos.
3. **Verificación de Auditoría:** Confirmar que se generen advertencias válidas para cruces de maestros o nombres inconsistentes.
4. **Verificación en Navegador:** Abrir el portal localmente en `Web_Portal/index.html` y comprobar en la sección "Exámenes Globales" que el listado, la vista de tarjetas diarias y el buscador funcionen perfectamente con la nueva información.
