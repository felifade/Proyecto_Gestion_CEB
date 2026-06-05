# Proyecto de Gestión Escolar - Centro de Estudios de Bachillerato (CEB)

Bienvenido a tu nuevo sistema de gestión escolar organizado. Este proyecto ha sido diseñado específicamente para estructurar todas las áreas de la subdirección, dirección y coordinación administrativa, integrando plantillas de control y un portal web premium para visualizar tus procesos y acceder rápidamente a tus documentos de Google institucional y personal.

---

## 📂 Estructura General del Proyecto

El proyecto está organizado en las siguientes carpetas numeradas:

1.  **`00_Memorias_y_Bitacoras/`**: Centraliza el control operativo.
    *   `Bitacora_Reuniones.md`: Plantilla para actas de reuniones oficiales.
    *   `Control_Proyectos_Calendario.md`: Seguimiento de fechas límite, tutores, matrícula por grupos y directorio centralizado de Drive.
    *   `Guia_Cuentas.md`: Guía de permisos para sincronizar tu cuenta institucional y personal.
    *   `README.md`: Explicación detallada de esta carpeta de memorias.
    *   `00.1_Minutas_y_Acuerdos/` y `00.2_Planificacion_y_Seguimiento/` para almacenar PDFs o minutas firmadas.
2.  **`01_Direccion/`**: Gestión de Dirección general.
    *   `01.1_Recursos_Humanos/`: Carpeta vacía para expedientes e incidencias del personal.
    *   `01.2_Normatividad/`: Contiene las **16 normas de la oposición (PDFs)** y otros marcos educativos (Marco para la Excelencia, acuerdo de Promoción Vertical, etc.), además de un archivo `normas_mapeo.json` que contiene sus títulos y descripciones oficiales.
3.  **`02_Subdireccion/`**: El núcleo de la administración escolar.
    *   `02.1_Control_Escolar/`: Inscripciones, acreditaciones y expedientes de alumnos.
    *   `02.2_Docentes/`: Horarios de profesores, materias asignadas y planeaciones didácticas.
    *   `02.3_Orientacion_Educativa/` y `02.4_Tutorias/`: Seguimiento psicopedagógico y tutorías.
    *   `02.5_Biblioteca/`: Control de préstamo de libros.
4.  **`03_Coordinacion_Administrativa/`**: Gestión de recursos materiales.
    *   `03.1_Inventarios/`: Inventario físico de activos fijos, consumibles e infraestructura.
5.  **`Web_Portal/`**: Código del portal web administrativo.
    *   `index.html`: Estructura del sitio web.
    *   `styles.css`: Estilos visuales con diseño premium (modo oscuro, glassmorphism, micro-animaciones).
    *   `app.js`: Lógica interactiva, buscador inteligente y visualizador de procesos.
    *   `config.json`: Archivo de configuración para centralizar y editar tus enlaces de Google Docs/Sheets.

---

## 🌐 Cómo usar el Portal Web Administrativo

El portal web te permite navegar por las diferentes áreas y ver los diagramas de flujo de los procesos escolares (ej. inscripción, inventarios, tutorías). Además, tiene un buscador inteligente que busca en las 16 normas y en las secciones.

### Paso 1: Abrir el Portal
Tienes dos formas de abrir el sitio web:
1.  **Doble clic:** Ve a la carpeta `Web_Portal` y haz doble clic sobre el archivo `index.html`. Se abrirá directamente en tu navegador (Safari, Chrome o Edge). Hemos diseñado el código con compatibilidad local para que el sitio funcione perfectamente aunque no utilices un servidor local.
2.  **Servidor Local (Recomendado si quieres evitar restricciones del navegador):** Si prefieres servirlo localmente, puedes ejecutar en la terminal de tu computadora estando en la carpeta del portal:
    ```bash
    python3 -m http.server 8000
    ```
    Y abrir en tu navegador: [http://localhost:8000](http://localhost:8000)

### Paso 2: Vincular tus Hojas de Cálculo y Documentos de Google
Para que los botones del portal abran tus plantillas reales de Google Drive:
1.  Abre el archivo `Web_Portal/config.json` con cualquier editor de texto o pídemelo aquí.
2.  Pega los enlaces compartidos de tus Google Sheets de horarios, matrícula, inventario, etc., dentro de los campos correspondientes.
3.  Guarda el archivo. Al actualizar la página del portal web, todos los enlaces se abrirán en una nueva pestaña.

---

## 📚 Consulta de las 16 Normas
Las 16 normas se encuentran en `01_Direccion/01.2_Normatividad/`. Desde el portal web, en la sección **Dirección**, podrás hacer clic en el botón **Leer** de cualquier norma para abrir su correspondiente archivo PDF local en el navegador, ideal para estudiar o consultar de manera rápida.
