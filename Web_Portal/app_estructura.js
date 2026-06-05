/**
 * MÓDULO DE CONSULTA: ESTRUCTURA EDUCATIVA (GEN_ESTRUCTURA)
 * Portal Web de Gestión Escolar - CEB
 */

const GEN_API_URL = 'https://script.google.com/macros/s/AKfycbxkSJkIqZsa1zlZDPSBET-ACLfDYrE3hwbm2KqszFiUe-qHUTRMGfMlh_I4LKKMyGc/exec';
const CACHE_KEY_EST = 'ceb_estructura_cache';
const CACHE_TIME_EST = 15 * 60 * 1000; // 15 minutos

// Variables globales para la vista
window.EstructuraData = [];
window.EstructuraActiveView = 'list';

// Función para alternar la vista (Lista vs Bloques)
function switchEstView(view) {
    window.EstructuraActiveView = view;
    
    const btnList = document.getElementById("btn-est-view-list");
    const btnBlocks = document.getElementById("btn-est-view-blocks");
    const viewList = document.getElementById("est-list-view");
    const viewBlocks = document.getElementById("est-blocks-view");
    
    if (btnList && btnBlocks && viewList && viewBlocks) {
        if (view === 'list') {
            btnList.classList.add("active");
            btnBlocks.classList.remove("active");
            viewList.style.display = "block";
            viewList.classList.add("active");
            viewBlocks.style.display = "none";
            viewBlocks.classList.remove("active");
        } else {
            btnList.classList.remove("active");
            btnBlocks.classList.add("active");
            viewList.style.display = "none";
            viewList.classList.remove("active");
            viewBlocks.style.display = "block";
            viewBlocks.classList.add("active");
        }
    }
    filterEstructura();
}

// Inicialización de la vista
document.addEventListener("DOMContentLoaded", () => {
    // Escuchar el evento de carga del tab Dirección para inicializar la descarga
    const navBtn = document.getElementById("nav-direccion");
    if (navBtn) {
        navBtn.addEventListener("click", () => {
            // Cargar datos si aún no están cargados
            if (!window.EstructuraData || window.EstructuraData.length === 0) {
                loadEstructuraData();
            }
        });
    }
});

