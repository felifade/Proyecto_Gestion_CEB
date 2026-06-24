# Manual de Usuario - Auditor de Expedientes

El **Auditor de Expedientes** es una aplicación local para macOS diseñada para automatizar la auditoría de carpetas sincronizadas con Google Drive, cotejando su contenido contra una lista de criterios parametrizables (Lista de Cotejo) a través del motor semántico de **Google Gemini**.

---

## 🛠️ Requisitos de Sistema
* **Sistema Operativo:** macOS 11.0+ (compatible nativamente con Apple Silicon M1/M2/M3/M4 e Intel).
* **Python:** Versión 3.12 o superior instalada en el sistema.
* **Tesseract OCR (Opcional):** Si se planea analizar PDFs que consistan en imágenes escaneadas puras (sin capa de texto), se recomienda instalar Tesseract OCR vía Homebrew en la terminal:
  ```bash
  brew install tesseract tesseract-lang
  ```

---

## 📦 Instalación y Puesta en Marcha
1. **Ejecutar Instalador:**
   Abre la terminal en la carpeta `auditor-expedientes` y ejecuta el script de instalación:
   ```bash
   ./install.sh
   ```
   *Este script se encargará de crear el entorno virtual de Python (.venv) e instalar de forma segura las librerías necesarias.*

2. **Iniciar Aplicación (Lanzador):**
   Haz doble clic sobre el archivo ejecutable **`Auditor_Expedientes.command`** situado en la raíz del proyecto.
   * La terminal se abrirá ejecutando el servidor web local (`FastAPI`).
   * Tu navegador web predeterminado (Safari/Chrome/Edge) se abrirá automáticamente en: **`http://localhost:8000`**

---

## ⚙️ Configuración Inicial
Al abrir la aplicación por primera vez, navega a la sección **Configuración** en el menú superior e ingresa:

1. **Ruta del Directorio de Expedientes:**
   La ruta absoluta de la carpeta local sincronizada por Google Drive (ej: `/Users/usuario/Downloads/Expedientes por rubro de ingreso`).
2. **Ruta del Archivo Excel de Lista de Cotejo:**
   La ruta absoluta al archivo Excel que especifica los criterios de evaluación (ej: `/Users/usuario/Downloads/Lista_Cotejo.xlsx`).
3. **Clave de API de Gemini (API Key):**
   Tu clave de API de Google Gemini para realizar consultas al modelo semántico (`gemini-2.5-flash`). Puedes obtener una en Google AI Studio.
4. **Mapeo de Columnas:**
   Selecciona el nombre de las columnas de tu archivo Excel que correspondan a:
   * **Criterio / Regla:** Descripción de la regla a evaluar.
   * **Tipo / Rubro:** Categoría del criterio.
   * **Peso Ponderado:** Valor de importancia del criterio para el porcentaje.
   * **Documento Esperado:** Nombre del archivo o palabra clave a asociar (ej: "contrato", "garantía", "factura").

Presiona **Guardar y Cargar Parámetros**. Los criterios se importarán a la base de datos local SQLite.

---

## 🔍 Flujo de Uso Diario

### Paso 1: Escanear la Carpeta
En la página de inicio (Dashboard), haz clic en **Escanear Carpeta**.
* El sistema recorrerá el directorio raíz configurado y detectará las subcarpetas del primer nivel como expedientes individuales.
* Mapeará todos los archivos dentro de cada expediente y **extraerá su texto en segundo plano**, guardándolo en caché en la base de datos (evitando procesar el archivo nuevamente en análisis futuros).

### Paso 2: Ejecutar la Auditoría
En el listado del Dashboard, cada expediente se mostrará como **Pendiente**.
* Presiona el botón **Auditar** en la fila del expediente que desees evaluar.
* FastAPI enviará el contenido extraído relevante a la API de Gemini de forma asíncrona.
* Al finalizar, el estado cambiará a **Completado** y se calculará el porcentaje global de cumplimiento y la semaforización.

### Paso 3: Consultar Resultados y Evidencias
Haz clic en **Ver Detalle** en el expediente auditado.
* Se desplegará la lista de criterios evaluados.
* Cada criterio mostrará su veredicto (`Cumple`, `Cumple parcialmente` o `No cumple`).
* Se presentará la **observación oficial generada por la IA** y una sección de **Evidencias**, indicando el archivo exacto, la página y la cita textual que sustenta el veredicto.

### Paso 4: Exportación de Reportes
Desde la parte superior derecha del Dashboard, puedes descargar informes consolidados:
* **Excel Consolidado:** Matriz cruzada de expedientes (filas) y criterios (columnas) con formato condicional de semáforo.
* **Word Ejecutivo:** Documento formal con estadísticas globales y desgloses de hallazgos críticos de auditoría.
* **PDF Ejecutivo:** Documento limpio listo para firma y distribución.
