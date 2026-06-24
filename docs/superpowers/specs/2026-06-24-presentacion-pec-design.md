# Especificación de Diseño: Presentación Web Interactiva del Proyecto Escolar Comunitario (PEC)
**Centro de Estudios de Bachillerato 5/4 "Profr. Rafael Ramírez"**

Este documento detalla la estructura y el diseño de la aplicación web interactiva que servirá como presentación del PEC de Cuarto Semestre para el ciclo 2025-2026.

---

## 1. Concepto y Objetivos Visuales

La presentación se concibe como una **Single Page Application (SPA)** de alto impacto estético, que sustituye a las diapositivas estáticas tradicionales de PowerPoint por una experiencia interactiva fluida.

### Objetivos de Diseño:
- **Estilo Moderno Comunidad (HSL Tailored):** Colores dinámicos y balanceados. Verde esmeralda/menta (`hsl(150, 60%, 45%)`) para la temática de salud ("Vida Sana, Vida Plena") y azul cobalto/índigo (`hsl(220, 65%, 50%)`) para el tema de convivencia y paz ("Tejiendo Paz y Bienestar").
- **Tipografía Premium:** Uso de fuentes legibles y modernas (ej. *Inter* o *Outfit* vía Google Fonts).
- **Interactividad:** Transiciones suaves de deslizamiento, navegación por teclado, paneles desplegables para detallar la participación de asignaturas y un muro de compromisos simulado mediante tarjetas interactivas.
- **Evidencias en Alta Calidad:** Un componente de galería fotográfica con soporte para lightbox y filtros de categorías (Aula, Investigación, Montaje, Recorrido).

---

## 2. Estructura de Diapositivas (Secuencia)

La presentación consta de 10 diapositivas accesibles secuencialmente o mediante un menú de navegación rápido:

1. **Diapositiva 1: Portada**
   - Título: PROYECTO ESCOLAR COMUNITARIO (PEC) 2025-2026
   - Subtítulo: Construyendo comunidad a través del aprendizaje colaborativo
   - Elementos: Logo del CEB 5/4, indicación del Semestre (Cuarto), periodo (Segundo y Tercer Parcial), e imágenes ilustrativas abstractas/estudiantiles.
2. **Diapositiva 2: ¿Qué es el PEC?**
   - Definición de la estrategia interdisciplinaria NEM y su vinculación con problemáticas comunitarias.
3. **Diapositiva 3: Objetivos Generales**
   - Presentación visual en cuadrícula de los 5 objetivos (Trabajo interdisciplinario, Aprendizaje significativo, Vinculación comunitaria, Investigación, Participación docente/familiar).
4. **Diapositiva 4: Red Interdisciplinaria (Materias Participantes)**
   - Mapa interactivo o matriz que conecta las asignaturas del turno Matutino (Pensamiento Literario, Espacio y Sociedad, Reacciones Químicas) y del Vespertino (Formación Socioemocional IV, Conciencia Histórica, Ciencias Sociales III), junto con las capacitaciones técnicas (Comunidades Virtuales, Mantenimiento, Intervención, Nutrición, Higiene).
5. **Diapositiva 5: Productos Finales por Turno**
   - Comparación visual:
     - **Turno Matutino:** Lonas infográficas colgantes (52 cm x 180 cm) sobre "Tejiendo Paz y Bienestar".
     - **Turno Vespertino:** Cómic elaborado a mano sobre "Vida Sana, Vida Plena".
6. **Diapositiva 6: Contribución de Capacitaciones**
   - Tabla comparativa estilizada con las áreas de tecnologías (ciudadanía digital), auxiliar educativo (clima escolar/resolución de conflictos), y salud comunitaria (bienestar/nutrición).
7. **Diapositiva 7: Logística del Evento (03 de Junio de 2026)**
   - Cronograma e itinerario interactivo minucioso para ambos turnos (Matutino 9:30 hrs y Vespertino 14:00 hrs), detallando bienvenida, estaciones de recorrido de grupos y dinámicas grupales.
8. **Diapositiva 8: Galería de Evidencias**
   - Galería fotográfica interactiva de alta fidelidad clasificada por categorías.
9. **Diapositiva 9: Resultados y Logros**
   - Métricas clave con gráficos en SVG/CSS: Participación estudiantil, vinculación familiar, e impacto de la campaña socioemocional y de salud.
10. **Diapositiva 10: Cierre e Inspiración**
    - Mensaje de cierre de la academia, hoja de firmas digitales de conformidad (Líderes de Academia) y enlace al Muro de Compromisos interactivo.

---

## 3. Arquitectura Técnica

La aplicación se construirá en un único archivo indexado de forma independiente:
- **`index.html`:** Estructura semántica de diapositivas (`<section class="slide">`).
- **`style.css`:** Sistema de diseño con variables CSS, animaciones de entrada de diapositivas (`slideIn`), efectos de hover sutiles y diseño responsivo para proyectores o dispositivos móviles.
- **`script.js`:** Lógica de navegación (teclas `ArrowRight`, `ArrowLeft`, `Space`, gestos táctiles, y control de menú), filtros de la galería, y manejo del estado de selección del Muro de Compromisos.

---

## 4. Plan de Verificación

### Pruebas de Usabilidad:
- Verificar el correcto funcionamiento del cambio de diapositivas con flechas del teclado y clics.
- Validar la visualización responsiva (desde un monitor estándar hasta proyectores HDMI 1080p).
- Comprobar que los gráficos interactivos y filtros de galería carguen de forma inmediata.
