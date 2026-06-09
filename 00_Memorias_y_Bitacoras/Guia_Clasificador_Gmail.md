# Guía de Clasificación de Correos con Gemini en Gmail (Método A)

Esta guía explica cómo configurar un sistema de automatización en tu cuenta personal de Google para clasificar correos del CEB de forma 100% automática, aplicar etiquetas en Gmail y generar borradores de respuesta con inteligencia artificial (Gemini 2.5 Flash o Pro).

---

## Paso 1: Configurar el Reenvío Automático en tu Gmail Institucional
Para recibir los correos institucionales en tu cuenta personal:
1. Entra a tu **Gmail Institucional**.
2. Ve a **Configuración** (icono de engranaje) > **Ver toda la configuración**.
3. Selecciona la pestaña **Reenvío y correo POP/IMAP**.
4. Haz clic en **Añadir una dirección de reenvío** e introduce tu correo personal.
5. Sigue los pasos de confirmación (te llegará un código a tu correo personal que debes ingresar en tu cuenta institucional).
6. Activa la casilla **Reenviar una copia del correo entrante a...**. *Tip:* Puedes configurar que se reenvíen todos los correos o crear un filtro para reenviar solo los que contengan palabras específicas (ej. "justificante", "alumno", "padre").

---

## Paso 2: Crear el Filtro en tu Gmail Personal
Para que el script identifique qué correos debe procesar:
1. Entra a tu **Gmail Personal**.
2. Ve a **Configuración** > **Filtros y direcciones bloqueadas** > **Crear un filtro**.
3. En el campo **Para** (o si vienen reenviados, en **De**), introduce tu correo institucional.
4. Haz clic en **Crear filtro**.
5. Activa la casilla **Aplicar la etiqueta** y crea una etiqueta nueva llamada **`Clasificar-CEB`**.
6. Haz clic en **Crear filtro**.

---

