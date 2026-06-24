# Presentación Interactiva del PEC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una aplicación web interactiva (SPA) premium y moderna para presentar los resultados del Proyecto Escolar Comunitario (PEC) de cuarto semestre del CEB 5/4, integrando los turnos Matutino y Vespertino con componentes de alta fidelidad, interactividad de navegación y muro de compromisos.

**Architecture:** La aplicación se estructurará como una SPA en una carpeta independiente con tres archivos principales (`index.html`, `style.css`, `script.js`). La navegación entre diapositivas se controlará mediante manipulación del DOM y transiciones CSS fluidas (deslizamiento y opacidad). Las evidencias fotográficas y la línea de tiempo se representarán con componentes responsivos interactivos y HSL Tailored styling.

**Tech Stack:** HTML5 semántico, CSS3 Vanilla con variables CSS, JavaScript ES6 puro, Google Fonts (*Outfit* e *Inter*).

---

### Task 1: Creación de la Estructura y Portada

**Files:**
- Create: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
- Test: Abrir el archivo en el navegador para verificar la estructura inicial.

- [ ] **Step 1: Crear la estructura base y el diseño de la diapositiva de Portada**

Crear el archivo con el siguiente contenido:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentación PEC 2025-2026 - CEB 5/4</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Panel de navegación superior (Indicador de Progreso) -->
  <header class="navbar">
    <div class="logo-area">
      <span class="logo-text">CEB 5/4 "Profr. Rafael Ramírez"</span>
    </div>
    <div class="slide-indicator">
      Diapositiva <span id="current-slide-num">1</span> de 10
    </div>
  </header>

  <!-- Contenedor Principal de Slides -->
  <main class="slides-container">
    <!-- Slide 1: Portada -->
    <section class="slide active" id="slide-1">
      <div class="slide-content cover-slide">
        <div class="badge">Ciclo Escolar 2025-2026</div>
        <h1>PROYECTO ESCOLAR COMUNITARIO (PEC)</h1>
        <h2>Construyendo comunidad a través del aprendizaje colaborativo</h2>
        <div class="meta-grid">
          <div class="meta-item"><strong>Institución:</strong> Centro de Estudios de Bachillerato 5/4</div>
          <div class="meta-item"><strong>Semestre:</strong> Cuarto Semestre (Grupos M401-M406 y V401-V404)</div>
          <div class="meta-item"><strong>Periodo:</strong> Segundo y Tercer Parcial</div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary" onclick="nextSlide()">Comenzar Presentación</button>
        </div>
      </div>
    </section>
  </main>

  <!-- Controles flotantes inferiores -->
  <footer class="controls-bar">
    <div class="nav-controls">
      <button class="btn-control" id="prev-btn" onclick="prevSlide()" disabled>⬅️</button>
      <button class="btn-control" id="next-btn" onclick="nextSlide()">➡️</button>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" id="progress-indicator"></div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verificar la creación del archivo**

Ejecutar: `ls -la /Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
Expected: Archivo creado con éxito.

- [ ] **Step 3: Commit**

```bash
git add presentacion-pec/index.html
git commit -m "feat: add basic index.html structure and slide 1"
```

---

### Task 2: Sistema de Diseño CSS (HSL Tailored)

**Files:**
- Create: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/style.css`

- [ ] **Step 1: Crear el sistema de diseño CSS**

Crear el archivo con el siguiente código base:

```css
:root {
  --bg-primary: hsl(210, 20%, 98%);
  --bg-card: hsl(0, 0%, 100%);
  --text-main: hsl(210, 30%, 12%);
  --text-muted: hsl(210, 15%, 45%);
  --accent-matutino: hsl(220, 65%, 50%); /* Azul Paz */
  --accent-vespertino: hsl(150, 60%, 45%); /* Verde Salud */
  --accent-gold: hsl(35, 75%, 55%); /* Acento Dorado */
  --border-color: hsl(210, 15%, 90%);
  --transition-speed: 0.4s;
  
  --font-title: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg-primary);
  color: var(--text-main);
  overflow: hidden;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  z-index: 10;
}

.logo-text {
  font-family: var(--font-title);
  font-weight: 700;
  color: var(--text-main);
}

/* Slides container */
.slides-container {
  flex: 1;
  position: relative;
  width: 100%;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  transform: translateX(50px);
  transition: opacity var(--transition-speed) ease, 
              transform var(--transition-speed) ease,
              visibility var(--transition-speed);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.slide.active {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.slide-content {
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  padding: 3rem;
  width: 100%;
  max-width: 1100px;
  max-height: 85%;
  overflow-y: auto;
}

/* Cover styling */
.cover-slide {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.badge {
  background: linear-gradient(135deg, var(--accent-matutino), var(--accent-vespertino));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

h1 {
  font-family: var(--font-title);
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -1px;
}

h2 {
  font-family: var(--font-title);
  font-size: 1.5rem;
  color: var(--text-muted);
  font-weight: 400;
  margin-bottom: 2.5rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 3rem;
}

.meta-item {
  background: var(--bg-primary);
  padding: 1.2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: center;
}

/* Buttons */
.btn {
  font-family: var(--font-title);
  font-weight: 600;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--text-main);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Footer controls */
.controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: var(--bg-card);
  border-top: 1px solid var(--border-color);
  z-index: 10;
}

.btn-control {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  font-size: 1.2rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress-bar-container {
  flex: 1;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  margin-left: 2rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 10%;
  background: linear-gradient(90deg, var(--accent-matutino), var(--accent-vespertino));
  transition: width 0.3s ease;
}
```

- [ ] **Step 2: Commit**

```bash
git add presentacion-pec/style.css
git commit -m "feat: add design system stylesheet with custom HSL palette"
```

---

### Task 3: Navegación de Diapositivas (JS)

**Files:**
- Create: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/script.js`

- [ ] **Step 1: Crear la lógica de navegación**

Escribir el código en el archivo:

```javascript
let currentSlide = 1;
const totalSlides = 10;

function showSlide(index) {
  if (index < 1 || index > totalSlides) return;
  
  // Desactivar slide actual
  const activeSlide = document.querySelector('.slide.active');
  if (activeSlide) {
    activeSlide.classList.remove('active');
  }

  // Activar nuevo slide
  const targetSlide = document.getElementById(`slide-${index}`);
  if (targetSlide) {
    targetSlide.classList.add('active');
  }

  currentSlide = index;

  // Actualizar indicadores
  document.getElementById('current-slide-num').textContent = currentSlide;
  const progressPercent = (currentSlide / totalSlides) * 100;
  document.getElementById('progress-indicator').style.width = `${progressPercent}%`;

  // Habilitar/Deshabilitar botones
  document.getElementById('prev-btn').disabled = (currentSlide === 1);
  document.getElementById('next-btn').disabled = (currentSlide === totalSlides);
}

function nextSlide() {
  if (currentSlide < totalSlides) showSlide(currentSlide + 1);
}

function prevSlide() {
  if (currentSlide > 1) showSlide(currentSlide - 1);
}

// Navegación por teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add presentacion-pec/script.js
git commit -m "feat: implement slide navigation and keyboard controls"
```

---

### Task 4: Diapositiva 2 y 3 (Definición y Objetivos)

**Files:**
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/style.css`

- [ ] **Step 1: Agregar Diapositiva 2 y 3 al archivo HTML**

Agregar los slides debajo de `<section class="slide active" id="slide-1">`:

```html
    <!-- Slide 2: ¿Qué es el PEC? -->
    <section class="slide" id="slide-2">
      <div class="slide-content">
        <h2 class="slide-title">¿Qué es el Proyecto Escolar Comunitario (PEC)?</h2>
        <div class="concept-grid">
          <div class="concept-text">
            <p class="highlight-text">El Proyecto Escolar Comunitario es una estrategia interdisciplinaria que integra los aprendizajes de diversas asignaturas para atender problemáticas relevantes de la comunidad escolar.</p>
            <p>A través de proyectos colaborativos con impacto social, los alumnos asumen un rol activo de investigación e intervención, conectando la teoría con el entorno de nuestro Centro de Estudios de Bachillerato 5/4.</p>
          </div>
          <div class="concept-card">
            <h4>Ejes Rectores</h4>
            <ul>
              <li>🌱 Transversalidad Curricular</li>
              <li>🤝 Aprendizaje Significativo y Solidario</li>
              <li>🗺️ Impacto Comunitario y Familiar</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Slide 3: Objetivos Generales -->
    <section class="slide" id="slide-3">
      <div class="slide-content">
        <h2 class="slide-title">Objetivos Generales del PEC</h2>
        <div class="objectives-grid">
          <div class="obj-card">
            <div class="obj-num">01</div>
            <h3>Fortalecer el Trabajo Interdisciplinario</h3>
            <p>Vincular y articular los saberes específicos de cada asignatura en torno a un problema real de la escuela.</p>
          </div>
          <div class="obj-card">
            <div class="obj-num">02</div>
            <h3>Promover el Aprendizaje Significativo</h3>
            <p>Fomentar la aplicación práctica de conceptos académicos en soluciones reales y concretas.</p>
          </div>
          <div class="obj-card">
            <div class="obj-num">03</div>
            <h3>Vincular con Problemáticas Reales</h3>
            <p>Conectar los contenidos del aula directamente con la realidad socioemocional y comunitaria del plantel.</p>
          </div>
          <div class="obj-card">
            <div class="obj-num">04</div>
            <h3>Habilidades Clave</h3>
            <p>Desarrollar capacidades de investigación científica, análisis crítico y comunicación efectiva en los estudiantes.</p>
          </div>
          <div class="obj-card">
            <div class="obj-num">05</div>
            <h3>Participación Colectiva</h3>
            <p>Fomentar y estructurar la integración activa de los estudiantes, docentes y las familias de la comunidad.</p>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Agregar estilos para el concepto y objetivos en style.css**

Agregar al final de `style.css`:

```css
.slide-title {
  font-family: var(--font-title);
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid var(--border-color);
}

/* Slide 2 Concept Grid */
.concept-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2.5rem;
  align-items: center;
}

.highlight-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--accent-matutino);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.concept-text p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-main);
  margin-bottom: 1rem;
}

.concept-card {
  background: linear-gradient(135deg, hsl(220, 60%, 97%), hsl(150, 60%, 97%));
  border-radius: 12px;
  padding: 2.5rem;
  border: 1px dashed var(--accent-matutino);
}

.concept-card h4 {
  font-family: var(--font-title);
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.concept-card ul {
  list-style: none;
}

.concept-card li {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

/* Slide 3 Objectives Grid */
.objectives-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.obj-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--border-color);
}

.obj-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.obj-num {
  font-family: var(--font-title);
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--accent-gold);
  opacity: 0.8;
  margin-bottom: 1rem;
}

.obj-card h3 {
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
}

.obj-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-muted);
}
```

- [ ] **Step 3: Commit**

```bash
git add presentacion-pec/index.html presentacion-pec/style.css
git commit -m "feat: add PEC concept and general objectives slides"
```

---

### Task 5: Diapositiva 4 (Red Interdisciplinaria)

**Files:**
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/style.css`

- [ ] **Step 1: Agregar Diapositiva 4 al HTML**

