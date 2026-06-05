// Fallback Configuration Data (in case of local file:/// CORS restrictions)
const defaultDocs = {
  schoolName: "Centro de Estudios de Bachillerato (CEB)",
  subtitle: "Portal de Gestión de Procesos Directiva y Administrativa",
  activeCycle: "B.25.26",
  cycles: {
    "B.25.26": {
      name: "Ciclo B.25.26 (Feb - Jul 2026)",
      documents: {
        general: {
          calendarioEscolar: "https://docs.google.com/document/d/example_calendario_B2526",
          bitacoraReuniones: "../00_Memorias_y_Bitacoras/Bitacora_Reuniones.md",
          controlProyectos: "../00_Memorias_y_Bitacoras/Control_Proyectos_Calendario.md"
        },
        direccion: {
          recursosHumanos: "https://docs.google.com/spreadsheets/d/example_rrhh_B2526"
        },
        subdireccion: {
          controlEscolar: "https://docs.google.com/spreadsheets/d/1KR8f7ObGmO8F2dVgJepKpKYBeMEktBme2jTTbImS8nM/edit#gid=796470242",
          docentes: "https://docs.google.com/spreadsheets/d/example_docentes_B2526",
          orientacionEducativa: "https://docs.google.com/document/d/example_orientacion_B2526",
          tutorias: "https://docs.google.com/spreadsheets/d/example_tutorias_B2526",
          biblioteca: "https://docs.google.com/spreadsheets/d/example_biblioteca_B2526"
        },
        coordinacionAdministrativa: {
          inventarios: "https://docs.google.com/spreadsheets/d/example_inventarios_B2526"
        }
      }
    },
    "A.26.27": {
      name: "Ciclo A.26.27 (Ago 2026 - Ene 2027)",
      documents: {
        general: {
          calendarioEscolar: "https://docs.google.com/document/d/example_calendario_A2627",
          bitacoraReuniones: "../00_Memorias_y_Bitacoras/Bitacora_Reuniones.md",
          controlProyectos: "../00_Memorias_y_Bitacoras/Control_Proyectos_Calendario.md"
        },
        direccion: {
          recursosHumanos: "https://docs.google.com/spreadsheets/d/example_rrhh_A2627"
        },
        subdireccion: {
          controlEscolar: "https://docs.google.com/spreadsheets/d/example_control_escolar_A2627",
          docentes: "https://docs.google.com/spreadsheets/d/example_docentes_A2627",
          orientacionEducativa: "https://docs.google.com/document/d/example_orientacion_A2627",
          tutorias: "https://docs.google.com/spreadsheets/d/example_tutorias_A2627",
          biblioteca: "https://docs.google.com/spreadsheets/d/example_biblioteca_A2627"
        },
        coordinacionAdministrativa: {
          inventarios: "https://docs.google.com/spreadsheets/d/example_inventarios_A2627"
        }
      }
    }
  }
};


// Fallback Normative Mapping Data
const defaultNormas = [
  { "number": 1, "filename": "1.pdf", "title": "Ley General de Responsabilidades Administrativas", "description": "Establece las responsabilidades administrativas de los servidores públicos, sus obligaciones, sanciones y procedimientos." },
  { "number": 2, "filename": "2.pdf", "title": "Constitución Política de los Estados Unidos Mexicanos", "description": "Marco constitucional de México. Artículos clave en materia educativa (1º, 3º, 31º)." },
  { "number": 3, "filename": "3.pdf", "title": "Ley General de Educación", "description": "Regula la educación que imparte el Estado, federación, entidades y municipios, estableciendo las bases del Sistema Educativo Nacional." },
  { "number": 4, "filename": "4.pdf", "title": "Ley General de los Derechos de Niñas, Niños y Adolescentes", "description": "Garantiza el pleno ejercicio, respeto, protección y promoción de los derechos humanos de la niñez y adolescencia en el entorno escolar." },
  { "number": 5, "filename": "5.pdf", "title": "Ley General de Acceso de las Mujeres a una Vida Libre de Violencia", "description": "Establece los principios de coordinación para garantizar la prevención, sanción y erradicación de la violencia contra las mujeres." },
  { "number": 6, "filename": "6.pdf", "title": "Curso-Taller 1: Hacia una práctica docente colaborativa en las áreas de acceso al conocimiento (MCCEMS)", "description": "Cuaderno de trabajo para docentes sobre didáctica y colaboración en Ciencias Naturales, Sociales y Humanidades." },
  { "number": 7, "filename": "7.pdf", "title": "Curso-Taller 3: Hacia una práctica docente colaborativa en los recursos socioemocionales (MCCEMS)", "description": "Enfocado en la formación socioemocional y el desarrollo integral de las comunidades escolares dentro del marco educativo nacional." },
  { "number": 8, "filename": "8.pdf", "title": "Lineamientos para la Planeación de la Mejora Continua", "description": "Directrices oficiales para estructurar y evaluar los Planes de Mejora Continua (PMC) de los planteles de EMS." },
  { "number": 9, "filename": "9.pdf", "title": "Acuerdo 21/08/25: Marco Curricular Común de la Educación Media Superior (MCCEMS)", "description": "Establece y regula la estructura curricular, las áreas de conocimiento y los recursos sociocognitivos de la EMS." },
  { "number": 10, "filename": "10.pdf", "title": "Protocolo para la Protección y Cuidado del Estudiantado en la Revisión de Útiles Escolares", "description": "Normativas y medidas para la revisión segura de pertenencias de alumnos en planteles federales de EMS." },
  { "number": 11, "filename": "11.pdf", "title": "Protocolos de Seguridad para los Planteles Federales de EMS", "description": "Acciones preventivas, de seguridad y de reacción ante situaciones de emergencia o riesgo en los centros educativos." },
  { "number": 12, "filename": "12.pdf", "title": "Curso-Taller 2: Hacia una práctica docente colaborativa en los recursos sociocognitivos (MCCEMS)", "description": "Capacitación sobre comunicación, pensamiento matemático, conciencia histórica y cultura digital en el aula." },
  { "number": 13, "filename": "13.pdf", "title": "Acuerdo 04/07/23: Código de Conducta de la Secretaría de Educación Pública", "description": "Regula el comportamiento ético, los valores institucionales y la conducta debida de todo el personal que labora en la SEP." },
  { "number": 14, "filename": "14.pdf", "title": "Modelo Educativo del Marco Curricular Común de la EMS", "description": "Documento base explicativo del modelo educativo, el Sistema Nacional de Bachillerato y la Nueva Escuela Mexicana." },
  { "number": 15, "filename": "15.pdf", "title": "Programa Aula, Escuela y Comunidad (PAEC)", "description": "Guía práctica para estructurar los proyectos comunitarios y la vinculación transversal de la escuela con su entorno." },
  { "number": 16, "filename": "16.pdf", "title": "Declaratoria de Cero Tolerancia a las Violencias en EMS", "description": "Declaración oficial contra todo tipo de hostigamiento, acoso, discriminación o violencia de género en los planteles." }
];

let appConfig = defaultDocs;
let normasData = defaultNormas;

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
    // Load config and norms
    await loadConfig();
    await loadNormas();
    
    // Populate cycle select dropdown
    populateCycleSelect();
    
    // Apply links to DOM
    applyConfigLinks();
    renderNormas();
    
    // Initialize interactive teacher directory
    initTeacherDirectory();

    // Initialize calendar
    initCalendar();

    // Load saved API key for classifier
    loadApiKey();
    
    // Close search box on clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
            document.getElementById("search-results-box").style.display = "none";
        }
    });
});

// Load configuration JSON file
async function loadConfig() {
    try {
        const response = await fetch("config.json");
        if (response.ok) {
            appConfig = await response.json();
            console.log("Configuration loaded successfully from config.json");
        }
    } catch (e) {
        console.warn("Could not load config.json due to CORS/Network. Using embedded defaults.", e);
    }
}

// Load norms mapping JSON file
async function loadNormas() {
    try {
        const response = await fetch("../01_Direccion/01.2_Normatividad/normas_mapeo.json");
        if (response.ok) {
            normasData = await response.json();
            console.log("Norms loaded successfully from normas_mapeo.json");
        }
    } catch (e) {
        console.warn("Could not load normas_mapeo.json. Using embedded defaults.", e);
    }
}

// ==========================================================================
// DOM RENDERERS & LINK APPLIER
// ==========================================================================
function applyConfigLinks() {
    const cycle = appConfig.activeCycle;
    const docs = appConfig.cycles[cycle].documents;
    
    // General Dashboard
    setLinkElement("link-calendario", docs.general.calendarioEscolar);
    setLinkElement("link-bitacora", docs.general.bitacoraReuniones);
    setLinkElement("link-control", docs.general.controlProyectos);
    
    // Dirección
    setLinkElement("link-rrhh", docs.direccion.recursosHumanos);
    
    // Subdirección
    setLinkElement("link-control-escolar", docs.subdireccion.controlEscolar);
    setLinkElement("link-docentes", docs.subdireccion.docentes);
    setLinkElement("link-orientacion", docs.subdireccion.orientacionEducativa);
    setLinkElement("link-tutorias", docs.subdireccion.tutorias);
    setLinkElement("link-biblioteca", docs.subdireccion.biblioteca);
    
    // Coordinación Administrativa
    setLinkElement("link-inventarios", docs.coordinacionAdministrativa.inventarios);
}

function populateCycleSelect() {
    const select = document.getElementById("cycle-select");
    if (!select || !appConfig.cycles) return;
    
    select.innerHTML = "";
    for (const key in appConfig.cycles) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = appConfig.cycles[key].name;
        if (key === appConfig.activeCycle) {
            option.selected = true;
        }
        select.appendChild(option);
    }
}

function changeActiveCycle(newCycle) {
    appConfig.activeCycle = newCycle;
    applyConfigLinks();
    console.log(`Cambiado al ciclo activo: ${newCycle}`);
}

function setLinkElement(id, url) {
    const el = document.getElementById(id);
    if (el && url) {
        el.href = url;
    }
}

