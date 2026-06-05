# Guía de Convivencia y Permisos de Cuentas Google - CEB

Para este proyecto utilizaremos dos tipos de cuentas Google:
1.  **Cuenta Institucional de la Escuela:** Donde residen los datos oficiales de alumnos, docentes, horarios, plantillas administrativas e inventarios.
2.  **Cuenta Personal (donde usas Gemini Pro):** Donde manejas las automatizaciones, análisis avanzados y el desarrollo de este sistema de gestión.

Esta guía te ayudará a configurar la colaboración entre ambas cuentas de forma segura y transparente.

---

## 🔒 Configuración Recomendada de Permisos

Dado que las cuentas institucionales suelen tener restricciones de seguridad (por ejemplo, no poder compartir carpetas completas hacia afuera del dominio institucional), la mejor estrategia es:

### Método A: Compartir de Institucional a Personal (Lectura y Escritura)
1.  **Crea una carpeta compartida** en tu Google Drive institucional llamada `Compartido_Subdireccion_Gestion`.
2.  Haz clic derecho sobre la carpeta -> **Compartir**.
3.  Escribe tu **correo electrónico personal** (donde tienes Gemini Pro).
4.  Establece el permiso como **Editor** para que puedas modificar documentos desde tu cuenta personal si es necesario.
5.  *Nota:* Si el administrador institucional prohíbe compartir carpetas hacia afuera, deberás compartir los archivos críticos (Sheets específicos de horarios o inventarios) de manera individual, o utilizar el **Método B**.

### Método B: Compartir de Personal a Institucional
1.  Crea la carpeta de gestión en tu **Drive Personal**.
2.  Comparte la carpeta con tu **correo institucional** dándole permisos de **Editor**.
3.  Desde tu cuenta institucional, podrás acceder a esta carpeta en la sección "Compartidos conmigo" y trabajar sin problemas, mientras que tu cuenta personal mantendrá el control total del archivo y la integración con Gemini Pro.

---

## 💡 Buenas Prácticas para Google Sheets y Docs

*   **Copias de Respaldo:** Te recomendamos crear un respaldo automático o manual de los Google Sheets clave (Horarios, Inventarios) una vez a la semana en tu Drive Personal.
*   **Gestión de Enlaces:** Utiliza siempre la opción "Cualquier persona con el enlace puede ver" en los archivos que vayas a enlazar en el **Portal Web** si deseas que otras personas del plantel (docentes u orientadores) lo consulten rápidamente sin tener que iniciar sesión obligatoriamente.
*   **Seguridad:** Nunca compartas información confidencial o sensible de los estudiantes (como expedientes médicos, calificaciones individuales o datos personales) con permisos abiertos de lectura pública. Utiliza la restricción "Restringido: Solo las personas añadidas pueden abrir el enlace".

---

## 🔗 Cómo actualizar los enlaces del Portal Web

El portal web utiliza un archivo llamado `config.json` en la carpeta `Web_Portal/`.
Para actualizar un enlace:
1. Abre tu Google Sheet o Doc.
2. Copia la dirección web (URL) completa desde la barra de direcciones de tu navegador.
3. Abre `config.json` en este sistema de archivos o mediante Gemini Pro.
4. Pega la URL en el campo correspondiente (por ejemplo, `horariosUrl`).
5. El portal web reflejará el cambio de inmediato y abrirá el documento adecuado al presionar el botón del menú.