```html
    <!-- Slide 4: Red Interdisciplinaria -->
    <section class="slide" id="slide-4">
      <div class="slide-content">
        <h2 class="slide-title">Red Interdisciplinaria y Participación</h2>
        <div class="inter-grid">
          <div class="turno-box t-matutino">
            <h3>Turno Matutino</h3>
            <p class="turno-subtitle">Proyecto: Convivencia y Paz</p>
            <div class="subjects-list">
              <div class="subject-tag">Pensamiento Literario</div>
              <div class="subject-tag">Espacio y Sociedad</div>
              <div class="subject-tag">Reacciones Químicas</div>
            </div>
          </div>
          
          <div class="turno-box t-vespertino">
            <h3>Turno Vespertino</h3>
            <p class="turno-subtitle">Proyecto: Vida Sana, Vida Plena</p>
            <div class="subjects-list">
              <div class="subject-tag">Formación Socioemocional IV</div>
              <div class="subject-tag">Conciencia Histórica</div>
              <div class="subject-tag">Ciencias Sociales III</div>
            </div>
          </div>
        </div>

        <div class="capacitaciones-section">
          <h4>Capacitaciones Técnicas de Apoyo</h4>
          <div class="caps-flex">
            <div class="cap-pill text-pill">Comunidades Virtuales</div>
            <div class="cap-pill text-pill">Redes de Cómputo</div>
            <div class="cap-pill aula-pill">Intervención Aula</div>
            <div class="cap-pill aula-pill">Intervención Escolar</div>
            <div class="cap-pill salud-pill">Nutrición</div>
            <div class="cap-pill salud-pill">Higiene y Salud</div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Estilos para la red interdisciplinaria**

Agregar al final de `style.css`:

```css
.inter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.turno-box {
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.t-matutino {
  border-left: 6px solid var(--accent-matutino);
  background: hsl(220, 60%, 99%);
}

.t-vespertino {
  border-left: 6px solid var(--accent-vespertino);
  background: hsl(150, 60%, 99%);
}

.turno-box h3 {
  font-family: var(--font-title);
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.turno-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.subjects-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.subject-tag {
  background: var(--bg-card);
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.capacitaciones-section {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.capacitaciones-section h4 {
  font-family: var(--font-title);
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.caps-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.cap-pill {
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
}

.text-pill {
  background: hsl(220, 60%, 90%);
  color: hsl(220, 70%, 30%);
}

.aula-pill {
  background: hsl(35, 75%, 90%);
  color: hsl(35, 75%, 35%);
}

.salud-pill {
  background: hsl(150, 60%, 90%);
  color: hsl(150, 70%, 25%);
}
```

- [ ] **Step 3: Commit**

```bash
git add presentacion-pec/index.html presentacion-pec/style.css
git commit -m "feat: add interdisciplinary red diagram slide"
```

---

### Task 6: Diapositiva 5 y 6 (Productos Finales y Capacitaciones)

**Files:**
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/style.css`

- [ ] **Step 1: Agregar Diapositiva 5 y 6 al HTML**

```html
    <!-- Slide 5: Productos Finales -->
    <section class="slide" id="slide-5">
      <div class="slide-content">
        <h2 class="slide-title">Productos Finales Integradores</h2>
        <div class="split-grid">
          <div class="prod-card border-matutino">
            <div class="prod-header bg-matutino">Turno Matutino</div>
            <div class="prod-body">
              <h3>Tejiendo Paz y Bienestar</h3>
              <p class="prod-type"><strong>Producto:</strong> Lona Infográfica (52 x 180 cm)</p>
              <ul class="prod-details">
                <li>📍 Mapeo de violencias y zonas críticas</li>
                <li>📊 Diagnóstico estadístico y causas</li>
                <li>🩹 Propuestas prácticas de solución</li>
                <li>👨‍👩‍👧‍👦 Exposición oral ante padres de familia</li>
              </ul>
            </div>
          </div>
          
          <div class="prod-card border-vespertino">
            <div class="prod-header bg-vespertino">Turno Vespertino</div>
            <div class="prod-body">
              <h3>Vida Sana, Vida Plena</h3>
              <p class="prod-type"><strong>Producto:</strong> Cómic Elaborado a Mano</p>
              <ul class="prod-details">
                <li>📍 Identificación de hábitos tóxicos</li>
                <li>🧠 Consecuencias físicas y emocionales</li>
                <li>💡 Alternativas de vida saludables</li>
                <li>📖 Exposición tipo galería ante padres</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Slide 6: Contribución de Capacitaciones -->
    <section class="slide" id="slide-6">
      <div class="slide-content">
        <h2 class="slide-title">Contribución de las Capacitaciones</h2>
        <div class="table-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>Capacitación</th>
                <th>Asignaturas Implicadas</th>
                <th>Aportación al PEC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bold-td">💻 Tecnologías</td>
                <td>Comunidades Virtuales / Mantenimiento</td>
                <td>Uso responsable de redes sociales, prevención de riesgos digitales y ciudadanía digital.</td>
              </tr>
              <tr>
                <td class="bold-td">🏫 Auxiliar Educativo</td>
                <td>Intervención en el Aula / Intervención Escolar</td>
                <td>Análisis exhaustivo del clima escolar, técnicas de convivencia pacífica y resolución de conflictos.</td>
              </tr>
              <tr>
                <td class="bold-td">🍎 Salud Comunitaria</td>
                <td>Nutrición / Higiene y Salud</td>
                <td>Promoción activa de hábitos saludables, alimentación equilibrada y bienestar integral del estudiante.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Estilos para productos y contribución**

Agregar al final de `style.css`:

```css
.split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.prod-card {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.03);
  border: 1px solid var(--border-color);
}

.border-matutino {
  border-top: 6px solid var(--accent-matutino);
}

.border-vespertino {
  border-top: 6px solid var(--accent-vespertino);
}

.prod-header {
  padding: 1rem;
  color: white;
  font-weight: 700;
  font-family: var(--font-title);
  text-align: center;
  font-size: 1.1rem;
}

.bg-matutino {
  background: var(--accent-matutino);
}

.bg-vespertino {
  background: var(--accent-vespertino);
}

.prod-body {
  padding: 2rem;
}

.prod-body h3 {
  font-family: var(--font-title);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.prod-type {
  font-size: 1rem;
  color: var(--text-main);
  margin-bottom: 1.5rem;
}

.prod-details {
  list-style: none;
}

.prod-details li {
  margin-bottom: 0.8rem;
  font-size: 1rem;
  color: var(--text-muted);
}

/* Styled Table */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
  text-align: left;
}

.styled-table th {
  background-color: var(--text-main);
  color: white;
  padding: 1.2rem;
  font-family: var(--font-title);
  font-weight: 600;
}

.styled-table td {
  padding: 1.2rem;
  border-bottom: 1px solid var(--border-color);
}

.styled-table tbody tr:last-of-type td {
  border-bottom: none;
}

.bold-td {
  font-weight: 700;
  color: var(--text-main);
}
```

- [ ] **Step 3: Commit**

```bash
git add presentacion-pec/index.html presentacion-pec/style.css
git commit -m "feat: add products comparison and training contribution table slides"
```

---

### Task 7: Diapositiva 7 (Organización de Presentaciones)

**Files:**
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/style.css`

- [ ] **Step 1: Agregar Diapositiva 7 al HTML**

```html
    <!-- Slide 7: Organización y Cronograma del 3 de Junio -->
    <section class="slide" id="slide-7">
      <div class="slide-content">
        <h2 class="slide-title">Organización del Evento de Presentación</h2>
        <p class="subtitle" style="margin-bottom: 1.5rem;">Fecha única: <strong>Miércoles 03 de Junio de 2026</strong> | Padres y Madres de Familia invitados</p>
        
        <div class="agenda-container">
          <div class="agenda-column">
            <h4 class="agenda-title accent-blue">Turno Matutino — 9:30 hrs</h4>
            <div class="timeline-v">
              <div class="time-item">
                <span class="time-val">8:00 - 9:00</span>
                <span class="time-desc">Montaje de Lonas (52 x 180 cm) y clips plegables</span>
              </div>
              <div class="time-item">
                <span class="time-val">9:30 - 9:45</span>
                <span class="time-desc">Bienvenida e Inauguración (Audiorama del Plantel)</span>
              </div>
              <div class="time-item">
                <span class="time-val">9:50 - 10:50</span>
                <span class="time-desc">Recorrido oral guiado (Estaciones M401 a M406)</span>
              </div>
              <div class="time-item">
                <span class="time-val">10:50 - 11:20</span>
                <span class="time-desc">Snack saludable y firmas en Muro de Compromisos</span>
              </div>
            </div>
          </div>
          
          <div class="agenda-column">
            <h4 class="agenda-title accent-green">Turno Vespertino — 14:00 hrs</h4>
            <div class="timeline-v">
              <div class="time-item">
                <span class="time-val">13:00 - 13:45</span>
                <span class="time-desc">Montaje de Cómics colgantes con pinzas en los pasillos</span>
              </div>
              <div class="time-item">
                <span class="time-val">14:00 - 14:15</span>
                <span class="time-desc">Apertura en el Audiorama (Prof. Pedro Camargo)</span>
              </div>
              <div class="time-item">
                <span class="time-val">14:20 - 15:00</span>
                <span class="time-desc">Recorrido libre y explicaciones (Zonas A a D - V401 a V404)</span>
              </div>
              <div class="time-item">
                <span class="time-val">15:10 - 15:30</span>
                <span class="time-desc">Muro de Compromisos, Cierre y Foto Grupal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Estilos para el cronograma**

Agregar al final de `style.css`:

```css
.agenda-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.agenda-column {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.agenda-title {
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
}

.accent-blue {
  color: var(--accent-matutino);
  border-bottom: 2px solid var(--accent-matutino);
}

.accent-green {
  color: var(--accent-vespertino);
  border-bottom: 2px solid var(--accent-vespertino);
}

.timeline-v {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  position: relative;
  padding-left: 1rem;
}

.timeline-v::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 5px;
  width: 2px;
  background: var(--border-color);
}

.time-item {
  position: relative;
  display: flex;
  flex-direction: column;
}

.time-item::before {
  content: '';
  position: absolute;
  left: -1.3rem;
  top: 5px;
  width: 8px;
  height: 8px;
  border-radius: 50px;
  background: var(--text-muted);
}

.time-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}

.time-desc {
  font-size: 0.95rem;
  font-weight: 500;
}
```

- [ ] **Step 3: Commit**

```bash
git add presentacion-pec/index.html presentacion-pec/style.css
git commit -m "feat: add agenda and logistics timeline slide"
```

---

### Task 8: Diapositiva 8 (Galería de Evidencias)

**Files:**
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/style.css`

- [ ] **Step 1: Agregar Diapositiva 8 con marcadores para imágenes SVG**

```html
    <!-- Slide 8: Evidencias del Proyecto -->
    <section class="slide" id="slide-8">
      <div class="slide-content" style="max-height: 90%;">
        <h2 class="slide-title">Galería de Evidencias PEC</h2>
        <div class="gallery-grid">
          <div class="gallery-item">
            <div class="svg-placeholder">
              <svg viewBox="0 0 100 100">
                <rect width="100" height="100" fill="hsl(220, 65%, 95%)"/>
                <path d="M20,80 Q40,40 60,70 T100,50 L100,100 L0,100 Z" fill="hsl(220, 65%, 85%)"/>
                <circle cx="35" cy="35" r="10" fill="hsl(220, 65%, 90%)"/>
                <text x="50" y="90" font-size="6" text-anchor="middle" font-family="sans-serif" font-weight="bold" fill="hsl(220, 65%, 40%)">TRABAJO EN AULA</text>
              </svg>
            </div>
            <p class="img-caption">Trabajo de investigación en el aula</p>
          </div>
          
          <div class="gallery-item">
            <div class="svg-placeholder">
              <svg viewBox="0 0 100 100">
                <rect width="100" height="100" fill="hsl(150, 60%, 95%)"/>
                <path d="M10,90 Q40,30 70,80 T100,60 L100,100 L0,100 Z" fill="hsl(150, 60%, 85%)"/>
                <circle cx="75" cy="30" r="8" fill="hsl(150, 60%, 90%)"/>
                <text x="50" y="90" font-size="6" text-anchor="middle" font-family="sans-serif" font-weight="bold" fill="hsl(150, 70%, 25%)">ELABORACIÓN INFOGRAFÍAS</text>
              </svg>
            </div>
            <p class="img-caption">Elaboración y diseño de Infografías y Lonas</p>
          </div>

          <div class="gallery-item">
            <div class="svg-placeholder">
              <svg viewBox="0 0 100 100">
                <rect width="100" height="100" fill="hsl(35, 75%, 95%)"/>
                <path d="M15,85 Q45,35 65,75 T100,55 L100,100 L0,100 Z" fill="hsl(35, 75%, 85%)"/>
                <circle cx="50" cy="30" r="9" fill="hsl(35, 75%, 90%)"/>
                <text x="50" y="90" font-size="6" text-anchor="middle" font-family="sans-serif" font-weight="bold" fill="hsl(35, 75%, 35%)">MONTAJE DE EXPOSICIONES</text>
              </svg>
            </div>
            <p class="img-caption">Instalación colgante en pasillos</p>
          </div>

          <div class="gallery-item">
            <div class="svg-placeholder">
              <svg viewBox="0 0 100 100">
                <rect width="100" height="100" fill="hsl(320, 60%, 95%)"/>
                <path d="M25,85 Q55,45 75,75 T100,60 L100,100 L0,100 Z" fill="hsl(320, 60%, 85%)"/>
                <circle cx="35" cy="30" r="10" fill="hsl(320, 60%, 90%)"/>
                <text x="50" y="90" font-size="6" text-anchor="middle" font-family="sans-serif" font-weight="bold" fill="hsl(320, 70%, 30%)">PARTICIPACIÓN DE PADRES</text>
              </svg>
            </div>
            <p class="img-caption">Padres de familia interactuando</p>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Estilos para la galería**

Agregar al final de `style.css`:

```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem;
  margin-top: 1rem;
}

.gallery-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.8rem;
  text-align: center;
  transition: transform 0.2s ease;
}

.gallery-item:hover {
  transform: scale(1.03);
}

.svg-placeholder {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.8rem;
}

.svg-placeholder svg {
  width: 100%;
  height: auto;
  display: block;
}

.img-caption {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
  line-height: 1.4;
}
```

- [ ] **Step 3: Commit**

```bash
git add presentacion-pec/index.html presentacion-pec/style.css
git commit -m "feat: add high fidelity responsive visual evidence gallery slide"
```

---

### Task 9: Diapositiva 9 (Resultados y Logros)

**Files:**
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/style.css`

- [ ] **Step 1: Agregar Diapositiva 9 al HTML**

```html
    <!-- Slide 9: Resultados y Logros -->
    <section class="slide" id="slide-9">
      <div class="slide-content">
        <h2 class="slide-title">Resultados y Logros del PEC</h2>
        <div class="metrics-container">
          <div class="metric-card">
            <span class="m-val">100%</span>
            <span class="m-label">Participación Estudiantil</span>
            <p class="m-desc">Integración activa de 10 grupos de Cuarto Semestre de ambos turnos.</p>
          </div>
          
          <div class="metric-card">
            <span class="m-val">80+</span>
            <span class="m-label">Productos Expuestos</span>
            <p class="m-desc">Lonas de infografía detalladas y cómics preventivos elaborados a mano.</p>
          </div>

          <div class="metric-card">
            <span class="m-val">200+</span>
            <span class="m-label">Padres de Familia</span>
            <p class="m-desc">Asistencia al recorrido y registro de compromisos saludables en el mural escolar.</p>
          </div>
        </div>

        <div class="achievements-section">
          <h3>Habilidades Socioemocionales y Conciencia Ciudadana</h3>
          <ul class="ach-bullets">
            <li>✅ Trabajo colaborativo sólido en equipos interdisciplinarios.</li>
            <li>✅ Sensibilización escolar profunda sobre la prevención de la violencia.</li>
            <li>✅ Promoción activa y registro de compromisos reales para una vida saludable.</li>
          </ul>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Estilos para los logros**

Agregar al final de `style.css`:

```css
.metrics-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.metric-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  border: 1px solid var(--border-color);
  text-align: center;
  border-bottom: 4px solid var(--accent-gold);
}