// Render the 16 Norms list in Dirección panel
function renderNormas() {
    const container = document.getElementById("norms-list-container");
    if (!container) return;
    
    container.innerHTML = "";
    normasData.forEach(norm => {
        const item = document.createElement("div");
        item.className = "norm-item";
        item.id = `norm-item-${norm.number}`;
        
        // Relative path to access the PDF file locally
        const pdfPath = `../01_Direccion/01.2_Normatividad/${norm.filename}`;
        
        item.innerHTML = `
            <div class="norm-num-badge">${norm.number}</div>
            <div class="norm-meta">
                <h4>${norm.title}</h4>
                <p>${norm.description}</p>
            </div>
            <a href="${pdfPath}" target="_blank" class="norm-action-btn">
                <i class="fa-solid fa-file-pdf"></i> Leer
            </a>
        `;
        container.appendChild(item);
    });
}

// ==========================================================================
// NAVIGATION (TAB SWITCHING)
// ==========================================================================
function switchTab(tabId) {
    // Hide all page sections
    const sections = document.querySelectorAll(".page-section");
    sections.forEach(sec => sec.classList.remove("active"));
    
    // Deactivate all sidebar buttons
    const buttons = document.querySelectorAll(".sidebar-nav .nav-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    // Show target section
    const targetSection = document.getElementById(`page-${tabId}`);
    if (targetSection) {
        targetSection.classList.add("active");
    }
    
    // Activate target sidebar button
    const targetButton = document.getElementById(`nav-${tabId}`);
    if (targetButton) {
        targetButton.classList.add("active");
    }
    
    // Scroll page-container to top
    document.querySelector(".page-container").scrollTop = 0;
}

// Subdirección Area Tabs switching
function switchSubArea(subAreaId) {
    // Deactivate all subarea buttons
    const buttons = document.querySelectorAll(".sub-tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    // Hide all subarea content panels
    const panels = document.querySelectorAll(".sub-area-content");
    panels.forEach(p => p.classList.remove("active"));
    
    // Find matching button and panel
    const btn = Array.from(buttons).find(b => b.getAttribute("onclick").includes(subAreaId));
    if (btn) btn.classList.add("active");
    
    const panel = document.getElementById(`sub-${subAreaId}`);
    if (panel) panel.classList.add("active");
}

// ==========================================================================
// INTERACTIVE FLOWCHART DETAIL RENDERING
// ==========================================================================
function showFlowDetail(title, desc) {
    const detailBox = document.getElementById("detail-inscripcion");
    if (detailBox) {
        detailBox.innerHTML = `
            <div>
                <div class="flow-detail-title">${title}</div>
                <div class="flow-detail-desc">${desc}</div>
            </div>
        `;
    }
}

function showFlowDetailDoc(title, desc) {
    const detailBox = document.getElementById("detail-docentes");
    if (detailBox) {
        detailBox.innerHTML = `
            <div>
                <div class="flow-detail-title">${title}</div>
                <div class="flow-detail-desc">${desc}</div>
            </div>
        `;
    }
}

function showFlowDetailOri(title, desc) {
    const detailBox = document.getElementById("detail-orientacion");
    if (detailBox) {
        detailBox.innerHTML = `
            <div>
                <div class="flow-detail-title">${title}</div>
                <div class="flow-detail-desc">${desc}</div>
            </div>
        `;
    }
}

function showFlowDetailBib(title, desc) {
    const detailBox = document.getElementById("detail-biblioteca");
    if (detailBox) {
        detailBox.innerHTML = `
            <div>
                <div class="flow-detail-title">${title}</div>
                <div class="flow-detail-desc">${desc}</div>
            </div>
        `;
    }
}

function showFlowDetailInv(title, desc) {
    const detailBox = document.getElementById("detail-inventarios");
    if (detailBox) {
        detailBox.innerHTML = `
            <div>
                <div class="flow-detail-title">${title}</div>
                <div class="flow-detail-desc">${desc}</div>
            </div>
        `;
    }
}

// ==========================================================================
// SEARCH LOGIC
// ==========================================================================
function handleSearch() {
    const query = document.getElementById("global-search").value.toLowerCase().trim();
    const resultsBox = document.getElementById("search-results-box");
    
    if (query.length < 2) {
        resultsBox.style.display = "none";
        return;
    }
    
    resultsBox.innerHTML = "";
    let matches = [];
    
    // Search in Areas
    const areas = [
        { name: "Dirección - General", id: "direccion" },
        { name: "Dirección - Recursos Humanos", id: "direccion" },
        { name: "Dirección - Normatividad de Oposición", id: "direccion" },
        { name: "Subdirección - General", id: "subdireccion" },
        { name: "Subdirección - Control Escolar", id: "subdireccion", subarea: "control-escolar" },
        { name: "Subdirección - Docentes y Horarios", id: "subdireccion", subarea: "docentes" },
        { name: "Subdirección - Orientación Educativa", id: "subdireccion", subarea: "orientacion" },
        { name: "Subdirección - Tutorías", id: "subdireccion", subarea: "orientacion" },
        { name: "Subdirección - Biblioteca", id: "subdireccion", subarea: "biblioteca" },
        { name: "Coordinación Administrativa - Inventarios", id: "coordinacion" }
    ];
    
    areas.forEach(area => {
        if (area.name.toLowerCase().includes(query)) {
            matches.push({
                title: area.name,
                category: "Área",
                action: () => {
                    switchTab(area.id);
                    if (area.subarea) {
                        switchSubArea(area.subarea);
                    }
                }
            });
        }
    });
    
    // Search in Norms
    normasData.forEach(norm => {
        if (norm.title.toLowerCase().includes(query) || norm.description.toLowerCase().includes(query) || norm.number.toString() === query) {
            matches.push({
                title: `Norma ${norm.number}: ${norm.title}`,
                category: "Normatividad",
                action: () => {
                    switchTab("direccion");
                    // Scroll to specific norm item
                    setTimeout(() => {
                        const el = document.getElementById(`norm-item-${norm.number}`);
                        if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            el.style.borderColor = "var(--accent-cyan)";
                            el.style.backgroundColor = "hsla(190, 95%, 44%, 0.15)";
                            setTimeout(() => {
                                el.style.borderColor = "var(--border-color)";
                                el.style.backgroundColor = "hsla(217, 30%, 15%, 0.3)";
                            }, 3000);
                        }
                    }, 350);
                }
            });
        }
    });
    
    // Render results
    if (matches.length > 0) {
        resultsBox.style.display = "block";
        matches.slice(0, 8).forEach(match => {
            const item = document.createElement("div");
            item.className = "search-result-item";
            
            // Category color class
            let catColor = "background-color: var(--accent-blue); color: #fff;";
            if (match.category === "Área") {
                catColor = "background-color: var(--accent-purple); color: #fff;";
            } else if (match.category === "Normatividad") {
                catColor = "background-color: var(--accent-cyan); color: #000;";
            }
            
            item.innerHTML = `
                <span class="search-result-title">${match.title}</span>
                <span class="search-result-category" style="${catColor}">${match.category}</span>
            `;
            
            item.addEventListener("click", () => {
                match.action();
                resultsBox.style.display = "none";
                document.getElementById("global-search").value = "";
            });
            
            resultsBox.appendChild(item);
        });
    } else {
        resultsBox.style.display = "block";
        resultsBox.innerHTML = `<div style="padding: 12px; font-size: 12px; color: var(--text-muted); text-align: center;">No se encontraron resultados</div>`;
    }
}

// ==========================================================================
// INTERACTIVE TEACHER DIRECTORY LOGIC
// ==========================================================================
let teacherDirectoryData = [];

async function initTeacherDirectory() {
    const cycle = appConfig.activeCycle;
    const docs = appConfig.cycles[cycle]?.documents;
    const sheetUrl = docs?.subdireccion?.controlEscolar;
    
    if (!sheetUrl) {
        console.warn("No Google Sheet URL found for controlEscolar in active cycle.");
        loadLocalDirectory();
        return;
    }
    
    const csvUrl = convertGoogleSheetUrlToCsvExport(sheetUrl);
    if (!csvUrl) {
        console.warn("Could not parse Google Sheet ID from URL.");
        loadLocalDirectory();
        return;
    }
    
    try {
        console.log(`Intentando descargar Google Sheet en vivo desde: ${csvUrl}`);
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const csvText = await response.text();
        const parsedRows = parseCsv(csvText);
        
        // Group raw rows by teacher
        const teachersMap = {};
        parsedRows.forEach((row, idx) => {
            if (idx === 0 || row.length < 4) return;
            const [grupo, materia, docente, correo] = row.map(cell => cell.trim());
            if (!grupo || grupo.toLowerCase() === "grupo" || !docente) return;
            
            if (!teachersMap[docente]) {
                teachersMap[docente] = {
                    docente: docente,
                    correo: correo || "",
                    asignaciones: {}
                };
            }
            if (correo && !teachersMap[docente].correo) {
                teachersMap[docente].correo = correo;
            }
            if (!teachersMap[docente].asignaciones[materia]) {
                teachersMap[docente].asignaciones[materia] = [];
            }
            if (!teachersMap[docente].asignaciones[materia].includes(grupo)) {
                teachersMap[docente].asignaciones[materia].push(grupo);
            }
        });
        
        // Convert map to array
        teacherDirectoryData = Object.values(teachersMap).map(t => {
            return {
                docente: t.docente,
                correo: t.correo,
                asignaciones: Object.keys(t.asignaciones).map(m => ({
                    materia: m,
                    grupos: t.asignaciones[m].sort()
                })).sort((a,b) => a.materia.localeCompare(b.materia))
            };
        }).sort((a,b) => a.docente.localeCompare(b.docente));
        
        console.log("¡Directorio cargado en vivo de forma dinámica!");
        updateSemesterAndShiftFilterOptions();
        updateGroupFilterOptions();
        filterTeacherDirectory();
        
    } catch (e) {
        console.warn("No se pudo conectar a Google Sheets en vivo. Usando local fallback directorio.json.", e);
        loadLocalDirectory();
    }
}

function loadLocalDirectory() {
    if (typeof directorioFallbackData !== 'undefined') {
        console.log("Directorio cargado de base de datos local (directorio.js)");
        teacherDirectoryData = directorioFallbackData;
        updateSemesterAndShiftFilterOptions();
        updateGroupFilterOptions();
        filterTeacherDirectory();
    } else {
        console.error("Local directory variable 'directorioFallbackData' not found.");
        showDirectoryError("No se pudo cargar el directorio local.");
    }
}

function convertGoogleSheetUrlToCsvExport(url) {
    const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch) return null;
    const id = idMatch[1];
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : "0";
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

function parseCsv(text) {
    const lines = text.split('\n');
    return lines.map(line => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    });
}

