# Memoria de Operaciones: 23 de Junio de 2026
**Proyecto: Gestión Escolar - CEB (Curso Intersemestral)**

Este documento resume los avances y logros de la sesión de hoy en relación a la incorporación de la materia de **Cultura Digital I** en la carpeta unificada `Intersemestral/`.

---

## 1. Organización del Cuadernillo y Recuperación de Archivos
*   **Archivos de Apoyo**: Se recuperaron y reubicaron los documentos oficiales de la materia en el directorio:
    `Intersemestral/Cultura_Digital_I/recuperacion/`
    *   `Cuadernillo_Cultura_Digital_I.pdf` (Cuadernillo oficial de trabajo)
    *   `Cuadernillo_Estudiante_Taller_Cultura.pdf` (Manual complementario del estudiante)
*   **Paridad en Nube**: Los archivos se colocaron tanto en la carpeta de iCloud Drive como en el almacenamiento de Google Drive del plantel.

---

## 2. Banco de 100 Preguntas de Opción Múltiple
*   Se ejecutó con éxito el script `crear_banco_preguntas.py` en la carpeta `examen/`, generando la base de datos de reactivos en formatos **JSON** (`preguntas_examen.json`) y **CSV** (`preguntas_examen.csv`).
*   Los reactivos están alineados al plan de estudios oficial del MCCEMS para el primer semestre y cubren 5 unidades temáticas (20 reactivos por unidad):
    *   **Unidad I**: Identidad Digital y Ciberseguridad
    *   **Unidad II**: Ofimática Colaborativa y Nube
    *   **Unidad III**: Hojas de Cálculo Básicas
    *   **Unidad IV**: Algoritmos y Pensamiento Computacional
    *   **Unidad V**: Introducción a la Programación (Scratch)

---

## 3. Examen Impreso en Word (DOCX) con Clave de Respuestas
*   Se creó y programó el compilador `generar_examen_docx.py`.
*   Se generó el archivo final `examen_cultura_digital_i.docx` con las siguientes características premium:
    *   Encabezado oficial institucional de la escuela: **CEB 5/4 "PROFR. RAFAEL RAMÍREZ"**.
    *   Recuadro de datos de identificación del estudiante y celda de calificación de 100 aciertos.
    *   Estilo limpio Arial de 9.5pt/9pt con controles de flujo de página para evitar incisos huérfanos.
    *   **Clave de Respuestas**: Cuadrícula compacta de 5x20 (una columna por cada unidad) al final del documento para facilitar y acelerar la calificación manual del docente.

---

## 4. Automatización para Google Forms
Para agilizar la carga del examen a la plataforma digital y evitar plagio/copia, se diseñaron dos scripts con la lógica de limpieza de incisos (`A)`, `B)`, `C)`, `D)`) y barajado aleatorio (shuffle) de opciones de respuesta por cada pregunta:
*   **Apps Script para Sheets (`crear_formulario_script.gs`)**: Permite la carga directa pegando la tabla de `preguntas_examen.csv` en una hoja de Google Sheets y ejecutando la macro.
*   **Python Forms API (`crear_formulario_api.py`)**: Para ejecución e integración programática directa utilizando la API de Google Forms de manera remota.

---

## 5. Sincronización Completa y Guías de Examen (Cultura Digital I, II y III)
*   **Guías de Examen**: Se crearon e integraron guías detalladas en formato Markdown (`Guia_Examen_Cultura_Digital_X.md`) en cada una de las carpetas de exámenes de la estructura `Intersemestral/`. Estas guías explican paso a paso cómo importar los archivos `.csv` a Google Sheets y ejecutar los macros de Apps Script para generar los cuestionarios autocalificables en Google Forms.
*   **Compleción de Cultura Digital III**: Se replicó con éxito la estructura completa del examen para la asignatura de **Cultura Digital III** (cuarto semestre):
    *   Generación del banco de 100 preguntas (`preguntas_examen.json` y `preguntas_examen.csv`) a partir de la base de datos de globales con formato e incisos estandarizados.
    *   Generación del examen físico impreso `examen_cultura_digital_iii.docx` con una clave de respuestas compacta adaptada a su formato de 4 unidades de 25 preguntas (matriz de 4x25).
    *   Creación de los scripts de automatización de Forms (`crear_formulario_script.gs` y `crear_formulario_api.py`) adaptados a 4 secciones.