// Función para alternar las subpestañas de Dirección
function switchSubAreaDireccion(subAreaId) {
    const pageDir = document.getElementById("page-direccion");
    if (!pageDir) return;

    // Desactivar todos los botones de subpestañas
    const buttons = pageDir.querySelectorAll(".sub-tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));

    // Ocultar todos los paneles de sub-área
    const panels = pageDir.querySelectorAll(".sub-area-content");
    panels.forEach(p => p.classList.remove("active"));

    // Activar el botón correspondiente buscando por su atributo onclick
    const btn = Array.from(buttons).find(b => {
        const onclickAttr = b.getAttribute("onclick") || '';
        return onclickAttr.includes(subAreaId);
    });
    if (btn) btn.classList.add("active");

    // Mostrar el panel correspondiente
    const panel = document.getElementById(`sub-dir-${subAreaId}`);
    if (panel) panel.classList.add("active");

    // Si entramos a estructura educativa, asegurar que cargamos los datos
    if (subAreaId === 'estructura-educativa' && (!window.EstructuraData || window.EstructuraData.length === 0)) {
        loadEstructuraData();
    }
}

// Cargar datos de la estructura educativa (con caché local protegida contra bloqueos de protocolo file://)
async function loadEstructuraData(forceRefresh = false) {
    const tableBody = document.getElementById("est-table-body");
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px; color: var(--accent-cyan);"></i><br>
                    Cargando estructura educativa de Google Sheets...
                </td>
            </tr>
        `;
    }

    try {
        let cached = null;
        let cachedTime = null;
        let now = Date.now();

        // Control de excepciones para sessionStorage (bloqueado bajo file:// en ciertos navegadores)
        try {
            cached = sessionStorage.getItem(CACHE_KEY_EST);
            cachedTime = sessionStorage.getItem(CACHE_KEY_EST + '_time');
        } catch (e) {
            console.warn("sessionStorage no está disponible:", e);
        }

        if (!forceRefresh && cached && cachedTime && (now - parseInt(cachedTime) < CACHE_TIME_EST)) {
            console.log("Cargando Estructura Educativa desde la caché de la sesión.");
            window.EstructuraData = JSON.parse(cached);
            populateFiltersAndRender();
            return;
        }

        console.log("Consultando estructura educativa al servidor...");
        const response = await fetch(`${GEN_API_URL}?action=getEstructura`);
        const result = await response.json();

        if (result.status !== 'ok') {
            throw new Error(result.message || 'Error desconocido del servidor');
        }

        window.EstructuraData = result.data || [];
        
        // Guardar en caché de forma segura
        try {
            sessionStorage.setItem(CACHE_KEY_EST, JSON.stringify(window.EstructuraData));
            sessionStorage.setItem(CACHE_KEY_EST + '_time', now.toString());
        } catch (e) {
            console.warn("No se pudo escribir en sessionStorage:", e);
        }

        populateFiltersAndRender();

    } catch (error) {
        console.error("Error al cargar la estructura educativa:", error);
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 30px; color: var(--danger-color);">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 30px; margin-bottom: 10px;"></i><br>
                        <strong>Error al conectar con la base de datos:</strong><br>
                        ${error.message}<br>
                        <button class="action-button-link btn-cyan mt-15" onclick="loadEstructuraData(true)">
                            <i class="fa-solid fa-rotate"></i> Reintentar Carga
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

// Actualizar manualmente los datos
function refreshEstructuraData() {
    loadEstructuraData(true);
}

// Popular filtros y renderizar
function populateFiltersAndRender() {
    // 1. Popular filtro de grupos de forma dinámica
    const grupoSelect = document.getElementById("filter-est-grupo");
    if (grupoSelect && window.EstructuraData && window.EstructuraData.length > 0) {
        // Obtener grupos únicos
        const grupos = [...new Set(window.EstructuraData.map(r => r.grupo).filter(Boolean))].sort();
        
        // Mantener la opción "Todos" y rellenar los demás
        grupoSelect.innerHTML = '<option value="all">Todos</option>';
        grupos.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g;
            opt.textContent = g;
            grupoSelect.appendChild(opt);
        });
    }

    // 2. Renderizar tabla con filtros aplicados
    filterEstructura();
}

// Filtrar y renderizar registros de estructura
function filterEstructura() {
    const tableBody = document.getElementById("est-table-body");
    if (!tableBody) return;

    // Si los datos aún no están cargados
    if (!window.EstructuraData || window.EstructuraData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    <i class="fa-regular fa-folder-open" style="font-size: 28px; margin-bottom: 10px;"></i><br>
                    No hay datos disponibles en este momento.
                </td>
            </tr>
        `;
        return;
    }

    // Obtener valores de filtros con salvaguardas contra elementos nulos
    const searchEl = document.getElementById("est-search");
    const searchText = searchEl ? (searchEl.value || '').trim().toLowerCase() : '';
    
    const cicloEl = document.getElementById("filter-est-ciclo");
    const cicloVal = cicloEl ? cicloEl.value : 'all';
    
    const periodoEl = document.getElementById("filter-est-periodo");
    const periodoVal = periodoEl ? periodoEl.value : 'all';
    
    const semestreEl = document.getElementById("filter-est-semestre");
    const semestreVal = semestreEl ? semestreEl.value : 'all';
    
    const grupoEl = document.getElementById("filter-est-grupo");
    const grupoVal = grupoEl ? grupoEl.value : 'all';
    
    const coberturaEl = document.getElementById("filter-est-cobertura");
    const coberturaVal = coberturaEl ? coberturaEl.value : 'all';

    // Filtrar registros
    const filtered = window.EstructuraData.filter(r => {
        // Filtro por ciclo
        if (cicloVal !== 'all' && String(r.ciclo) !== cicloVal) return false;
        
        // Filtro por periodo
        if (periodoVal !== 'all' && String(r.periodo || '').trim().toUpperCase() !== periodoVal) return false;
        
        // Filtro por semestre
        if (semestreVal !== 'all' && String(r.semestre || '').trim() !== semestreVal) return false;
        
        // Filtro por grupo
        if (grupoVal !== 'all' && String(r.grupo || '').trim() !== grupoVal) return false;

        // Filtro por cobertura (Docentes asignados vs Vacantes)
        const docente = (r.docente || '').trim();
        const esVacante = !docente || docente.toUpperCase() === 'SIN ASIGNAR' || docente.toUpperCase() === 'VACANTE' || docente.toUpperCase() === 'N/A';
        if (coberturaVal === 'vacantes' && !esVacante) return false;
        if (coberturaVal === 'asignados' && esVacante) return false;

        // Filtro por búsqueda de texto
        if (searchText) {
            const uac = (r.uac || '').toLowerCase();
            const doc = (r.docente || '').toLowerCase();
            const campo = (r.campo_disciplinar || '').toLowerCase();
            const gpo = (r.grupo || '').toLowerCase();
            if (!uac.includes(searchText) && !doc.includes(searchText) && !campo.includes(searchText) && !gpo.includes(searchText)) {
                return false;
            }
        }

        return true;
    });

    // Calcular estadísticas
    let totalHoras = 0;
    const docentesUnicos = new Set();
    let vacantesCount = 0;

    filtered.forEach(r => {
        // Sumar horas semanales
        const hrs = parseFloat(r.tot_horas || r.horas || 0);
        if (!isNaN(hrs)) totalHoras += hrs;

        // Validar docente
        const doc = (r.docente || '').trim();
        const esVacante = !doc || doc.toUpperCase() === 'SIN ASIGNAR' || doc.toUpperCase() === 'VACANTE' || doc.toUpperCase() === 'N/A';
        if (esVacante) {
            vacantesCount++;
        } else {
            docentesUnicos.add(doc);
        }
    });

    // Renderizar estadísticas con protección nula
    const statMaterias = document.getElementById("est-stat-materias");
    const statHoras = document.getElementById("est-stat-horas");
    const statDocentes = document.getElementById("est-stat-docentes");
    const statVacantes = document.getElementById("est-stat-vacantes");

    if (statMaterias) statMaterias.textContent = filtered.length;
    if (statHoras) statHoras.textContent = `${totalHoras}h`;
    if (statDocentes) statDocentes.textContent = docentesUnicos.size;
    if (statVacantes) statVacantes.textContent = vacantesCount;

    // Si la vista activa es bloques, redirigir
    if (window.EstructuraActiveView === 'blocks') {
        tableBody.innerHTML = '';
        renderEstructuraBlocks(filtered);
        return;
    }

    // Si no hay datos filtrados
    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    <i class="fa-regular fa-folder-open" style="font-size: 28px; margin-bottom: 10px;"></i><br>
                    No se encontraron materias que coincidan con los filtros aplicados.
                </td>
            </tr>
        `;
        return;
    }

    // Renderizar registros en la tabla
    tableBody.innerHTML = filtered.map(r => {
        // Docente
        const docName = (r.docente || '').trim();
        const esVacante = !docName || docName.toUpperCase() === 'SIN ASIGNAR' || docName.toUpperCase() === 'VACANTE' || docName.toUpperCase() === 'N/A';
        
        let docenteHTML = '';
        if (esVacante) {
            docenteHTML = `<span class="badge-red" style="padding: 5px 10px; border-radius: 4px; display: inline-flex; align-items: center; gap: 5px; font-weight: 500; font-size: 11px;">
                             <i class="fa-solid fa-triangle-exclamation"></i> Vacante / Sin Asignar
                           </span>`;
        } else {
            docenteHTML = `<div style="display: flex; align-items: center; gap: 8px;">
                             <i class="fa-regular fa-user" style="color: var(--accent-cyan); font-size: 12px;"></i>
                             <span style="font-weight: 500;">${docName}</span>
                           </div>`;
        }

        // Distribución Horaria
        const dias = [
            { key: 'lunes', label: 'L' },
            { key: 'martes', label: 'M' },
            { key: 'miercoles', label: 'M' },
            { key: 'jueves', label: 'J' },
            { key: 'viernes', label: 'V' }
        ];

        let weeklyHTML = '<div style="display: flex; gap: 6px; flex-wrap: wrap;">';
        let tieneHorario = false;
        
        dias.forEach(d => {
            const val = (r[d.key] || '').trim();
            if (val && val !== '0') {
                tieneHorario = true;
                // Formato premium para el día activo
                weeklyHTML += `<span class="badge-cyan" style="font-size: 11px; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 500; background: rgba(0, 242, 254, 0.15); border: 1px solid rgba(0, 242, 254, 0.3); color: #00f2fe;" title="${val}">
                                 <strong>${d.label}:</strong> ${val}
                               </span>`;
            }
        });
        
        if (!tieneHorario) {
            weeklyHTML += `<span style="color: var(--text-muted); font-size: 12px; font-style: italic;">Sin distribución horaria</span>`;
        }
        weeklyHTML += '</div>';

        // Fila
        return `
            <tr>
                <td style="font-weight: 600; font-family: var(--font-mono); vertical-align: middle;">
                    <span style="color: var(--accent-purple);">${r.semestre}°</span> <span style="color: #fff;">${r.grupo}</span>
                </td>
                <td style="vertical-align: middle;">
                    <div style="font-weight: 600; color: #fff; margin-bottom: 3px; font-size: 14px;">${r.uac}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">${r.campo_disciplinar || 'Sin área disciplinar'}</div>
                </td>
                <td style="vertical-align: middle;">
                    ${docenteHTML}
                </td>
                <td style="text-align: center; font-weight: 600; font-family: var(--font-mono); color: var(--accent-gold); vertical-align: middle; font-size: 14px;">
                    ${r.tot_horas || r.horas || 0}h
                </td>
                <td style="vertical-align: middle;">
                    ${weeklyHTML}
                </td>
            </tr>
        `;
    }).join('');
}

// Parsear rangos horarios como "07:00-09:00 / 10:00-11:00" en sesiones individuales
function parseEstructuraSessions(row) {
    const sessions = [];
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const timeRegex = /(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/g;
    
    days.forEach(day => {
        const val = (row[day] || '').trim();
        if (!val || val === '0') return;
        
        // Separar por '/' si hay múltiples bloques en el mismo día
        const parts = val.split('/');
        parts.forEach(part => {
            // Reiniciar el índice del regex
            timeRegex.lastIndex = 0;
            const match = timeRegex.exec(part);
            if (match) {
                const inicio = match[1];
                const fin = match[2];
                
                // Calcular duración en horas
                const [hIni, mIni] = inicio.split(':').map(Number);
                const [hFin, mFin] = fin.split(':').map(Number);
                const durHrs = ((hFin * 60 + mFin) - (hIni * 60 + mIni)) / 60;
                
                sessions.push({
                    grupo: row.grupo,
                    semestre: row.semestre,
                    materia: row.uac,
                    docente: row.docente,
                    campo_disciplinar: row.campo_disciplinar || '',
                    dia: day.toUpperCase(),
                    hora_inicio: inicio,
                    hora_fin: fin,
                    horas_bloque: durHrs
                });
            }
        });
    });
    return sessions;
}

// Función auxiliar para escapar caracteres HTML
function estEsc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Renderiza la vista en bloques agrupando por grupo
function renderEstructuraBlocks(filteredRows) {
    const container = document.getElementById("est-blocks-grid-container");
    if (!container) return;
    
    if (!filteredRows || filteredRows.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-regular fa-folder-open" style="font-size: 28px; margin-bottom: 10px;"></i><br>
                No hay datos que coincidan con los filtros aplicados para la vista en bloques.
            </div>
        `;
        return;
    }
    
    // Agrupar sesiones por grupo
    const groupsMap = {};
    const groupsWithoutSchedule = [];
    
    filteredRows.forEach(row => {
        const sessions = parseEstructuraSessions(row);
        if (sessions.length > 0) {
            if (!groupsMap[row.grupo]) {
                groupsMap[row.grupo] = [];
            }
            groupsMap[row.grupo] = groupsMap[row.grupo].concat(sessions);
        } else {
            // Registrar grupos con materias pero sin horas distribuidas
            if (!groupsWithoutSchedule.includes(row.grupo) && row.grupo) {
                groupsWithoutSchedule.push(row.grupo);
            }
        }
    });
    
    const sortedGroups = Object.keys(groupsMap).sort();
    let html = '';
    
    // Renderizar grilla semanal para cada grupo que tenga sesiones
    sortedGroups.forEach(gName => {
        html += `<div class="est-group-block-wrapper" style="margin-bottom: 35px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
                    <h3 style="color: #fff; margin-top: 0; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-size: 16px;">
                        <i class="fa-solid fa-graduation-cap" style="color: var(--accent-purple);"></i>
                        Horario de Grupo: <span style="color: var(--accent-cyan); font-weight: 700;">${estEsc(gName)}</span>
                    </h3>
                    ${buildWeeklyGridHTML(groupsMap[gName])}
                </div>`;
    });
    
    // Mostrar avisos para grupos activos sin distribución semanal
    const missingSchedules = groupsWithoutSchedule.filter(g => !groupsMap[g]).sort();
    if (missingSchedules.length > 0) {
        html += `<div style="margin-top: 20px; padding: 15px; border-radius: 8px; border: 1px dashed rgba(234, 179, 8, 0.3); background: rgba(234, 179, 8, 0.05); color: var(--accent-gold);">
                    <i class="fa-solid fa-triangle-exclamation"></i> <strong>Grupos sin distribución semanal asignada:</strong> ${missingSchedules.map(estEsc).join(', ')}.
                    <div style="font-size: 12px; margin-top: 5px; color: var(--text-muted);">Estos grupos tienen materias registradas pero no tienen cargadas horas en los días de la semana en la Estructura Educativa.</div>
                </div>`;
    }
    
    container.innerHTML = html;
}