function renderTeacherDirectory(data) {
    const tbody = document.getElementById("teacher-directory-body");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No se encontraron docentes.</td></tr>`;
        return;
    }
    
    data.forEach(item => {
        const tr = document.createElement("tr");
        
        let assignmentsHtml = '';
        item.asignaciones.forEach(assign => {
            const tagsHtml = assign.grupos.map(g => `<span class="group-tag">${g}</span>`).join('');
            assignmentsHtml += `
                <div class="subject-item-box">
                    <span class="subject-name">${assign.materia}</span>
                    <div class="group-tag-list">${tagsHtml}</div>
                </div>
            `;
        });
        
        const emailText = item.correo ? `<code>${item.correo}</code>` : `<span style="color: var(--text-muted); font-style: italic;">Sin correo</span>`;
        
        tr.innerHTML = `
            <td><strong>${item.docente}</strong></td>
            <td>${emailText}</td>
            <td>${assignmentsHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterTeacherDirectory() {
    const query = document.getElementById("teacher-search")?.value.toLowerCase().trim() || "";
    const selectedSemestre = document.getElementById("filter-semestre")?.value || "all";
    const selectedTurno = document.getElementById("filter-turno")?.value || "all";
    const selectedGrupo = document.getElementById("filter-grupo")?.value || "all";
    
    const filteredData = [];
    
    teacherDirectoryData.forEach(item => {
        const matchesName = item.docente.toLowerCase().includes(query);
        const matchingAssignments = [];
        
        item.asignaciones.forEach(assign => {
            const matchesSubjectQuery = assign.materia.toLowerCase().includes(query);
            
            const matchingGroups = assign.grupos.filter(g => {
                const shift = g.substring(0, 1);
                const semester = g.substring(1, 2);
                
                const matchSemestre = (selectedSemestre === "all" || semester === selectedSemestre);
                const matchTurno = (selectedTurno === "all" || shift === selectedTurno);
                const matchGrupo = (selectedGrupo === "all" || g === selectedGrupo);
                
                return matchSemestre && matchTurno && matchGrupo;
            });
            
            if (matchingGroups.length > 0 && (query === "" || matchesName || matchesSubjectQuery)) {
                matchingAssignments.push({
                    materia: assign.materia,
                    grupos: matchingGroups
                });
            }
        });
        
        if (matchingAssignments.length > 0) {
            filteredData.push({
                docente: item.docente,
                correo: item.correo,
                asignaciones: matchingAssignments
            });
        }
    });
    
    if (activeDirectoryView === 'table') {
        renderTeacherDirectory(filteredData);
    } else if (activeDirectoryView === 'cards') {
        renderClassifiedDirectory(filteredData);
    } else if (activeDirectoryView === 'tutors') {
        renderTutorsDirectory();
    } else if (activeDirectoryView === 'exams') {
        renderExamsDirectory();
    }
}

function updateGroupFilterOptions() {
    const semestreSelect = document.getElementById("filter-semestre");
    const turnoSelect = document.getElementById("filter-turno");
    const grupoSelect = document.getElementById("filter-grupo");
    if (!grupoSelect) return;
    
    const selectedSemestre = semestreSelect ? semestreSelect.value : "all";
    const selectedTurno = turnoSelect ? turnoSelect.value : "all";
    
    const groupsSet = new Set();
    
    // Add from teacherDirectoryData
    teacherDirectoryData.forEach(teacher => {
        teacher.asignaciones.forEach(assign => {
            assign.grupos.forEach(g => {
                const shift = g.substring(0, 1);
                const semester = g.substring(1, 2);
                
                const matchSemestre = (selectedSemestre === "all" || semester === selectedSemestre);
                const matchTurno = (selectedTurno === "all" || shift === selectedTurno);
                
                if (matchSemestre && matchTurno) {
                    groupsSet.add(g);
                }
            });
        });
    });
    
    // Also add from tutoresFallbackData for active cycle to cover 6th semester and other groups
    const cycle = appConfig.activeCycle || "B.25.26";
    const cycleTutors = (typeof tutoresFallbackData !== 'undefined') ? (tutoresFallbackData[cycle] || {}) : {};
    Object.keys(cycleTutors).forEach(g => {
        const shift = g.substring(0, 1);
        const semester = g.substring(1, 2);
        
        const matchSemestre = (selectedSemestre === "all" || semester === selectedSemestre);
        const matchTurno = (selectedTurno === "all" || shift === selectedTurno);
        
        if (matchSemestre && matchTurno) {
            groupsSet.add(g);
        }
    });
    
    // Also add from globalesFallbackData for active cycle
    const cycleExams = (typeof globalesFallbackData !== 'undefined') ? (globalesFallbackData.exams || []) : [];
    cycleExams.forEach(exam => {
        const g = exam.grupo;
        const shift = g.substring(0, 1);
        const semester = g.substring(1, 2);
        
        const matchSemestre = (selectedSemestre === "all" || semester === selectedSemestre);
        const matchTurno = (selectedTurno === "all" || shift === selectedTurno);
        
        if (matchSemestre && matchTurno) {
            groupsSet.add(g);
        }
    });
    
    const sortedGroups = Array.from(groupsSet).sort();
    const previousValue = grupoSelect.value;
    
    grupoSelect.innerHTML = '<option value="all">Todos</option>';
    sortedGroups.forEach(g => {
        const option = document.createElement("option");
        option.value = g;
        option.textContent = g;
        if (g === previousValue) {
            option.selected = true;
        }
        grupoSelect.appendChild(option);
    });
}

function onSemesterOrShiftChange() {
    updateGroupFilterOptions();
    filterTeacherDirectory();
}

function showDirectoryError(msg) {
    const tbody = document.getElementById("teacher-directory-body");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--accent-red);">${msg} (Asegúrate de que la hoja de Google Sheets sea accesible o ejecuta el script de actualización)</td></tr>`;
    }
}

// Override changeActiveCycle to also reload the directory
const originalChangeActiveCycle = changeActiveCycle;
changeActiveCycle = function(newCycle) {
    originalChangeActiveCycle(newCycle);
    initTeacherDirectory();
};

// ==========================================================================
// ADDED ACTIVE DIRECTORY VIEW TOGGLE & SEMESTER FILTER POPULATION
// ==========================================================================
let activeDirectoryView = 'table';
let activeExamsSubView = 'table';

function switchExamsSubView(subView) {
    activeExamsSubView = subView;
    const btnTable = document.getElementById("btn-view-exams-table");
    const btnTimeline = document.getElementById("btn-view-exams-timeline");
    const tableView = document.getElementById("exams-table-subview");
    const timelineView = document.getElementById("exams-timeline-subview");
    
    if (btnTable) btnTable.classList.toggle("active", subView === 'table');
    if (btnTimeline) btnTimeline.classList.toggle("active", subView === 'timeline');
    
    if (tableView) tableView.style.display = subView === 'table' ? 'block' : 'none';
    if (timelineView) timelineView.style.display = subView === 'timeline' ? 'block' : 'none';
    
    renderExamsDirectory();
}

function switchDirectoryView(viewMode) {
    activeDirectoryView = viewMode;
    
    const btnTable = document.getElementById("btn-view-table-dir");
    const btnCards = document.getElementById("btn-view-cards-dir");
    const btnTutors = document.getElementById("btn-view-tutors-dir");
    const btnExams = document.getElementById("btn-view-exams-dir");
    const tableContainer = document.getElementById("directory-table-view");
    const cardsContainer = document.getElementById("directory-cards-view");
    const tutorsContainer = document.getElementById("directory-tutors-view");
    const examsContainer = document.getElementById("directory-exams-view");
    const dateFilterItem = document.getElementById("filter-fecha-item");
    
    // Reset buttons
    if (btnTable) btnTable.classList.remove("active");
    if (btnCards) btnCards.classList.remove("active");
    if (btnTutors) btnTutors.classList.remove("active");
    if (btnExams) btnExams.classList.remove("active");
    
    // Reset containers
    if (tableContainer) tableContainer.style.display = "none";
    if (cardsContainer) cardsContainer.style.display = "none";
    if (tutorsContainer) tutorsContainer.style.display = "none";
    if (examsContainer) examsContainer.style.display = "none";
    
    // Toggle date filter visibility
    if (dateFilterItem) {
        if (viewMode === 'exams') {
            dateFilterItem.style.display = "block";
            updateExamsDateFilterOptions();
        } else {
            dateFilterItem.style.display = "none";
        }
    }
    
    if (viewMode === 'table') {
        if (btnTable) btnTable.classList.add("active");
        if (tableContainer) tableContainer.style.display = "block";
    } else if (viewMode === 'cards') {
        if (btnCards) btnCards.classList.add("active");
        if (cardsContainer) cardsContainer.style.display = "grid";
    } else if (viewMode === 'tutors') {
        if (btnTutors) btnTutors.classList.add("active");
        if (tutorsContainer) tutorsContainer.style.display = "block";
    } else if (viewMode === 'exams') {
        if (btnExams) btnExams.classList.add("active");
        if (examsContainer) examsContainer.style.display = "block";
    }
    filterTeacherDirectory();
}