*   **Sincronización por Rsync**: Se ejecutó un proceso de sincronización completa hacia Google Drive, asegurando que todos los entregables de Cultura Digital I, II y III queden disponibles de inmediato en la nube del plantel:
    `/Users/felipelopezsalazar/Library/CloudStorage/GoogleDrive-d.flopez54@dgb.edu.mx/Mi unidad/01_Trabajo_Academico/Ciclo_2025-2026/Semestre_B/04_Recursos_y_Apoyo/Intersemestral/`

---

## 6. Cuadernillos de Trabajo del Estudiante (Derecho a Examen)
Para homologar los requisitos del examen intersemestral para los alumnos de los tres semestres, se identificaron y copiaron los cuadernillos oficiales que sirven como guía y derecho de examen:
*   **Cultura Digital I**: `Cuadernillo_Cultura_Digital_I.pdf` (48 páginas) y `Cuadernillo_Estudiante_Taller_Cultura.pdf` (28 páginas).
*   **Cultura Digital II**: Copiado y renombrado como `Cuadernillo_Cultura_Digital_II.pdf` (el cuaderno de trabajo oficial de 20 páginas estructurado institucionalmente).
*   **Cultura Digital III**: Copiado y renombrado como `Cuadernillo_Cultura_Digital_III.pdf` (el cuaderno de trabajo oficial de 20 páginas con su portada, recibo y carta compromiso).

---

## 7. Separación Definitiva: Curso Intersemestral vs. Guía de Examen
A solicitud del usuario, se realizó una separación estricta del material de trabajo de acuerdo a la modalidad de regularización:
1.  **Curso Intersemestral (Recuperación Grupal)**:
    *   Ubicación: Carpeta `recuperacion/` de cada asignatura.
    *   Contenido: El manual de recuperación académica de 12 páginas (`manual_recuperacion.pdf` y `manual_recuperacion.docx`) con su código HTML base y diagramas programáticos.
    *   **Cultura Digital I**: Se ejecutó con éxito el script `generar_recuperacion.py` para compilar programáticamente el manual de 12 páginas con sus 6 diagramas Pillow personalizados y la carta compromiso fusionada en la página 2.
    *   **Limpieza de Duplicados**: Se eliminaron los cuadernillos de examen duplicados (`Cuaderno_Trabajo_Intersemestral_CDII.pdf` y `Cuaderno_Trabajo_Intersemestral_CDIII.pdf`) que se encontraban incorrectamente dentro de la carpeta `recuperacion/` en Cultura Digital II y III.
2.  **Examen / Derecho a Examen (Título / Regularización Directa)**:
    *   Ubicación: Carpeta `examen/` de cada asignatura.
    *   Contenido: La guía de estudio oficial (`Cuadernillo_Cultura_Digital_X.pdf`), el banco de preguntas CSV/JSON, el examen físico imprimible (.docx) y los scripts de Apps Script y API de Forms.