// Genera el HTML de la grilla semanal (tabla con rowspans) para un grupo
function buildWeeklyGridHTML(sessions) {
    if (!sessions || sessions.length === 0) return '';
    
    const dayOrder = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
    const dayLabels = { LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves', VIERNES: 'Viernes' };
    
    // Obtener horas únicas de inicio ordenadas
    const times = Array.from(new Set(
        sessions.map(s => s.hora_inicio).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));
    
    if (!times.length) {
        return '<p style="color: var(--text-muted); font-style: italic;">Sin horarios definidos.</p>';
    }
    
    // Lookup de sesiones: dia -> hora_inicio -> sesión
    const lookup = {};
    sessions.forEach(s => {
        if (!lookup[s.dia]) lookup[s.dia] = {};
        if (!lookup[s.dia][s.hora_inicio]) lookup[s.dia][s.hora_inicio] = s;
    });
    
    const occ = {}; // Rastreador de ocupación por rowspan
    
    let html = `
        <div class="sched-scroll">
            <table class="sched-table">
                <thead>
                    <tr>
                        <th class="sched-th-time">Hora</th>
                        ${dayOrder.map(d => `<th class="sched-th-day">${dayLabels[d]}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    times.forEach((time, timeIdx) => {
        html += `<tr>`;
        html += `<td class="sched-td-time">${estEsc(time)}</td>`;
        
        dayOrder.forEach(day => {
            const occKey = `${day}_${timeIdx}`;
            if (occ[occKey]) return; // Celda ocupada por un rowspan de una fila anterior
            
            const s = lookup[day] && lookup[day][time];
            if (s) {
                // Calcular rowspan
                let span = 1;
                for (let k = timeIdx + 1; k < times.length; k++) {
                    if (times[k] < s.hora_fin) {
                        span++;
                    } else {
                        break;
                    }
                }
                
                // Marcar espacios ocupados en las siguientes filas
                for (let j = 1; j < span; j++) {
                    occ[`${day}_${timeIdx + j}`] = true;
                }
                
                const c = estColor(s.materia);
                const hrsNum = parseFloat(s.horas_bloque) || 0;
                const hrsStr = (hrsNum % 1 === 0 ? String(Math.round(hrsNum)) : String(hrsNum)) + 'h';
                
                const isVacante = !s.docente || s.docente.toUpperCase() === 'SIN ASIGNAR' || s.docente.toUpperCase() === 'VACANTE' || s.docente.toUpperCase() === 'N/A';
                
                let docenteHTML = '';
                if (isVacante) {
                    docenteHTML = `<span class="badge-red" style="padding: 3px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; font-size: 10px;">
                                     <i class="fa-solid fa-triangle-exclamation"></i> VACANTE
                                   </span>`;
                } else {
                    docenteHTML = estEsc(s.docente);
                }
                
                const tooltip = `${estEsc(s.materia)} · ${estEsc(s.docente || 'VACANTE')} · ${estEsc(s.hora_inicio)}–${estEsc(s.hora_fin)} (${hrsStr})`;
                
                html += `
                    <td rowspan="${span}" class="sched-td-session" title="${tooltip}"
                        style="background: ${c.bg}; border-left: 4px solid ${c.border}; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div class="sched-label" style="color: ${c.text}; font-weight: 600;">${estEsc(s.materia)}</div>
                        <div class="sched-sub">${docenteHTML}</div>
                        <div class="sched-time-tag">
                            <i class="fa-regular fa-clock"></i> ${estEsc(s.hora_inicio)}–${estEsc(s.hora_fin)}
                            <span class="sched-hrs-badge">${hrsStr}</span>
                        </div>
                    </td>
                `;
            } else {
                html += `<td class="sched-td-empty"></td>`;
            }
        });
        
        html += `</tr>`;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Paleta de colores para las materias en bloques (Dirección)
const _EST_PALETTE = [
    { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#60a5fa' }, // azul
    { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#4ade80' },  // verde
    { bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', text: '#facc15' },  // amarillo
    { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: '#c084fc' }, // morado
    { bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', text: '#ff9d5c' }, // naranja
    { bg: 'rgba(13, 148, 136, 0.15)', border: '#0d9488', text: '#2dd4bf' }, // cian
    { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#f87171' },  // rojo
    { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', text: '#f472b6' }, // rosa
    { bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4', text: '#22d3ee' },  // cian claro
    { bg: 'rgba(244, 63, 94, 0.15)', border: '#f43f5e', text: '#fb7185' },  // rosa fuerte
    { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#34d399' }, // verde menta
    { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', text: '#818cf8' }  // índigo
];

const _estColorMap = {};
let _estColorCtr = 0;

function estColor(label) {
    if (!label) return _EST_PALETTE[0];
    if (_estColorMap[label] === undefined) {
        _estColorMap[label] = _estColorCtr++ % _EST_PALETTE.length;
    }
    return _EST_PALETTE[_estColorMap[label]];
}