function updateSemesterAndShiftFilterOptions() {
    const semestreSelect = document.getElementById("filter-semestre");
    const turnoSelect = document.getElementById("filter-turno");
    if (!semestreSelect || !turnoSelect) return;

    const semSet = new Set();
    const turnoSet = new Set();

    teacherDirectoryData.forEach(item => {
        item.asignaciones.forEach(assign => {
            assign.grupos.forEach(g => {
                if (g.length >= 2) {
                    const shift = g.substring(0, 1);
                    const semester = g.substring(1, 2);
                    if (shift === "M" || shift === "V") {
                        turnoSet.add(shift);
                    }
                    if (!isNaN(semester)) {
                        semSet.add(semester);
                    }
                }
            });
        });
    });

    // Also populate from tutoresFallbackData for active cycle to cover 6th semester and other groups
    const cycle = appConfig.activeCycle || "B.25.26";
    const cycleTutors = (typeof tutoresFallbackData !== 'undefined') ? (tutoresFallbackData[cycle] || {}) : {};
    Object.keys(cycleTutors).forEach(g => {
        if (g.length >= 2) {
            const shift = g.substring(0, 1);
            const semester = g.substring(1, 2);
            if (shift === "M" || shift === "V") {
                turnoSet.add(shift);
            }
            if (!isNaN(semester)) {
                semSet.add(semester);
            }
        }
    });

    // Also populate from globalesFallbackData for active cycle to cover any other groups/semesters
    const cycleExams = (typeof globalesFallbackData !== 'undefined') ? (globalesFallbackData.exams || []) : [];
    cycleExams.forEach(exam => {
        const g = exam.grupo;
        if (g.length >= 2) {
            const shift = g.substring(0, 1);
            const semester = g.substring(1, 2);
            if (shift === "M" || shift === "V") {
                turnoSet.add(shift);
            }
            if (!isNaN(semester)) {
                semSet.add(semester);
            }
        }
    });

    const prevSem = semestreSelect.value;
    const prevTurno = turnoSelect.value;

    semestreSelect.innerHTML = '<option value="all">Todos</option>';
    Array.from(semSet).sort().forEach(sem => {
        const opt = document.createElement("option");
        opt.value = sem;
        opt.textContent = `${sem}º Semestre`;
        if (sem === prevSem) opt.selected = true;
        semestreSelect.appendChild(opt);
    });

    turnoSelect.innerHTML = '<option value="all">Todos</option>';
    Array.from(turnoSet).sort().forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t === "M" ? "Matutino" : "Vespertino";
        if (t === prevTurno) opt.selected = true;
        turnoSelect.appendChild(opt);
    });
}

