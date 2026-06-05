/**
 * MÓDULO DE CONSULTA: ESTRUCTURA EDUCATIVA (GEN_ESTRUCTURA)
 * Portal Web de Gestión Escolar - CEB
 */

const GEN_API_URL = 'https://script.google.com/macros/s/AKfycbxkSJkIqZsa1zlZDPSBET-ACLfDYrE3hwbm2KqszFiUe-qHUTRMGfMlh_I4LKKMyGc/exec';
const CACHE_KEY_EST = 'ceb_estructura_cache';
const CACHE_TIME_EST = 15 * 60 * 1000; // 15 minutos

// Variables globales para la vista
window.EstructuraData = [];

// Inicialización de la vista
document.addEventListener("DOMContentLoaded", () => {
    // Escuchar el evento de carga del tab Dirección para inicializar la descarga
    const navBtn = document.getElementById("nav-direccion");
    if (navBtn) {
        navBtn.addEventListener("click", () => {
            // Cargar datos si aún no están cargados
            if (window.EstructuraData.length === 0) {
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

    // Activar el botón correspondiente
    const btn = Array.from(buttons).find(b => b.getAttribute("onclick") && b.getAttribute("onclick").includes(subAreaId));
    if (btn) btn.classList.add("active");

    // Mostrar el panel correspondiente
    const panel = document.getElementById(`sub-dir-${subAreaId}`);
    if (panel) panel.classList.add("active");

    // Si entramos a estructura educativa, asegurar que cargamos los datos
    if (subAreaId === 'estructura-educativa' && window.EstructuraData.length === 0) {
        loadEstructuraData();
    }
}

// Cargar datos de la estructura educativa (con caché local)
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
        let cached = sessionStorage.getItem(CACHE_KEY_EST);
        let cachedTime = sessionStorage.getItem(CACHE_KEY_EST + '_time');
        let now = Date.now();

        if (!forceRefresh && cached && cachedTime && (now - cachedTime < CACHE_TIME_EST)) {
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
        
        // Guardar en caché
        sessionStorage.setItem(CACHE_KEY_EST, JSON.stringify(window.EstructuraData));
        sessionStorage.setItem(CACHE_KEY_EST + '_time', now.toString());

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
    if (grupoSelect) {
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
    if (!tableBody || window.EstructuraData.length === 0) return;

    // Obtener valores de filtros
    const searchText = (document.getElementById("est-search").value || '').trim().toLowerCase();
    const cicloVal = document.getElementById("filter-est-ciclo").value;
    const periodoVal = document.getElementById("filter-est-periodo").value;
    const semestreVal = document.getElementById("filter-est-semestre").value;
    const grupoVal = document.getElementById("filter-est-grupo").value;
    const coberturaVal = document.getElementById("filter-est-cobertura").value;

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

    // Renderizar estadísticas
    document.getElementById("est-stat-materias").textContent = filtered.length;
    document.getElementById("est-stat-horas").textContent = `${totalHoras}h`;
    document.getElementById("est-stat-docentes").textContent = docentesUnicos.size;
    document.getElementById("est-stat-vacantes").textContent = vacantesCount;

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