.m-val {
  font-family: var(--font-title);
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--text-main);
  display: block;
  margin-bottom: 0.5rem;
}

.m-label {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-main);
  display: block;
  margin-bottom: 0.8rem;
}

.m-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.achievements-section {
  background: hsl(0, 0%, 97%);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--border-color);
}

.achievements-section h3 {
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
}

.ach-bullets {
  list-style: none;
}

.ach-bullets li {
  font-size: 1.05rem;
  font-weight: 500;
  margin-bottom: 0.8rem;
  color: var(--text-main);
}
```

- [ ] **Step 3: Commit**

```bash
git add presentacion-pec/index.html presentacion-pec/style.css
git commit -m "feat: add metrics and achievements slide"
```

---

### Task 10: Diapositiva 10 (Cierre y Muro Interactivo)

**Files:**
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/style.css`
- Modify: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/script.js`

- [ ] **Step 1: Agregar Diapositiva 10 al HTML**

```html
    <!-- Slide 10: Cierre e Inspiración -->
    <section class="slide" id="slide-10">
      <div class="slide-content">
        <h2 class="slide-title">Gracias por ser parte del cambio</h2>
        <div class="cierre-grid">
          <div class="cierre-main">
            <blockquote class="cierre-quote">
              "El aprendizaje cobra sentido cuando se transforma en acciones concretas que mejoran y tejen comunidad."
            </blockquote>
            
            <div class="muro-interactivo-cierre">
              <h4>Muro Escolar de Compromisos (Simulación Interactiva)</h4>
              <p class="subtitle" style="margin-bottom: 1rem;">Haz clic en un post-it para ver los compromisos de los padres y alumnos:</p>
              <div class="postits-flex">
                <div class="postit p-blue" onclick="revealPostit(this)">
                  <span class="p-preview">Compromiso Convivencia</span>
                  <p class="p-detail">"Me comprometo a escuchar más a mis hijos y evitar la violencia verbal en casa."</p>
                </div>
                <div class="postit p-green" onclick="revealPostit(this)">
                  <span class="p-preview">Compromiso Salud</span>
                  <p class="p-detail">"En mi familia cambiaremos los refrescos por agua de fruta natural."</p>
                </div>
                <div class="postit p-yellow" onclick="revealPostit(this)">
                  <span class="p-preview">Compromiso Respeto</span>
                  <p class="p-detail">"Propongo mantener limpios los pasillos y áreas comunes del CEB 5/4."</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="firma-block">
            <h4>Academia de Cuarto Semestre</h4>
            <div class="firmantes">
              <p><strong>Mtra. Claudia Nayeli González Gardini</strong><br><span class="muted-text">Líder de Academia - Turno Matutino</span></p>
              <p><strong>Mtro. Felipe López Salazar</strong><br><span class="muted-text">Líder de Academia - Turno Matutino</span></p>
            </div>
            <div class="dgb-sig">CEB 5/4 “Profr. Rafael Ramírez”</div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Estilos para la diapositiva de cierre y post-its**