function renderClassifiedDirectory(filteredData) {
    const container = document.getElementById("directory-cards-view");
    if (!container) return;

    container.innerHTML = "";

    // Map filteredData to group-centric format
    const groupsMap = {};

    filteredData.forEach(item => {
        const teacherName = item.docente;
        const teacherEmail = item.correo;

        item.asignaciones.forEach(assign => {
            const subject = assign.materia;
            assign.grupos.forEach(g => {
                if (!groupsMap[g]) {
                    groupsMap[g] = {
                        grupo: g,
                        shift: g.substring(0, 1),
                        semester: g.substring(1, 2),
                        materias: []
                    };
                }
                groupsMap[g].materias.push({
                    materia: subject,
                    docente: teacherName,
                    correo: teacherEmail
                });
            });
        });
    });

    const sortedGroups = Object.keys(groupsMap).sort();

    if (sortedGroups.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No se encontraron grupos con los filtros actuales.</div>`;
        return;
    }

    const cycle = appConfig.activeCycle || "B.25.26";
    const cycleTutors = (typeof tutoresFallbackData !== 'undefined') ? (tutoresFallbackData[cycle] || {}) : {};

    sortedGroups.forEach(gCode => {
        const groupInfo = groupsMap[gCode];
        const card = document.createElement("div");
        card.className = "group-card";

        let semClass = "grad-sem-other";
        if (groupInfo.semester === "2") semClass = "grad-sem2";
        else if (groupInfo.semester === "4") semClass = "grad-sem4";
        else if (groupInfo.semester === "6") semClass = "grad-sem6";

        const shiftBadgeClass = groupInfo.shift === "M" ? "badge-matutino" : "badge-vespertino";
        const shiftText = groupInfo.shift === "M" ? "Matutino" : "Vespertino";
        const tutorName = cycleTutors[gCode] || "No asignado";

        let materiasHtml = "";
        groupInfo.materias.sort((a,b) => a.materia.localeCompare(b.materia)).forEach(m => {
            const mailtoLink = m.correo ? `href="mailto:${m.correo}?subject=Consulta%20-%20Grupo%20${gCode}"` : '';
            const mailIconHtml = m.correo ? `
                <a ${mailtoLink} class="email-action-icon" title="Enviar correo a ${m.docente}">
                    <i class="fa-solid fa-envelope"></i>
                </a>` : '';
            materiasHtml += `
                <div class="card-subject-item">
                    <div class="card-subject-header">
                        <span class="card-subject-title">${m.materia}</span>
                    </div>
                    <div class="card-teacher-meta">
                        <span class="card-teacher-name">${m.docente}</span>
                        ${mailIconHtml}
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="group-card-header ${semClass}">
                <span class="group-card-title">Grupo ${gCode}</span>
                <span class="group-card-badge ${shiftBadgeClass}">${shiftText}</span>
            </div>
            <div class="group-card-tutor">
                <i class="fa-solid fa-user-shield"></i>
                <span>Tutor: <strong>${tutorName}</strong></span>
            </div>
            <div class="group-card-body">
                ${materiasHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

function renderTutorsDirectory() {
    const tbody = document.getElementById("tutors-directory-body");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    const cycle = appConfig.activeCycle || "B.25.26";
    const cycleTutors = (typeof tutoresFallbackData !== 'undefined') ? (tutoresFallbackData[cycle] || {}) : {};
    
    const query = document.getElementById("teacher-search")?.value.toLowerCase().trim() || "";
    const selectedSemestre = document.getElementById("filter-semestre")?.value || "all";
    const selectedTurno = document.getElementById("filter-turno")?.value || "all";
    const selectedGrupo = document.getElementById("filter-grupo")?.value || "all";
    
    const filteredTutors = [];
    
    Object.keys(cycleTutors).sort().forEach(gCode => {
        const tutorName = cycleTutors[gCode];
        
        // Extract shift and semester
        const shift = gCode.substring(0, 1);
        const semester = gCode.substring(1, 2);
        
        // Apply filters
        const matchesQuery = gCode.toLowerCase().includes(query) || tutorName.toLowerCase().includes(query);
        const matchesSemestre = (selectedSemestre === "all" || semester === selectedSemestre);
        const matchesTurno = (selectedTurno === "all" || shift === selectedTurno);
        const matchesGrupo = (selectedGrupo === "all" || gCode === selectedGrupo);
        
        if (matchesQuery && matchesSemestre && matchesTurno && matchesGrupo) {
            filteredTutors.push({
                grupo: gCode,
                turno: shift === "M" ? "Matutino" : (shift === "V" ? "Vespertino" : "Otro"),
                semestre: semester,
                tutor: tutorName
            });
        }
    });
    
    if (filteredTutors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No se encontraron tutores.</td></tr>`;
        return;
    }
    
    filteredTutors.forEach(item => {
        const tr = document.createElement("tr");
        
        const shiftBadgeClass = item.grupo.startsWith("M") ? "badge-matutino" : "badge-vespertino";
        const semesterText = `${item.semestre}º Semestre`;
        
        tr.innerHTML = `
            <td><span class="group-tag" style="font-size: 14px; padding: 6px 12px;">${item.grupo}</span></td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>${semesterText}</span>
                    <span class="group-card-badge ${shiftBadgeClass}" style="margin: 0; padding: 2px 8px; font-size: 10px;">${item.turno}</span>
                </div>
            </td>
            <td><strong>${item.tutor}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// CALENDARIO ESCOLAR LOGIC
// ==========================================================================
let activeCalendarView = 'table';

function initCalendar() {
    if (typeof calendarioFallbackData === 'undefined') {
        console.error("No se encontró la base de datos de calendario (calendarioFallbackData).");
        return;
    }
    renderCalendarTable(calendarioFallbackData.activities);
    renderCalendarWeeks(calendarioFallbackData.weeks);
}

function switchCalendarView(viewMode) {
    activeCalendarView = viewMode;
    const btnTable = document.getElementById("btn-view-table-cal");
    const btnWeeks = document.getElementById("btn-view-weeks-cal");
    const listView = document.getElementById("calendar-list-view");
    const weeksView = document.getElementById("calendar-weeks-view");

    if (viewMode === 'table') {
        if (btnTable) btnTable.classList.add("active");
        if (btnWeeks) btnWeeks.classList.remove("active");
        if (listView) listView.style.display = "block";
        if (weeksView) weeksView.style.display = "none";
    } else {
        if (btnTable) btnTable.classList.remove("active");
        if (btnWeeks) btnWeeks.classList.add("active");
        if (listView) listView.style.display = "none";
        if (weeksView) weeksView.style.display = "block";
    }
    filterCalendar();
}

function renderCalendarTable(activities) {
    const tbody = document.getElementById("calendar-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (activities.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No se encontraron actividades.</td></tr>`;
        return;
    }

    activities.forEach(act => {
        const tr = document.createElement("tr");
        
        let badgeClass = "resp-general";
        const resp = act.responsable.toLowerCase();
        if (resp.includes("control")) badgeClass = "resp-control";
        else if (resp.includes("subdire")) badgeClass = "resp-subdir";
        else if (resp.includes("docent")) badgeClass = "resp-docent";
        else if (resp.includes("estudia")) badgeClass = "resp-estud";
        else if (resp.includes("tutor")) badgeClass = "resp-tutor";
        else if (resp.includes("general")) badgeClass = "resp-general";

        tr.innerHTML = `
            <td><strong>${act.actividad}</strong></td>
            <td><span class="activity-resp-badge ${badgeClass}">${act.responsable}</span></td>
            <td><code>${act.fecha}</code></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCalendarWeeks(weeks) {
    const container = document.getElementById("weeks-timeline-container");
    if (!container) return;
    container.innerHTML = "";

    weeks.forEach(w => {
        const card = document.createElement("div");
        card.className = "week-timeline-card";

        let holidayHtml = "";
        const semNum = parseInt(w.semana.replace(/\D/g, ""));
        
        if (semNum === 6) {
            holidayHtml = `
                <div class="holiday-badge">
                    <i class="fa-solid fa-calendar-day"></i>
                    <span><strong>16 de marzo</strong>: Natalicio de Benito Juárez</span>
                </div>`;
        } else if (semNum === 10) {
            holidayHtml = `
                <div class="holiday-badge">
                    <i class="fa-solid fa-calendar-day"></i>
                    <span><strong>01 de mayo</strong>: Día del Trabajo</span>
                </div>`;
        } else if (semNum === 11) {
            holidayHtml = `
                <div class="holiday-badge">
                    <i class="fa-solid fa-calendar-day"></i>
                    <span><strong>05 de mayo</strong>: Batalla de Puebla</span>
                </div>`;
        } else if (semNum === 12) {
            holidayHtml = `
                <div class="holiday-badge">
                    <i class="fa-solid fa-calendar-day"></i>
                    <span><strong>15 de mayo</strong>: Día del Maestro</span>
                </div>`;
        }

        let actsHtml = "";
        if (w.actividades_relacionadas && w.actividades_relacionadas.length > 0) {
            w.actividades_relacionadas.forEach(actName => {
                const actObj = calendarioFallbackData.activities.find(a => a.actividad.includes(actName) || actName.includes(a.actividad));
                const respText = actObj ? actObj.responsable : "General";
                
                let badgeClass = "resp-general";
                const resp = respText.toLowerCase();
                if (resp.includes("control")) badgeClass = "resp-control";
                else if (resp.includes("subdire")) badgeClass = "resp-subdir";
                else if (resp.includes("docent")) badgeClass = "resp-docent";
                else if (resp.includes("estudia")) badgeClass = "resp-estud";
                else if (resp.includes("tutor")) badgeClass = "resp-tutor";
                
                actsHtml += `
                    <div class="week-activity-item">
                        <i class="fa-solid fa-circle"></i>
                        <span>${actName} <span class="activity-resp-badge ${badgeClass}">${respText}</span></span>
                    </div>
                `;
            });
        } else {
            actsHtml = `<div style="font-size: 11px; color: var(--text-muted); font-style: italic;">Sin actividades programadas</div>`;
        }

        card.innerHTML = `
            <div class="week-card-header">
                <span class="week-card-title">${w.semana}</span>
                <span class="week-card-dates">${w.fechas}</span>
            </div>
            <div class="week-card-body">
                ${actsHtml}
                ${holidayHtml}
            </div>
        `;
        
        container.appendChild(card);

        if (semNum === 7) {
            const vacCard = document.createElement("div");
            vacCard.className = "vacation-card";
            vacCard.innerHTML = `
                <i class="fa-solid fa-umbrella-beach"></i>
                <div>
                    <h4>Periodo Vacacional de Semana Santa</h4>
                    <p>30 de marzo al 10 de abril (Suspensión total de labores)</p>
                </div>
            `;
            container.appendChild(vacCard);
        }
    });
}

function filterCalendar() {
    const query = document.getElementById("calendar-search")?.value.toLowerCase().trim() || "";
    const selectedResp = document.getElementById("filter-calendar-responsable")?.value || "all";

    const filteredActivities = calendarioFallbackData.activities.filter(act => {
        const matchQuery = act.actividad.toLowerCase().includes(query) || act.responsable.toLowerCase().includes(query) || act.fecha.toLowerCase().includes(query);
        const matchResp = (selectedResp === "all" || act.responsable === selectedResp);
        return matchQuery && matchResp;
    });

    const filteredWeeks = [];
    calendarioFallbackData.weeks.forEach(w => {
        const matchWeekName = w.semana.toLowerCase().includes(query) || w.fechas.toLowerCase().includes(query);
        
        const matchingRelatedActs = w.actividades_relacionadas.filter(actName => {
            const actObj = calendarioFallbackData.activities.find(a => a.actividad.includes(actName) || actName.includes(a.actividad));
            if (!actObj) return false;
            
            const matchQuery = actObj.actividad.toLowerCase().includes(query) || actObj.responsable.toLowerCase().includes(query);
            const matchResp = (selectedResp === "all" || actObj.responsable === selectedResp);
            return matchQuery && matchResp;
        });

        if (matchWeekName || matchingRelatedActs.length > 0) {
            filteredWeeks.push({
                semana: w.semana,
                fechas: w.fechas,
                actividades_relacionadas: matchingRelatedActs.length > 0 ? matchingRelatedActs : (query === "" ? w.actividades_relacionadas : [])
            });
        }
    });

    if (activeCalendarView === 'table') {
        renderCalendarTable(filteredActivities);
    } else {
        renderCalendarWeeks(filteredWeeks);
    }
}

// ==========================================================================
// EMAIL CLASIFICATOR LOGIC (LOCAL & GEMINI API CLIENT)
// ==========================================================================
const fallbackRules = [
    {
        keywords: ["inscripcion", "reinscripcion", "matricula", "expediente", "certificado", "constancia", "documento", "acta", "curp", "baja"],
        category: "Control Escolar",
        area: "Subdirección - Control Escolar",
        priority: "Media",
        sender: "Alumno / Padre de familia",
        summary: "Trámite escolar relacionado con inscripción, reinscripción o solicitud de documentos oficiales del plantel.",
        actions: [
            "Verificar el expediente físico o digital del estudiante.",
            "Revisar el estado de acreditación de materias y situación escolar del alumno.",
            "Cotejar información en la base de datos de matrícula del Google Sheet de Subdirección."
        ],
        draft: "Estimada/o [Remitente],\n\nHe recibido su solicitud con respecto a trámites escolares. Le informo que para dar seguimiento formal a esta petición en el área de Control Escolar del CEB, es necesario contar con la documentación oficial correspondiente.\n\nPuede consultar los requisitos detallados y formatos de solicitud abriendo el enlace de Control Escolar en el portal del plantel, o presentarse directamente en ventanilla durante el horario de atención.\n\nQuedamos a su entera disposición.\n\nAtentamente,\nOficina de Control Escolar\nCEB 5/4 Rafael Ramírez"
    },
    {
        keywords: ["horario", "clase", "aula", "grupo", "carga acad", "planeacion", "docente", "profesor", "materia", "academia"],
        category: "Docentes y Horarios",
        area: "Subdirección - Docentes",
        priority: "Alta",
        sender: "Docente",
        summary: "Asunto relacionado con planeaciones semestrales, cargas académicas, compatibilidad de empleos o sugerencias de cambio de horario.",
        actions: [
            "Consultar el horario de docentes y grupos en el Google Sheet central del ciclo actual.",
            "Verificar la disponibilidad física de aulas en el turno correspondiente (Matutino/Vespertino).",
            "Programar una mesa de diálogo en la Subdirección en caso de requerirse un ajuste curricular especial."
        ],
        draft: "Estimada/o Profesora/Profesor,\n\nAcuso recibo de su mensaje referente a sus horarios y asignaciones académicas. Le informo que la Subdirección Académica se encuentra validando las compatibilidades horarias globales para evitar cruces en el plantel.\n\nLe sugeriero revisar el Google Sheet de Horarios del Ciclo B.25.26 para confirmar los detalles vigentes. Si requiere plantear una situación particular de compatibilidad, agradeceré agendar una breve reunión con mi oficina.\n\nSaludos cordiales,\nSubdirección Académica\nCEB 5/4 Rafael Ramírez"
    },
    {
        keywords: ["justificante", "inasistencia", "tutor", "apoyo", "orientacion", "psico", "canaliza", "conducta", "falta", "reporte"],
        category: "Orientación y Tutorías",
        area: "Subdirección - Orientación Educativa",
        priority: "Alta",
        sender: "Tutor de Grupo / Padre de familia",
        summary: "Reporte de inasistencia justificada de un alumno, solicitud de apoyo psicopedagógico o reporte de conducta grupal.",
        actions: [
            "Registrar el justificante o reporte conductual en el expediente interno del estudiante en Orientación.",
            "Agendar una entrevista de seguimiento con el estudiante, padre de familia y el tutor del grupo.",
            "Notificar a los docentes que imparten clase en el grupo para permitir la entrega extemporánea de tareas."
        ],
        draft: "Estimado Padre de Familia / Tutor,\n\nConfirmamos la recepción del reporte/justificante médico o personal de inasistencia para el estudiante. Hemos turnado de inmediato la información al área de Orientación Educativa para su registro oficial y apoyo psicopedagógico.\n\nLe recordamos coordinar directamente con el tutor del grupo y los docentes correspondientes para que el estudiante pueda ponerse al corriente con los trabajos y evaluaciones rezagadas.\n\nAtentamente,\nÁrea de Orientación Educativa y Tutorías\nCEB 5/4 Rafael Ramírez"
    },
    {
        keywords: ["inventario", "banco", "computadora", "proyector", "papeleria", "mobiliario", "baja de bien", "recurso material", "silla", "escritorio"],
        category: "Inventarios",
        area: "Coordinación Administrativa",
        priority: "Media",
        sender: "Personal Docente/Administrativo",
        summary: "Reporte de daños, fallas técnicas en equipos o requerimiento de insumos materiales en las aulas u oficinas.",
        actions: [
            "Verificar el inventario de bienes en el Google Sheet de Recursos Materiales.",
            "Realizar una inspección física del equipo de cómputo, proyector o mobiliario reportado.",
            "Registrar el movimiento o programar el servicio de mantenimiento con Coordinación Administrativa."
        ],
        draft: "Estimado Miembro del Personal,\n\nHemos registrado su reporte sobre recursos materiales / fallas técnicas. La Coordinación Administrativa revisará las existencias en almacén e inspeccionará el estado físico de los equipos a la brevedad.\n\nLe recordamos firmar las actas de resguardo oficiales en caso de recibir material o equipamiento nuevo asignado.\n\nSaludos cordiales,\nCoordinación Administrativa\nCEB 5/4 Rafael Ramírez"
    },
    {
        keywords: ["oficio", "directivo", "reunion", "circular", "convocatoria", "incidencia", "plaza", "nombramiento", "rh", "contrato", "personal"],
        category: "Dirección y Recursos Humanos",
        area: "Dirección",
        priority: "Alta",
        sender: "Autoridad Superior / Personal",
        summary: "Comunicaciones institucionales, oficios oficiales de la DGB, licencias del personal o incidencias en plazas federales.",
        actions: [
            "Consultar las disposiciones en el marco normativo federal del portal (16 Leyes y Acuerdos).",
            "Cotejar el estatus administrativo en el expediente de Recursos Humanos.",
            "Asignar la minuta o acuerdo en la Bitácora de Dirección para su seguimiento estratégico."
        ],
        draft: "Estimada/o,\n\nPor instrucción de la Dirección del Plantel, acuso recibo del oficio / documento enviado. Le informo que este asunto se está analizando conforme a las leyes y lineamientos que rigen a la Dirección General de Bachillerato.\n\nEstaremos en comunicación a la brevedad para brindarle detalles sobre el desahogo de esta gestión o citarle a reunión si es necesario.\n\nAtentamente,\nOficina de Dirección\nCEB 5/4 Rafael Ramírez"
    }
];

function toggleApiSettings() {
    const panel = document.getElementById("api-settings-panel");
    if (panel) {
        panel.style.display = panel.style.display === "none" ? "block" : "none";
    }
}

function saveApiKey() {
    const keyInput = document.getElementById("gemini-api-key");
    const status = document.getElementById("api-key-status");
    if (keyInput && status) {
        const key = keyInput.value.trim();
        if (key) {
            localStorage.setItem("gemini_api_key", key);
            status.textContent = "API Key guardada localmente de forma segura.";
            status.style.color = "var(--accent-green)";
            setTimeout(() => toggleApiSettings(), 1200);
        } else {
            localStorage.removeItem("gemini_api_key");
            status.textContent = "API Key eliminada.";
            status.style.color = "var(--accent-red)";
        }
    }
}

function loadApiKey() {
    const keyInput = document.getElementById("gemini-api-key");
    const key = localStorage.getItem("gemini_api_key");
    if (keyInput && key) {
        keyInput.value = key;
        const status = document.getElementById("api-key-status");
        if (status) {
            status.textContent = "API Key cargada y lista.";
            status.style.color = "var(--accent-cyan)";
        }
    }
}

function copyDraft() {
    const draftTextarea = document.getElementById("result-draft");
    if (draftTextarea) {
        draftTextarea.select();
        document.execCommand("copy");
        
        // Visual feedback
        const btn = document.querySelector(".btn-purple[onclick='copyDraft()']");
        if (btn) {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-check"></i> ¡Copiado!`;
            setTimeout(() => btn.innerHTML = originalHtml, 2000);
        }
    }
}

async function processEmail() {
    const subject = document.getElementById("email-subject")?.value.trim() || "";
    const body = document.getElementById("email-body")?.value.trim() || "";
    
    if (!subject && !body) {
        alert("Por favor introduce el asunto o el cuerpo del correo.");
        return;
    }
    
    // Show spinner in button
    const btn = document.getElementById("btn-classify");
    const placeholder = document.getElementById("classifier-placeholder-card");
    const results = document.getElementById("classifier-results-card");
    const modeBadge = document.getElementById("result-mode-badge");
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="loading-spinner"></span> Analizando correo...`;
    }
    
    const apiKey = localStorage.getItem("gemini_api_key");
    
    if (apiKey) {
        try {
            console.log("Iniciando clasificación inteligente con Gemini API...");
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            
            const systemPrompt = `Eres un asistente de IA experto en administración escolar de educación media superior para el Centro de Estudios de Bachillerato (CEB) 5/4 "Profr. Rafael Ramírez".
Tu tarea es analizar correos que recibe la dirección/subdirección y devolver la información estructurada estrictamente en formato JSON válido.
Analiza el Asunto y el Cuerpo del correo proporcionados y extrae:
1. "category": Clasificación del correo (ej: "Control Escolar", "Docentes y Horarios", "Orientación y Tutorías", "Inventarios", "Dirección y Recursos Humanos", "Otro").
2. "priority": "Alta", "Media" o "Baja".
3. "area": Área escolar sugerida para resolverlo (ej: "Subdirección - Control Escolar", "Subdirección - Docentes", "Subdirección - Orientación Educativa", "Coordinación Administrativa", "Dirección").
4. "sender": Tipo de remitente probable (ej: "Estudiante", "Padre de familia", "Docente", "Personal Administrativo", "Externo").
5. "summary": Un resumen ejecutivo claro y conciso de 1-2 oraciones en español.
6. "actions": Una lista de 2-4 acciones administrativas específicas que debe tomar la escuela en español.
7. "draft": Un borrador de respuesta oficial de la escuela en español, formal, respetuoso, redactado con lenguaje institucional y usando marcadores de posición razonables como [Nombre].

IMPORTANTE: Devuelve ÚNICAMENTE el objeto JSON sin formato markdown (sin \`\`\`json y sin comentarios).
{
  "category": "...",
  "priority": "...",
  "area": "...",
  "sender": "...",
  "summary": "...",
  "actions": ["...", "..."],
  "draft": "..."
}`;
            
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: systemPrompt },
                            { text: `Asunto: ${subject}\nCuerpo del Correo: ${body}` }
                        ]
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const resJson = await response.json();
            const rawText = resJson.candidates[0].content.parts[0].text.trim();
            
            // Clean markdown indicators if model returned them
            let jsonString = rawText;
            if (rawText.startsWith("```")) {
                jsonString = rawText.replace(/```json|```/g, "").trim();
            }
            
            const aiData = JSON.parse(jsonString);
            
            // Populate UI
            document.getElementById("result-category").textContent = aiData.category || "General";
            
            const priorityEl = document.getElementById("result-priority");
            const priorityIcon = document.getElementById("priority-icon-container");
            const priority = aiData.priority || "Media";
            priorityEl.textContent = priority;
            
            if (priority.toLowerCase() === "alta") {
                priorityEl.style.color = "var(--accent-red)";
                priorityIcon.style.color = "var(--accent-red)";
                priorityIcon.style.background = "hsla(355, 85%, 55%, 0.1)";
            } else if (priority.toLowerCase() === "media") {
                priorityEl.style.color = "var(--accent-gold)";
                priorityIcon.style.color = "var(--accent-gold)";
                priorityIcon.style.background = "hsla(38, 92%, 50%, 0.1)";
            } else {
                priorityEl.style.color = "var(--accent-green)";
                priorityIcon.style.color = "var(--accent-green)";
                priorityIcon.style.background = "hsla(142, 71%, 45%, 0.1)";
            }
            
            document.getElementById("result-area").textContent = aiData.area || "Dirección";
            document.getElementById("result-sender").textContent = aiData.sender || "Externo";
            document.getElementById("result-summary").textContent = aiData.summary || "Sin resumen disponible.";
            
            const actionsUl = document.getElementById("result-actions");
            actionsUl.innerHTML = "";
            (aiData.actions || []).forEach(act => {
                const li = document.createElement("li");
                li.textContent = act;
                actionsUl.appendChild(li);
            });
            
            document.getElementById("result-draft").value = aiData.draft || "";
            
            // Configure Mailto
            const cleanSubject = `RE: ${subject || "Consulta Escolar CEB"}`;
            const cleanDraftBody = aiData.draft || "";
            document.getElementById("result-mailto-btn").href = `mailto:?subject=${encodeURIComponent(cleanSubject)}&body=${encodeURIComponent(cleanDraftBody)}`;
            
            if (modeBadge) {
                modeBadge.textContent = "Gemini AI";
                modeBadge.className = "badge-purple";
                modeBadge.style.background = "hsla(262, 83%, 58%, 0.2)";
                modeBadge.style.color = "var(--accent-purple)";
            }
            
            if (placeholder) placeholder.style.display = "none";
            if (results) results.style.display = "block";
            
        } catch (err) {
            console.warn("Fallo en Gemini AI. Usando motor offline de respaldo...", err);
            runLocalClassifier(subject, body);
        }
    } else {
        console.log("No se detectó API Key. Usando motor offline de respaldo...");
        runLocalClassifier(subject, body);
    }
    
    // Reset button state
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Analizar y Clasificar Correo`;
    }
}

function runLocalClassifier(subject, body) {
    const fullText = (subject + " " + body).toLowerCase();
    
    // Find matching rule
    let matchedRule = null;
    let maxMatches = 0;
    
    fallbackRules.forEach(rule => {
        let matches = 0;
        rule.keywords.forEach(kw => {
            if (fullText.includes(kw)) matches++;
        });
        if (matches > maxMatches) {
            maxMatches = matches;
            matchedRule = rule;
        }
    });
    
    // Use fallback rule or generic
    const rule = matchedRule || {
        category: "General",
        area: "Dirección / Subdirección",
        priority: "Media",
        sender: "Remitente externo",
        summary: "Petición general de información o asunto curricular no clasificado por palabras clave.",
        actions: [
            "Revisar el asunto detalladamente en el área correspondiente.",
            "Cotejar normativas si se trata de una solicitud formal.",
            "Asignar responsable de seguimiento."
        ],
        draft: `Estimada/o,\n\nConfirmamos la recepción de su mensaje. Estamos canalizando su consulta con el departamento correspondiente para darle una respuesta adecuada.\n\nLe agradecemos su comunicación.\n\nAtentamente,\nAdministración Escolar\nCEB 5/4 Rafael Ramírez`
    };
    
    // Populate UI
    document.getElementById("result-category").textContent = rule.category;
    
    const priorityEl = document.getElementById("result-priority");
    const priorityIcon = document.getElementById("priority-icon-container");
    priorityEl.textContent = rule.priority;
    
    if (rule.priority.toLowerCase() === "alta") {
        priorityEl.style.color = "var(--accent-red)";
        priorityIcon.style.color = "var(--accent-red)";
        priorityIcon.style.background = "hsla(355, 85%, 55%, 0.1)";
    } else {
        priorityEl.style.color = "var(--accent-gold)";
        priorityIcon.style.color = "var(--accent-gold)";
        priorityIcon.style.background = "hsla(38, 92%, 50%, 0.1)";
    }
    
    document.getElementById("result-area").textContent = rule.area;
    document.getElementById("result-sender").textContent = rule.sender;
    document.getElementById("result-summary").textContent = rule.summary;
    
    const actionsUl = document.getElementById("result-actions");
    actionsUl.innerHTML = "";
    rule.actions.forEach(act => {
        const li = document.createElement("li");
        li.textContent = act;
        actionsUl.appendChild(li);
    });
    
    document.getElementById("result-draft").value = rule.draft;
    
    // Configure Mailto
    const cleanSubject = `RE: ${subject || "Consulta Escolar CEB"}`;
    const cleanDraftBody = rule.draft;
    document.getElementById("result-mailto-btn").href = `mailto:?subject=${encodeURIComponent(cleanSubject)}&body=${encodeURIComponent(cleanDraftBody)}`;
    
    const modeBadge = document.getElementById("result-mode-badge");
    if (modeBadge) {
        modeBadge.textContent = "Offline";
        modeBadge.className = "badge-green";
        modeBadge.style.background = "hsla(142, 71%, 45%, 0.2)";
        modeBadge.style.color = "var(--accent-green)";
    }
    
    const placeholder = document.getElementById("classifier-placeholder-card");
    const results = document.getElementById("classifier-results-card");
    if (placeholder) placeholder.style.display = "none";
    if (results) results.style.display = "block";
}

function updateExamsDateFilterOptions() {
    const fechaSelect = document.getElementById("filter-fecha");
    if (!fechaSelect) return;
    
    const cycleExams = (typeof globalesFallbackData !== 'undefined') ? (globalesFallbackData.exams || []) : [];
    
    const datesSet = new Set();
    cycleExams.forEach(exam => {
        if (exam.fecha) {
            datesSet.add(exam.fecha);
        }
    });
    
    const sortedDates = Array.from(datesSet).sort((a, b) => {
        const parseDate = (dStr) => {
            const parts = dStr.split('/');
            if (parts.length === 3) {
                return `20${parts[2]}${parts[1]}${parts[0]}`;
            }
            return dStr;
        };
        return parseDate(a).localeCompare(parseDate(b));
    });
    
    const previousValue = fechaSelect.value;
    fechaSelect.innerHTML = '<option value="all">Todos los días</option>';
    
    sortedDates.forEach(d => {
        const option = document.createElement("option");
        option.value = d;
        let displayDate = d;
        const parts = d.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
            displayDate = `${day} de ${months[month - 1]} (20${parts[2]})`;
        }
        option.textContent = displayDate;
        if (d === previousValue) {
            option.selected = true;
        }
        fechaSelect.appendChild(option);
    });
}

function renderExamsDirectory() {
    const tbody = document.getElementById("exams-directory-body");
    const auditContainer = document.getElementById("exams-audit-container");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    const cycleExams = (typeof globalesFallbackData !== 'undefined') ? (globalesFallbackData.exams || []) : [];
    const cycleWarnings = (typeof globalesFallbackData !== 'undefined') ? (globalesFallbackData.warnings || []) : [];
    
    const query = document.getElementById("teacher-search")?.value.toLowerCase().trim() || "";
    const selectedSemestre = document.getElementById("filter-semestre")?.value || "all";
    const selectedTurno = document.getElementById("filter-turno")?.value || "all";
    const selectedGrupo = document.getElementById("filter-grupo")?.value || "all";
    const selectedFecha = document.getElementById("filter-fecha")?.value || "all";
    
    const filteredExams = [];
    
    cycleExams.forEach(exam => {
        const shift = exam.grupo.substring(0, 1);
        const semester = exam.grupo.substring(1, 2);
        
        const matchesQuery = exam.materia.toLowerCase().includes(query) || 
                             exam.docente_titular.toLowerCase().includes(query) || 
                             exam.docente_apoyo.toLowerCase().includes(query) ||
                             exam.grupo.toLowerCase().includes(query);
                             
        const matchesSemestre = (selectedSemestre === "all" || semester === selectedSemestre);
        const matchesTurno = (selectedTurno === "all" || shift === selectedTurno);
        const matchesGrupo = (selectedGrupo === "all" || exam.grupo === selectedGrupo);
        const matchesFecha = (selectedFecha === "all" || exam.fecha === selectedFecha);
        
        if (matchesQuery && matchesSemestre && matchesTurno && matchesGrupo && matchesFecha) {
            filteredExams.push(exam);
        }
    });
    
    // 1. Render Audit Summary
    if (auditContainer) {
        const filteredWarnings = cycleWarnings.filter(w => {
            if (selectedGrupo !== "all" && !w.message.includes(selectedGrupo)) {
                return false;
            }
            if (selectedSemestre !== "all") {
                const groupsFound = w.message.match(/[MV]\d{3}/g) || [];
                if (groupsFound.length > 0) {
                    const hasMatch = groupsFound.some(g => g.substring(1, 2) === selectedSemestre);
                    if (!hasMatch) return false;
                }
            }
            if (selectedTurno !== "all") {
                const groupsFound = w.message.match(/[MV]\d{3}/g) || [];
                if (groupsFound.length > 0) {
                    const hasMatch = groupsFound.some(g => g.substring(0, 1) === selectedTurno);
                    if (!hasMatch) return false;
                }
            }
            return true;
        });
        
        if (filteredWarnings.length === 0) {
            auditContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, hsla(142, 71%, 45%, 0.15) 0%, rgba(0,0,0,0) 100%); border: 1px solid var(--accent-green); padding: 15px 20px; border-radius: 10px; display: flex; align-items: center; gap: 12px;">
                    <i class="fa-solid fa-circle-check" style="color: var(--accent-green); font-size: 18px;"></i>
                    <div>
                        <h4 style="margin: 0 0 2px 0; color: #fff; font-size: 13px;">Auditoría de Calendario: Correcta</h4>
                        <p style="margin: 0; font-size: 11.5px; color: var(--text-secondary);">No se encontraron cruces de horarios de alumnos, de docentes ni discrepancias con la plantilla en los filtros seleccionados.</p>
                    </div>
                </div>
            `;
        } else {
            const criticalCount = filteredWarnings.filter(w => w.severity === "CRITICAL").length;
            const highCount = filteredWarnings.filter(w => w.severity === "HIGH").length;
            const mediumCount = filteredWarnings.filter(w => w.severity === "MEDIUM").length;
            const lowCount = filteredWarnings.filter(w => w.severity === "LOW").length;
            
            let badgeHtml = "";
            if (criticalCount > 0) badgeHtml += `<span class="badge-tag" style="background-color: hsla(355, 85%, 55%, 0.2); color: var(--accent-red); margin-right: 6px;">${criticalCount} Críticos</span>`;
            if (highCount > 0) badgeHtml += `<span class="badge-tag" style="background-color: hsla(25, 95%, 50%, 0.2); color: var(--accent-gold); margin-right: 6px;">${highCount} Altos</span>`;
            if (mediumCount + lowCount > 0) badgeHtml += `<span class="badge-tag" style="background-color: hsla(190, 95%, 44%, 0.2); color: var(--accent-cyan);">${mediumCount + lowCount} Advertencias</span>`;
            
            let warningListHtml = "";
            const showLimit = 4;
            const extraCount = filteredWarnings.length - showLimit;
            
            filteredWarnings.slice(0, showLimit).forEach(w => {
                let severityColor = "var(--accent-cyan)";
                let iconClass = "fa-circle-info";
                if (w.severity === "CRITICAL") {
                    severityColor = "var(--accent-red)";
                    iconClass = "fa-triangle-exclamation";
                } else if (w.severity === "HIGH") {
                    severityColor = "var(--accent-gold)";
                    iconClass = "fa-circle-exclamation";
                }
                
                warningListHtml += `
                    <div style="display: flex; gap: 8px; font-size: 11.5px; line-height: 1.4; color: var(--text-secondary); margin-bottom: 6px; align-items: flex-start;">
                        <i class="fa-solid ${iconClass}" style="color: ${severityColor}; margin-top: 3px; font-size: 11px; flex-shrink: 0;"></i>
                        <span>${w.message}</span>
                    </div>
                `;
            });
            
            let toggleBtnHtml = "";
            if (extraCount > 0) {
                let hiddenWarningsHtml = "";
                filteredWarnings.slice(showLimit).forEach(w => {
                    let severityColor = "var(--accent-cyan)";
                    let iconClass = "fa-circle-info";
                    if (w.severity === "CRITICAL") {
                        severityColor = "var(--accent-red)";
                        iconClass = "fa-triangle-exclamation";
                    } else if (w.severity === "HIGH") {
                        severityColor = "var(--accent-gold)";
                        iconClass = "fa-circle-exclamation";
                    }
                    hiddenWarningsHtml += `
                        <div style="display: flex; gap: 8px; font-size: 11.5px; line-height: 1.4; color: var(--text-secondary); margin-bottom: 6px; align-items: flex-start;">
                            <i class="fa-solid ${iconClass}" style="color: ${severityColor}; margin-top: 3px; font-size: 11px; flex-shrink: 0;"></i>
                            <span>${w.message}</span>
                        </div>
                    `;
                });
                
                toggleBtnHtml = `
                    <button onclick="document.getElementById('hidden-warnings').style.display = document.getElementById('hidden-warnings').style.display === 'none' ? 'block' : 'none'; this.textContent = this.textContent.includes('Ver todas') ? 'Ocultar advertencias' : 'Ver todas las ${filteredWarnings.length} advertencias';" 
                        style="background: none; border: none; color: var(--accent-cyan); cursor: pointer; font-size: 11px; font-weight: 600; padding: 0; margin-top: 6px; text-decoration: underline; display: block;">
                        Ver todas las ${filteredWarnings.length} advertencias
                    </button>
                    <div id="hidden-warnings" style="display: none; margin-top: 6px; border-top: 1px dashed hsla(217, 30%, 25%, 0.5); padding-top: 8px;">
                        ${hiddenWarningsHtml}
                    </div>
                `;
            }
            
            auditContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, hsla(355, 85%, 55%, 0.1) 0%, rgba(0,0,0,0) 100%); border: 1px solid hsla(355, 85%, 55%, 0.3); padding: 16px 20px; border-radius: 12px; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-red); font-size: 18px;"></i>
                            <h4 style="margin: 0; color: #fff; font-size: 13.5px; font-weight: 700;">Auditoría del Calendario de Exámenes</h4>
                        </div>
                        <div style="display: flex;">${badgeHtml}</div>
                    </div>
                    <div style="border-top: 1px solid hsla(217, 30%, 25%, 0.3); padding-top: 10px; max-height: 250px; overflow-y: auto; padding-right: 6px;">
                        ${warningListHtml}
                        ${toggleBtnHtml}
                    </div>
                </div>
            `;
        }
    }
    
    // 2. Render content based on active sub-view
    const tableView = document.getElementById("exams-table-subview");
    const timelineView = document.getElementById("exams-timeline-subview");
    
    if (activeExamsSubView === 'table') {
        if (tableView) tableView.style.display = "block";
        if (timelineView) timelineView.style.display = "none";
        
        if (filteredExams.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No se encontraron exámenes para los filtros seleccionados.</td></tr>`;
            return;
        }
        
        // Group exams
        const groupedExams = [];
        const groupedMap = {};
        
        filteredExams.forEach(exam => {
            const key = `${exam.fecha}|${exam.horario}|${exam.materia}|${exam.docente_titular}`;
            if (!groupedMap[key]) {
                groupedMap[key] = {
                    fecha: exam.fecha,
                    horario: exam.horario,
                    materia: exam.materia,
                    docente_titular: exam.docente_titular,
                    grupos: [],
                    apoyos: new Set()
                };
                groupedExams.push(groupedMap[key]);
            }
            if (!groupedMap[key].grupos.includes(exam.grupo)) {
                groupedMap[key].grupos.push(exam.grupo);
            }
            if (exam.docente_apoyo) {
                groupedMap[key].apoyos.add(exam.docente_apoyo);
            }
        });
        
        // Sort grouped exams by date, then time
        groupedExams.sort((a, b) => {
            const parseDate = (dStr) => {
                const parts = dStr.split('/');
                return parts.length === 3 ? `20${parts[2]}${parts[1]}${parts[0]}` : dStr;
            };
            const dateCompare = parseDate(a.fecha).localeCompare(parseDate(b.fecha));
            if (dateCompare !== 0) return dateCompare;
            return a.horario.localeCompare(b.horario);
        });

        groupedExams.forEach(item => {
            const tr = document.createElement("tr");
            
            // Render group tags
            const groupTagsHtml = item.grupos.sort().map(g => {
                const color = g.startsWith("M") ? "var(--accent-gold)" : "var(--accent-purple)";
                const bg = g.startsWith("M") ? "hsla(38, 92%, 50%, 0.15)" : "hsla(262, 83%, 58%, 0.15)";
                return `<span class="group-tag" style="background-color: ${bg}; color: ${color}; margin-right: 4px; padding: 2px 6px; font-size: 10px; font-weight: 600; border-radius: 4px;">${g}</span>`;
            }).join('');
            
            const supportText = item.apoyos.size > 0 ? 
                Array.from(item.apoyos).map(a => `<code>${a}</code>`).join(', ') : 
                `<span style="color: var(--text-muted); font-style: italic;">Sin apoyo</span>`;
            
            tr.innerHTML = `
                <td><code>${item.fecha}</code></td>
                <td><strong>${item.horario}</strong></td>
                <td><div style="display: flex; flex-wrap: wrap; gap: 4px;">${groupTagsHtml}</div></td>
                <td>
                    <span style="color: var(--text-primary); font-weight: 600;">${item.materia}</span>
                </td>
                <td><strong>${item.docente_titular}</strong></td>
                <td>${supportText}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        if (tableView) tableView.style.display = "none";
        if (timelineView) timelineView.style.display = "block";
        
        const timelineContainer = document.getElementById("exams-timeline-container");
        if (!timelineContainer) return;
        timelineContainer.innerHTML = "";
        
        if (filteredExams.length === 0) {
            timelineContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px;">No se encontraron exámenes para los filtros seleccionados.</div>`;
            return;
        }
        
        // Group exams for timeline
        const groupedExams = [];
        const groupedMap = {};
        
        filteredExams.forEach(exam => {
            const key = `${exam.fecha}|${exam.horario}|${exam.materia}|${exam.docente_titular}`;
            if (!groupedMap[key]) {
                groupedMap[key] = {
                    fecha: exam.fecha,
                    horario: exam.horario,
                    materia: exam.materia,
                    docente_titular: exam.docente_titular,
                    grupos: [],
                    apoyos: new Set()
                };
                groupedExams.push(groupedMap[key]);
            }
            if (!groupedMap[key].grupos.includes(exam.grupo)) {
                groupedMap[key].grupos.push(exam.grupo);
            }
            if (exam.docente_apoyo) {
                groupedMap[key].apoyos.add(exam.docente_apoyo);
            }
        });
        
        // Sort grouped exams by date, then time
        groupedExams.sort((a, b) => {
            const parseDate = (dStr) => {
                const parts = dStr.split('/');
                return parts.length === 3 ? `20${parts[2]}${parts[1]}${parts[0]}` : dStr;
            };
            const dateCompare = parseDate(a.fecha).localeCompare(parseDate(b.fecha));
            if (dateCompare !== 0) return dateCompare;
            return a.horario.localeCompare(b.horario);
        });
        
        // Group by Date for cards
        const dailyMap = {};
        const dailyList = [];
        
        groupedExams.forEach(item => {
            if (!dailyMap[item.fecha]) {
                dailyMap[item.fecha] = {
                    fecha: item.fecha,
                    exams: []
                };
                dailyList.push(dailyMap[item.fecha]);
            }
            dailyMap[item.fecha].exams.push(item);
        });
        
        dailyList.forEach(day => {
            // Format Date to friendly string (e.g. Viernes 12 de Junio)
            let displayDate = day.fecha;
            const parts = day.fecha.split('/');
            if (parts.length === 3) {
                const d = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1; // 0-indexed
                const y = 2000 + parseInt(parts[2], 10);
                const dObj = new Date(y, m, d);
                const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                
                const nameDay = daysOfWeek[dObj.getDay()];
                const nameMonth = months[m];
                
                displayDate = `${nameDay} ${d} de ${nameMonth}`;
            }
            
            // Group day's exams by time slot
            const slotMap = {};
            const slotList = [];
            
            day.exams.forEach(exam => {
                const slot = exam.horario;
                if (!slotMap[slot]) {
                    slotMap[slot] = {
                        horario: slot,
                        exams: []
                    };
                    slotList.push(slotMap[slot]);
                }
                slotMap[slot].exams.push(exam);
            });
            
            // Sort slots alphabetically (time order)
            slotList.sort((a, b) => a.horario.localeCompare(b.horario));
            
            let slotsHtml = "";
            slotList.forEach(slot => {
                const cleanSlot = slot.horario.replace(/\s+/g, "");
                // Determine if Vespertino
                const isVespertino = cleanSlot.startsWith("14") || cleanSlot.startsWith("16") || cleanSlot.startsWith("18");
                const shiftClass = isVespertino ? "vespertino" : "matutino";
                const slotIcon = isVespertino ? '<i class="fa-solid fa-cloud-moon"></i>' : '<i class="fa-solid fa-cloud-sun"></i>';
                
                let examItemsHtml = "";
                slot.exams.forEach(e => {
                    const groupTagsHtml = e.grupos.sort().map(g => {
                        const color = g.startsWith("M") ? "var(--accent-gold)" : "var(--accent-purple)";
                        const bg = g.startsWith("M") ? "hsla(38, 92%, 50%, 0.15)" : "hsla(262, 83%, 58%, 0.15)";
                        return `<span class="group-tag" style="background-color: ${bg}; color: ${color}; padding: 2px 6px; font-size: 10px; font-weight: 600; border-radius: 4px;">${g}</span>`;
                    }).join('');
                    
                    const supportText = e.apoyos.size > 0 ? 
                        `<div><i class="fa-solid fa-user-plus"></i> Apoyo: <strong>${Array.from(e.apoyos).join(', ')}</strong></div>` : 
                        "";
                        
                    examItemsHtml += `
                        <div class="exam-slot-item">
                            <div class="exam-item-subject">${e.materia}</div>
                            <div class="exam-item-groups">${groupTagsHtml}</div>
                            <div class="exam-item-teachers">
                                <div><i class="fa-solid fa-user-tie"></i> Titular: <strong>${e.docente_titular}</strong></div>
                                ${supportText}
                            </div>
                        </div>
                    `;
                });
                
                slotsHtml += `
                    <div class="exam-slot-box ${shiftClass}">
                        <div class="exam-slot-time ${shiftClass}">
                            ${slotIcon} <span>${slot.horario}</span>
                        </div>
                        ${examItemsHtml}
                    </div>
                `;
            });
            
            const card = document.createElement("div");
            card.className = "exam-day-card";
            card.innerHTML = `
                <div class="exam-day-header">
                    <span class="exam-day-title"><i class="fa-solid fa-calendar-day"></i> ${displayDate}</span>
                    <span class="exam-day-count">${day.exams.length} UACs</span>
                </div>
                <div class="exam-day-body">
                    ${slotsHtml}
                </div>
            `;
            timelineContainer.appendChild(card);
        });
    }
}