3.  **Manual de Derecho a Examen para el Alumno (Carpeta `guia_derecho_examen/`)**:
    *   **Cultura Digital II y III**: Se diseñaron y generaron de forma automatizada guías/manuales específicos de estudio para el alumno. Se colocaron en la carpeta `guia_derecho_examen/` de cada materia.
    *   **Contenido**: Cada guía incluye:
        1. *Síntesis Temática*: Resumen teórico detallado por unidad con todos los conceptos evaluados en el examen.
        2. *Cuestionario Práctico*: Las 100 preguntas del banco con su respuesta correcta asignada y una **caja de justificación** para que el alumno complete a mano explicando la teoría de la respuesta.
        3. *Actividades de Desarrollo*: Ejercicios específicos de la materia (tablas de roles, dibujos de topologías, guiones de podcast, análisis de seguridad).
        4. *Lista de Cotejo*: Tabla de evaluación de 10 puntos para validar el entregable del alumno.
    *   **Formatos**: Se generaron archivos editables en Word (`Guia_Derecho_Examen_Cultura_Digital_X.docx`) e imprimibles en PDF (`Guia_Derecho_Examen_Cultura_Digital_X.pdf`) con su HTML base.
    *   **Mejoras de Presentación (Layout)**:
        *   *Logotipo*: Se corrigió el orden de copia del logotipo (`logo.png`) para asegurar su correcta visualización y renderizado en la portada y encabezado del PDF compilado mediante Headless Chrome.
        *   *Saltos de Página*: Se aplicó la propiedad CSS `page-break-inside: avoid;` en las tarjetas de reactivos, síntesis y bloques de actividades del PDF para evitar cortes arbitrarios de contenido a mitad de hoja.
        *   *Área de Trabajo*: En la versión Word (.docx), se sustituyó el espacio en blanco por una tabla estructurada de una celda con borde (caja de trabajo de 3.5 pulgadas de alto) para las actividades, previniendo desbordes accidentales de página y delimitando claramente la zona de escritura del alumno.

## 8. Optimización del Control de Horarios y Docentes (Archivo Excel)
Se realizaron mejoras de presentación y de inteligencia de datos en el libro central de horarios: **`INTERSEMESTRAL SEMESTRE _B_ 2025-2026.xlsx`**.
1. **Reordenación y Enfoque**: Se reordenaron las hojas del libro para que la hoja **`Intersemestrales`** (el calendario base) ocupe la posición número 1 (index 0) al abrir el archivo, en lugar de hojas obsoletas anteriores.
2. **Presentación Profesional de la Primera Hoja (`Intersemestrales`)**:
   - **Corrección de Título**: Se actualizó el encabezado de la celda B3 de `2023-2024` a `SEMESTRE "B" 2025-2026` para reflejar el ciclo escolar activo.
   - **Estilo de Encabezados**: Se aplicó una fila de títulos con fuente Arial de 10pt en negrita, color blanco y fondo azul marino institucional, con una altura de fila de 28.
   - **Formato de Datos**: Se aplicó formato de fuente Arial de 9pt, alineación centrada para datos clave (semestre, horarios, salón y turno) y alineación izquierda para asignaturas y nombres de docentes.
   - **Diseño Cebra y Rejilla**: Se implementó zebra striping (filas pares en gris claro y nones en blanco) para facilitar el seguimiento visual, bordes delgados grises y se forzó la visualización de líneas de división (`showGridLines`).
   - **Autoajuste**: Se redimensionaron automáticamente las columnas al ancho del texto más largo para evitar datos cortados.
3. **Filtro Dinámico Interactivo (Dashboard de Consulta)**:
   - Se creó una nueva hoja llamada **`Filtro Intersemestral`** (ubicada en la posición 2 del libro).
   - **Controles Desplegables**: Se configuraron tres menús de selección (Data Validation) en celdas unificadas: *Docente* (ligado a una lista única y ordenada alfabéticamente en la hoja oculta `Listas_Aux`), *Horario* (lista única de rangos horarios) y *Turno* (Matutino/vespertino).
   - **Fórmula Inteligente de Extracción**: Se programó la fórmula matricial `=FILTRAR(...)` (con los parámetros en inglés `_xlfn.FILTER` y `IF` para compatibilidad nativa en XML) que extrae en tiempo real los registros coincidentes cuando el usuario interactúa con los filtros, mostrando "Sin coincidencias" si la combinación no existe.

**Sincronización Cloud**: Se guardaron los cambios directamente en Google Drive y se copió la versión final del libro de Excel optimizado en la ruta de iCloud Drive para que coincida perfectamente con la nube del plantel.