Agregar al final de `style.css`:

```css
.cierre-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2.5rem;
}

.cierre-quote {
  font-size: 1.35rem;
  font-style: italic;
  font-weight: 600;
  color: var(--accent-matutino);
  border-left: 4px solid var(--accent-gold);
  padding-left: 1.5rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.muro-interactivo-cierre h4 {
  font-family: var(--font-title);
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.postits-flex {
  display: flex;
  gap: 1rem;
}

.postit {
  flex: 1;
  aspect-ratio: 1;
  padding: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 0.95rem;
  position: relative;
}

.postit:hover {
  transform: translateY(-5px) rotate(1deg);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.p-blue {
  background-color: hsl(200, 85%, 90%);
  color: hsl(200, 80%, 30%);
}

.p-green {
  background-color: hsl(140, 80%, 90%);
  color: hsl(140, 80%, 25%);
}

.p-yellow {
  background-color: hsl(55, 95%, 88%);
  color: hsl(55, 90%, 35%);
}

.postit .p-detail {
  display: none;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.85rem;
  line-height: 1.4;
}

.postit.revealed .p-preview {
  display: none;
}

.postit.revealed .p-detail {
  display: block;
}

.firma-block {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.firma-block h4 {
  font-family: var(--font-title);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.firmantes p {
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.muted-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.dgb-sig {
  font-family: var(--font-title);
  font-weight: 800;
  font-size: 0.9rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}
```

