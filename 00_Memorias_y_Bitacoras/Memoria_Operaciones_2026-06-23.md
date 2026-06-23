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

**Sincronización Cloud**: Se sincronizó el repositorio completo por `rsync` hacia Google Drive, reflejando de inmediato la eliminación de los archivos duplicados y la adición del nuevo manual de recuperación de Cultura Digital I.