## Paso 3: Instalar el Google Apps Script
1. Ve a [script.google.com](https://script.google.com) desde tu cuenta personal de Google.
2. Haz clic en **Nuevo proyecto**.
3. Borra el código existente y pega el siguiente script:

```javascript
// ==========================================================================
// CONFIGURACIÓN PRINCIPAL
// ==========================================================================
const GEMINI_API_KEY = 'TU_GEMINI_API_KEY_AQUÍ'; // Pega tu clave de Google AI Studio
const MODEL_NAME = 'gemini-2.5-flash';           // Puedes cambiar a 'gemini-2.5-pro' si deseas máxima precisión
const LABEL_TO_PROCESS = 'Clasificar-CEB';       // Etiqueta de entrada
const LABEL_PROCESSED = 'Clasificado-CEB';       // Etiqueta de salida final

/**
 * Función principal que busca correos sin procesar, los clasifica con Gemini,
 * les aplica etiquetas de categoría/prioridad y les crea un borrador de respuesta.
 */
function clasificarCorreosCEB() {
  const labelPending = GmailApp.getUserLabelByName(LABEL_TO_PROCESS);
  let labelDone = GmailApp.getUserLabelByName(LABEL_PROCESSED);
  
  if (!labelPending) {
    Logger.log("No se encontró la etiqueta de entrada: " + LABEL_TO_PROCESS);
    return;
  }
  if (!labelDone) {
    labelDone = GmailApp.createLabel(LABEL_PROCESSED);
  }
  
  // Buscar hilos con la etiqueta pendiente
  const threads = labelPending.getThreads();
  Logger.log("Hilos encontrados para procesar: " + threads.length);
  
  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const messages = thread.getMessages();
    const lastMessage = messages[messages.length - 1]; // Procesar el último correo del hilo
    
    const subject = lastMessage.getSubject();
    const body = lastMessage.getPlainBody();
    const sender = lastMessage.getFrom();
    
    Logger.log("Procesando: " + subject);
    
    try {
      // 1. Llamar a la API de Gemini
      const analysis = llamarGeminiAPI(subject, body, sender);
      
      if (analysis) {
        Logger.log("Clasificación exitosa: " + analysis.category + " - " + analysis.priority);
        
        // 2. Aplicar etiquetas según Categoría y Prioridad
        aplicarEtiquetasGmail(thread, analysis.category, analysis.priority);
        
        // 3. Crear borrador de respuesta en el mismo hilo
        thread.createDraftReply(analysis.draft);
      }
      
      // 4. Cambiar etiquetas de control (Quitar pendiente, poner procesado)
      thread.removeLabel(labelPending);
      thread.addLabel(labelDone);
      
    } catch (e) {
      Logger.log("Error al procesar el correo: " + e.toString());
    }
  }
}

/**
 * Realiza la petición HTTP a la API de Gemini
 */
function llamarGeminiAPI(subject, body, sender) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
  
  const systemInstruction = `Eres un asistente escolar experto para el Centro de Estudios de Bachillerato (CEB) 5/4 "Profr. Rafael Ramírez".
Analiza el correo proporcionado y devuelve estrictamente un objeto JSON con la clasificación del correo.
Campos obligatorios en el JSON:
1. "category": Categoría del correo (debe ser estrictamente una de estas: "Control Escolar", "Docentes y Horarios", "Orientación y Tutorías", "Inventarios", "Dirección y Recursos Humanos", "Otro").
2. "priority": Prioridad ("Alta", "Media", "Baja").
3. "summary": Un resumen corto de 1 o 2 oraciones.
4. "draft": Un borrador de respuesta formal, institucional y respetuoso en español que responda al remitente. Usa marcadores de posición razonables como [Nombre].

IMPORTANTE: Devuelve ÚNICAMENTE el objeto JSON plano, sin formato markdown (\`\`\`json), sin comentarios y sin saltos de línea innecesarios.`;

  const prompt = `Remitente: ${sender}\nAsunto: ${subject}\nCuerpo del correo:\n${body}`;

  const payload = {
    contents: [{
      parts: [
        { text: systemInstruction },
        { text: prompt }
      ]
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if (responseCode !== 200) {
    Logger.log("Error de API: " + responseCode + " - " + responseBody);
    return null;
  }

  const resJson = JSON.parse(responseBody);
  let rawText = resJson.candidates[0].content.parts[0].text.trim();
  
  // Limpiar markdown si el modelo lo incluyó
  if (rawText.startsWith("```")) {
    rawText = rawText.replace(/```json|```/g, "").trim();
  }
  
  return JSON.parse(rawText);
}

/**
 * Crea y aplica etiquetas de Gmail basadas en el resultado
 */
function aplicarEtiquetasGmail(thread, category, priority) {
  // Crear etiquetas anidadas bajo "CEB/"
  const catLabelName = "CEB/" + category;
  const prioLabelName = "CEB/Prioridad-" + priority;
  
  let catLabel = GmailApp.getUserLabelByName(catLabelName);
  let prioLabel = GmailApp.getUserLabelByName(prioLabelName);
  
  if (!catLabel) catLabel = GmailApp.createLabel(catLabelName);
  if (!prioLabel) prioLabel = GmailApp.createLabel(prioLabelName);
  
  thread.addLabel(catLabel);
  thread.addLabel(prioLabel);
}

/**
 * Función de inicialización para crear etiquetas base
 */
function inicializarEtiquetas() {
  const baseLabels = [
    LABEL_TO_PROCESS,
    LABEL_PROCESSED,
    "CEB/Control Escolar",
    "CEB/Docentes y Horarios",
    "CEB/Orientación y Tutorías",
    "CEB/Inventarios",
    "CEB/Dirección y Recursos Humanos",
    "CEB/Prioridad-Alta",
    "CEB/Prioridad-Media",
    "CEB/Prioridad-Baja"
  ];
  
  baseLabels.forEach(name => {
    if (!GmailApp.getUserLabelByName(name)) {
      GmailApp.createLabel(name);
      Logger.log("Creada etiqueta: " + name);
    }
  });
}
```

4. Haz clic en el icono de **Guardar** (el disquete).
5. Selecciona la función `inicializarEtiquetas` en la barra superior y haz clic en **Ejecutar**. Autoriza los permisos que te pida Google (esto creará la estructura de carpetas en tu Gmail personal).

---

## Paso 4: Automatizar para que corra solo (Triggers)
Para que no tengas que ejecutar el código manualmente:
1. En el panel izquierdo del editor de Apps Script, haz clic en el icono del reloj (**Activadores** / Triggers).
2. Haz clic en el botón azul **Añadir activador** (esquina inferior derecha).
3. Configúralo así:
   * **Seleccionar qué función ejecutar:** `clasificarCorreosCEB`.
   * **Seleccionar qué despliegue se debe ejecutar:** `Principal`.
   * **Seleccionar origen del evento:** `Según tiempo` (Time-driven).
   * **Seleccionar el tipo de activador basado en el tiempo:** `Temporizador de minutos`.
   * **Seleccionar el intervalo de minutos:** `Cada 5 minutos` o `Cada 10 minutos`.
4. Haz clic en **Guardar**.

¡Listo! A partir de ahora, cuando llegue un correo institucional a tu cuenta, se reenviará al personal, se le aplicará la etiqueta `Clasificar-CEB`, el script lo procesará cada 5 minutos, Gemini redactará el borrador en el mismo correo, y el correo quedará marcado como `Clasificado-CEB` etiquetado por su departamento y nivel de urgencia.