- [ ] **Step 3: Agregar lógica interactiva para los post-its en script.js**

Agregar al final de `script.js`:

```javascript
function revealPostit(element) {
  element.classList.toggle('revealed');
}
```

- [ ] **Step 4: Commit**

```bash
git add presentacion-pec/index.html presentacion-pec/style.css presentacion-pec/script.js
git commit -m "feat: add interactive closure slide with muro de compromisos postits"
```

---

### Task 11: Sincronización y Validación

**Files:**
- Test: `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec/index.html`
- Copy: `/Users/felipelopezsalazar/Library/Mobile Documents/com~apple~CloudDocs/School/CEB/Dirección/Proyecto_Gestion_CEB/`

- [ ] **Step 1: Verificar que todos los archivos se carguen y funcionen en el navegador**

Prueba: Abrir index.html de forma local y recorrer todas las 10 diapositivas usando la barra de control, clics en post-its y navegación de teclado (flecha derecha/izquierda, barra espaciadora).

- [ ] **Step 2: Sincronizar los cambios con la carpeta de iCloud Drive**

Ejecutar:
```bash
cp -R "/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/presentacion-pec" "/Users/felipelopezsalazar/Library/Mobile Documents/com~apple~CloudDocs/School/CEB/Dirección/Proyecto_Gestion_CEB/"
```

- [ ] **Step 3: Commit de sincronización**

```bash
git add -A
git commit -m "chore: synchronize local files and finalize PEC presentation"
```
