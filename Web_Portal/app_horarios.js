// ============================================================
// app_horarios.js — Lógica de Visualización del Visor de Horarios
// ============================================================

// ── PALETA DE COLORES POR MATERIA/GRUPO ──────────────────────
const _HOR_PALETTE = [
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
  { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', text: '#818cf8' }, // índigo
];

const _horColorMap = {};
let _horColorCtr = 0;

function horColor(label) {
  if (!label) return _HOR_PALETTE[0];
  if (_horColorMap[label] === undefined)
    _horColorMap[label] = _horColorCtr++ % _HOR_PALETTE.length;
  return _HOR_PALETTE[_horColorMap[label]];
}

// ── ORDEN DE DÍAS ────────────────────────────────────────────
const HOR_DIAS_ORDER = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
const HOR_DIAS_LABEL = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes'
};
const HOR_DIAS_SHORT = {
  LUNES: 'Lun', MARTES: 'Mar', MIERCOLES: 'Mié',
  JUEVES: 'Jue', VIERNES: 'Vie'
};

// ── ESTADO ───────────────────────────────────────────────────
let _horData = [];   // HORARIOS_WEB completo
let _horActiveTab = 'grupo';

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
  const container = document.getElementById('hor-container');
  if (!container) return; // solo inicializar si existe el contenedor de horarios

  // Configurar pestañas
  document.querySelectorAll('.hor-tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { horSwitchTab(btn.dataset.tab); });
  });

  // Botón regenerar
  const btnRegen = document.getElementById('btn-regenerar');
  if (btnRegen) btnRegen.addEventListener('click', horHandleRegen);

  // Selects de grupo
  const selCicloGrupo = document.getElementById('sel-ciclo-grupo');
  const selGrupo = document.getElementById('sel-grupo');
  if (selCicloGrupo) selCicloGrupo.addEventListener('change', function() {
    horPopulateGrupos();
    horRenderGrupoView();
  });
  if (selGrupo) selGrupo.addEventListener('change', horRenderGrupoView);

  // Selects de docente
  const selCicloDoc = document.getElementById('sel-ciclo-doc');
  const selDocente = document.getElementById('sel-docente');
  if (selCicloDoc) selCicloDoc.addEventListener('change', function() {
    horPopulateDocentes();
    horRenderDocenteView();
  });
  if (selDocente) selDocente.addEventListener('change', horRenderDocenteView);

  // Filtros generales
  const searchGen = document.getElementById('search-gen');
  const filterDia = document.getElementById('filter-dia-gen');
  if (searchGen) searchGen.addEventListener('input', horRenderGeneralView);
  if (filterDia) filterDia.addEventListener('change', horRenderGeneralView);

  // Cargar datos
  horShowLoading(true);
  try {
    _horData = await horariosAPI.getHorariosWeb();
    horShowLoading(false);
    horInitApp();
  } catch (err) {
    horShowLoading(false);
    horShowError(err.message);
  }
});

function horInitApp() {
  const mainEl = document.getElementById('hor-main');
  if (mainEl) mainEl.style.display = '';
  
  horPopulateCiclos('sel-ciclo-grupo');
  horPopulateCiclos('sel-ciclo-doc');
  horPopulateGrupos();
  horPopulateDocentes();
  horRenderGrupoView();
}

// ── POBLAR SELECTS ────────────────────────────────────────────
function horGetCiclos() {
  return Array.from(new Set(_horData.map(function(r) { return r.ciclo; }).filter(Boolean)))
    .sort().reverse();
}

function horPopulateCiclos(selId) {
  const sel = document.getElementById(selId);
  if (!sel) return;
  const ciclos = horGetCiclos();
  sel.innerHTML = ciclos.length
    ? ciclos.map(function(c) { return '<option value="' + horEsc(c) + '">' + horEsc(c) + '</option>'; }).join('')
    : '<option value="">Sin datos</option>';
}

function horPopulateGrupos() {
  const ciclo = (document.getElementById('sel-ciclo-grupo') || {}).value || '';
  const sel = document.getElementById('sel-grupo');
  if (!sel) return;
  const grupos = Array.from(new Set(
    _horData.filter(function(r) { return !ciclo || r.ciclo === ciclo; })
            .map(function(r) { return r.grupo; }).filter(Boolean)
  )).sort();
  sel.innerHTML = grupos.length
    ? grupos.map(function(g) { return '<option value="' + horEsc(g) + '">' + horEsc(g) + '</option>'; }).join('')
    : '<option value="">Sin grupos</option>';
}

function horPopulateDocentes() {
  const ciclo = (document.getElementById('sel-ciclo-doc') || {}).value || '';
  const sel = document.getElementById('sel-docente');
  if (!sel) return;
  const docentes = Array.from(new Set(
    _horData.filter(function(r) { return !ciclo || r.ciclo === ciclo; })
            .map(function(r) { return r.docente; }).filter(Boolean)
  )).sort();
  sel.innerHTML = docentes.length
    ? docentes.map(function(d) { return '<option value="' + horEsc(d) + '">' + horEsc(d) + '</option>'; }).join('')
    : '<option value="">Sin docentes</option>';
}

// ── TABS ─────────────────────────────────────────────────────
function horSwitchTab(tab) {
  _horActiveTab = tab;
  document.querySelectorAll('.hor-tab-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.querySelectorAll('.hor-tab-pane').forEach(function(p) {
    p.classList.toggle('active', p.id === 'pane-' + tab);
  });
  if (tab === 'grupo')   horRenderGrupoView();
  if (tab === 'docente') horRenderDocenteView();
  if (tab === 'general') horRenderGeneralView();
}

// ── VISTA: POR GRUPO ─────────────────────────────────────────
function horRenderGrupoView() {
  const ciclo = (document.getElementById('sel-ciclo-grupo') || {}).value || '';
  const grupo = (document.getElementById('sel-grupo') || {}).value || '';
  const out = document.getElementById('view-grupo');
  if (!out) return;

  if (!grupo) {
    out.innerHTML = '<p class="hor-hint">Selecciona un ciclo y grupo para ver el horario.</p>';
    return;
  }

  const sessions = _horData.filter(function(r) {
    return (!ciclo || r.ciclo === ciclo) && r.grupo === grupo;
  });

  if (!sessions.length) {
    out.innerHTML = '<p class="hor-hint">No hay sesiones registradas para este grupo. Verifica la base de datos.</p>';
    return;
  }

  const materias = Array.from(new Set(sessions.map(function(r) { return r.materia; }).filter(Boolean))).sort();
  const docentes = Array.from(new Set(sessions.map(function(r) { return r.docente; }).filter(Boolean))).sort();
  const totalHrs = sessions.reduce(function(a, r) { return a + (parseFloat(r.horas_bloque) || 0); }, 0);
  const turno = sessions[0] ? (sessions[0].turno || '') : '';

  out.innerHTML =
    '<div class="hor-summary-bar">' +
      horSumChip(grupo, 'Grupo') +
      (turno ? horSumChip(turno, 'Turno') : '') +
      horSumChip(String(materias.length), 'Materias') +
      horSumChip(String(docentes.length), 'Docentes') +
      horSumChip(String(Math.round(totalHrs * 10) / 10), 'Hrs/sem') +
      '<button class="hor-print-btn" onclick="horImprimirGrupo()">' +
        '<i class="fa-solid fa-print"></i>' +
        ' Imprimir / PDF' +
      '</button>' +
    '</div>' +
    '<h3 class="hor-section-title"><i class="fa-regular fa-calendar-days"></i> Horario Semanal</h3>' +
    horRenderGrid(sessions, 'grupo') +
    '<h3 class="hor-section-title" style="margin-top:2rem;"><i class="fa-solid fa-book-bookmark"></i> Materias del Grupo</h3>' +
    horRenderMateriasList(sessions);
}

// ── VISTA: POR DOCENTE ────────────────────────────────────────
function horRenderDocenteView() {
  const ciclo = (document.getElementById('sel-ciclo-doc') || {}).value || '';
  const docente = (document.getElementById('sel-docente') || {}).value || '';
  const out = document.getElementById('view-docente');
  if (!out) return;

  if (!docente) {
    out.innerHTML = '<p class="hor-hint">Selecciona un ciclo y docente para ver el horario.</p>';
    return;
  }

  const sessions = _horData.filter(function(r) {
    return (!ciclo || r.ciclo === ciclo) && r.docente === docente;
  });

  if (!sessions.length) {
    out.innerHTML = '<p class="hor-hint">No hay sesiones registradas para este docente.</p>';
    return;
  }

  const grupos = Array.from(new Set(
    sessions.filter(function(r) { return r.componente !== 'EXTRAESCOLAR'; })
            .map(function(r) { return r.grupo; }).filter(Boolean)
  )).sort();
  const materias = Array.from(new Set(sessions.map(function(r) { return r.materia; }).filter(Boolean))).sort();
  const totalHrs = sessions.reduce(function(a, r) { return a + (parseFloat(r.horas_bloque) || 0); }, 0);
  const extSessions = sessions.filter(function(r) { return r.componente === 'EXTRAESCOLAR'; });
  const formacion = sessions[0] ? (sessions[0].formacion_academica || '') : '';

  out.innerHTML =
    '<div class="hor-docente-header">' +
      '<div class="hor-docente-avatar">' + horInitials(docente) + '</div>' +
      '<div>' +
        '<div class="hor-docente-name">' + horEsc(docente) + '</div>' +
        (formacion ? '<div class="hor-docente-form">' + horEsc(formacion) + '</div>' : '') +
      '</div>' +
    '</div>' +
    '<div class="hor-summary-bar">' +
      horSumChip(String(grupos.length), 'Grupos') +
      horSumChip(String(materias.length), 'Materias') +
      horSumChip(String(Math.round(totalHrs * 10) / 10), 'Hrs/sem') +
      (extSessions.length ? horSumChip(String(extSessions.length), 'Extraesc.') : '') +
      '<button class="hor-print-btn" onclick="horImprimirDocente()">' +
        '<i class="fa-solid fa-print"></i>' +
        ' Imprimir / PDF' +
      '</button>' +
    '</div>' +
    '<h3 class="hor-section-title"><i class="fa-regular fa-calendar-days"></i> Horario Semanal</h3>' +
    horRenderGrid(sessions, 'docente') +
    '<h3 class="hor-section-title" style="margin-top:2rem;"><i class="fa-solid fa-graduation-cap"></i> Grupos y Materias</h3>' +
    horRenderGruposMatList(sessions);
}

// ── VISTA: GENERAL ────────────────────────────────────────────
function horRenderGeneralView() {
  const search = ((document.getElementById('search-gen') || {}).value || '').toLowerCase().trim();
  const dia = (document.getElementById('filter-dia-gen') || {}).value || '';
  const out = document.getElementById('view-general');
  if (!out) return;

  let rows = _horData;
  if (dia) rows = rows.filter(function(r) { return r.dia === dia; });
  if (search) rows = rows.filter(function(r) {
    return [r.grupo, r.materia, r.docente, r.dia, r.hora_inicio, r.ciclo, r.turno]
      .some(function(v) { return String(v).toLowerCase().indexOf(search) >= 0; });
  });

  // Ordenar: ciclo desc, grupo, día, hora
  rows = rows.slice().sort(function(a, b) {
    if (a.ciclo !== b.ciclo) return String(b.ciclo).localeCompare(String(a.ciclo));
    if (a.grupo !== b.grupo) return String(a.grupo).localeCompare(String(b.grupo));
    const di = HOR_DIAS_ORDER.indexOf(a.dia) - HOR_DIAS_ORDER.indexOf(b.dia);
    if (di !== 0) return di;
    return String(a.hora_inicio).localeCompare(String(b.hora_inicio));
  });

  if (!rows.length) {
    out.innerHTML = '<p class="hor-hint">No se encontraron sesiones con los filtros aplicados.</p>';
    return;
  }

  const tbody = rows.map(function(r) {
    const dc = horColor(r.dia);
    return '<tr>' +
      '<td>' + horEsc(r.ciclo) + '</td>' +
      '<td><span class="hor-badge-grupo">' + horEsc(r.grupo) + '</span></td>' +
      '<td>' + horEsc(r.turno) + '</td>' +
      '<td>' + horEsc(r.materia) + '</td>' +
      '<td>' + horEsc(r.docente) + '</td>' +
      '<td><span class="hor-badge-dia" style="background:' + dc.bg + ';color:' + dc.text + ';border:1px solid ' + dc.border + ';">' + horEsc(r.dia) + '</span></td>' +
      '<td class="hor-mono">' + horEsc(horFormatTime(r.hora_inicio)) + '</td>' +
      '<td class="hor-mono">' + horEsc(horFormatTime(r.hora_fin)) + '</td>' +
      '<td class="hor-mono">' + horEsc(r.horas_bloque) + '</td>' +
    '</tr>';
  }).join('');

  out.innerHTML =
    '<div class="hor-gen-count">' + rows.length + ' sesión' + (rows.length !== 1 ? 'es' : '') + ' encontrada' + (rows.length !== 1 ? 's' : '') + '</div>' +
    '<div class="hor-gen-table-wrap">' +
    '<table class="hor-gen-table">' +
    '<thead><tr>' +
      '<th>Ciclo</th><th>Grupo</th><th>Turno</th>' +
      '<th>Materia</th><th>Docente</th>' +
      '<th>Día</th><th>Inicio</th><th>Fin</th><th>Hrs</th>' +
    '</tr></thead>' +
    '<tbody>' + tbody + '</tbody>' +
    '</table></div>';
}

// ── GRID DE HORARIO SEMANAL ───────────────────────────────────
function horRenderGrid(sessions, viewType) {
  if (!sessions.length)
    return '<p class="hor-hint">Sin sesiones para mostrar.</p>';

  // Normalizar horas de todas las sesiones
  sessions = sessions.map(function(s) {
    return Object.assign({}, s, {
      hora_inicio: horFormatTime(s.hora_inicio),
      hora_fin:    horFormatTime(s.hora_fin)
    });
  });

  // Horas únicas de inicio
  const times = Array.from(new Set(
    sessions.map(function(r) { return r.hora_inicio; }).filter(Boolean)
  )).sort(function(a, b) { return a.localeCompare(b); });

  if (!times.length)
    return '<p class="hor-hint">Sin horarios definidos.</p>';

  // Lookup de sesiones: dia -> hora_inicio -> sesión
  const lookup = {};
  sessions.forEach(function(s) {
    if (!lookup[s.dia]) lookup[s.dia] = {};
    if (!lookup[s.dia][s.hora_inicio]) lookup[s.dia][s.hora_inicio] = s;
  });

  // Ocupación por índice de bloque
  const occ = {};

  let html =
    '<div class="sched-scroll">' +
    '<table class="sched-table">' +
    '<thead><tr>' +
      '<th class="sched-th-time">Hora</th>' +
      HOR_DIAS_ORDER.map(function(d) {
        return '<th class="sched-th-day">' + HOR_DIAS_LABEL[d] + '</th>';
      }).join('') +
    '</tr></thead><tbody>';

  times.forEach(function(time, timeIdx) {
    html += '<tr>';
    html += '<td class="sched-td-time">' + horEsc(time) + '</td>';

    HOR_DIAS_ORDER.forEach(function(day) {
      const occKey = day + '_' + timeIdx;
      if (occ[occKey]) return; // cubierto por rowspan anterior

      const s = lookup[day] && lookup[day][time];
      if (s) {
        // Calcular rowspan contando cuántos slots caben
        let span = 1;
        for (let k = timeIdx + 1; k < times.length; k++) {
          if (times[k] < s.hora_fin) span++;
          else break;
        }

        // Marcar slots ocupados
        for (let j = 1; j < span; j++) {
          occ[day + '_' + (timeIdx + j)] = true;
        }

        let label, sub;
        if (viewType === 'grupo') {
          label = s.materia;
          sub = s.docente;
        } else if (s.componente === 'EXTRAESCOLAR') {
          label = s.materia;
          sub = 'Extraescolar / Fortalecimiento';
        } else {
          label = s.grupo;
          sub = s.materia;
        }
        
        const c = horColor(label);
        const hrsNum = parseFloat(s.horas_bloque) || 0;
        const hrsStr = (hrsNum % 1 === 0 ? String(Math.round(hrsNum)) : String(hrsNum)) + 'h';
        const tooltip = horEsc(label) + ' · ' + horEsc(sub) +
                        ' · ' + horEsc(s.hora_inicio) + '–' + horEsc(s.hora_fin) +
                        ' (' + hrsStr + ')';

        html +=
          '<td rowspan="' + span + '" class="sched-td-session"' +
              ' title="' + tooltip + '"' +
              ' style="background:' + c.bg + '; border-left:4px solid ' + c.border + '; border-top: 1px solid rgba(255,255,255,0.05);">';
              
        if (s.componente === 'EXTRAESCOLAR') {
          html += '<span class="sched-badge-extra">Extraescolar</span>';
        }
        
        html +=
            '<div class="sched-label" style="color:' + c.text + ';">' + horEsc(label) + '</div>' +
            '<div class="sched-sub">' + horEsc(sub) + '</div>' +
            '<div class="sched-time-tag">' +
              '<i class="fa-regular fa-clock"></i> ' + horEsc(s.hora_inicio) + '–' + horEsc(s.hora_fin) +
              '<span class="sched-hrs-badge">' + hrsStr + '</span>' +
            '</div>' +
          '</td>';
      } else {
        html += '<td class="sched-td-empty"></td>';
      }
    });

    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

// ── LISTAS DE RESUMEN ─────────────────────────────────────────
function horRenderMateriasList(sessions) {
  const byMat = {};
  sessions.forEach(function(r) {
    if (!byMat[r.materia]) byMat[r.materia] = {
      docente:    r.docente,
      componente: r.componente,
      total:      r.total_horas_materia,
      sesiones:   0
    };
    byMat[r.materia].sesiones++;
  });

  const cards = Object.keys(byMat).sort().map(function(mat) {
    const info = byMat[mat];
    const c = horColor(mat);
    return '<div class="hor-mat-card" style="border-left:4px solid ' + c.border + '; background:' + c.bg + ';">' +
      '<div class="hor-mat-name" style="color:' + c.text + ';">' + horEsc(mat) + '</div>' +
      '<div class="hor-mat-docente"><i class="fa-regular fa-user"></i> ' + horEsc(info.docente) + '</div>' +
      (info.componente ? '<div class="hor-mat-comp"><span class="badge-tag">' + horEsc(info.componente) + '</span></div>' : '') +
      (info.total ? '<div class="hor-mat-hrs"><i class="fa-regular fa-clock"></i> ' + horEsc(info.total) + ' hrs totales</div>' : '') +
    '</div>';
  }).join('');

  return '<div class="hor-mat-grid">' + cards + '</div>';
}

function horRenderGruposMatList(sessions) {
  const byGrupo = {};
  const extActs = {};

  sessions.forEach(function(r) {
    if (r.componente === 'EXTRAESCOLAR') {
      const key = r.materia || '(sin nombre)';
      if (!extActs[key]) extActs[key] = { hrs: 0 };
      extActs[key].hrs += parseFloat(r.horas_bloque) || 0;
      return;
    }
    if (!byGrupo[r.grupo]) byGrupo[r.grupo] = {
      materias: [],
      turno:    r.turno,
      hrs:      0
    };
    if (byGrupo[r.grupo].materias.indexOf(r.materia) < 0)
      byGrupo[r.grupo].materias.push(r.materia);
    byGrupo[r.grupo].hrs += parseFloat(r.horas_bloque) || 0;
  });

  const cards = Object.keys(byGrupo).sort().map(function(grupo) {
    const info = byGrupo[grupo];
    const c = horColor(grupo);
    return '<div class="hor-mat-card" style="border-left:4px solid ' + c.border + '; background:' + c.bg + ';">' +
      '<div class="hor-mat-name" style="color:' + c.text + ';">Grupo ' + horEsc(grupo) + '</div>' +
      (info.turno ? '<div class="hor-mat-comp"><span class="badge-tag">' + horEsc(info.turno) + '</span></div>' : '') +
      '<div class="hor-mat-docente">' + info.materias.sort().map(horEsc).join(' · ') + '</div>' +
      '<div class="hor-mat-hrs"><i class="fa-regular fa-clock"></i> ' + (Math.round(info.hrs * 10) / 10) + ' hrs / semana</div>' +
    '</div>';
  }).join('');

  const extCards = Object.keys(extActs).sort().map(function(act) {
    const info = extActs[act];
    return '<div class="hor-mat-card" style="border-left:4px solid #94a3b8; background: hsla(215, 15%, 20%, 0.3);">' +
      '<div class="hor-mat-name" style="color:#cbd5e1;">' + horEsc(act) + '</div>' +
      '<div class="hor-mat-comp" style="color:#94a3b8;">Extraescolar / Fortalecimiento</div>' +
      '<div class="hor-mat-hrs"><i class="fa-regular fa-clock"></i> ' + (Math.round(info.hrs * 10) / 10) + ' hrs / semana</div>' +
    '</div>';
  }).join('');

  const extSection = extCards
    ? '<h3 class="hor-section-title" style="margin-top:1.5rem;"><i class="fa-regular fa-star"></i> Extraescolares / Fortalecimiento</h3>' +
      '<div class="hor-mat-grid">' + extCards + '</div>'
    : '';

  return '<div class="hor-mat-grid">' + cards + '</div>' + extSection;
}

// ── REGENERAR ─────────────────────────────────────────────────
async function horHandleRegen() {
  const key = window.prompt('Clave de administrador para regenerar horarios:');
  if (!key) return;

  const btn = document.getElementById('btn-regenerar');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

  try {
    const result = await horariosAPI.regenerar(key);
    if (result.status === 'ok') {
      window.alert('✅ ' + result.message);
      horariosAPI.clearCache();
      
      // Limpiar mapa de colores
      Object.keys(_horColorMap).forEach(function(k) { delete _horColorMap[k]; });
      _horColorCtr = 0;
      
      _horData = await horariosAPI.getHorariosWeb(true);
      horInitApp();
    } else {
      window.alert('❌ ' + result.message);
    }
  } catch (err) {
    window.alert('Error al regenerar horarios: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// ── LOADING / ERROR ───────────────────────────────────────────
function horShowLoading(on) {
  const el = document.getElementById('hor-loading');
  if (el) el.style.display = on ? 'flex' : 'none';
}

function horShowError(msg) {
  const el = document.getElementById('hor-error');
  if (!el) return;
  el.style.display = '';
  el.innerHTML =
    '<div class="hor-error-box">' +
      '<div style="font-size:2rem; margin-bottom:0.5rem; color: var(--accent-red);"><i class="fa-solid fa-circle-exclamation"></i></div>' +
      '<strong>No se pudo cargar el visor de Horarios.</strong>' +
      '<p style="margin:0.5rem 0 0; font-size:0.85rem; color: var(--text-muted);">' + msg + '</p>' +
    '</div>';
}

// ── HELPERS ───────────────────────────────────────────────────
function horFormatTime(v) {
  if (!v && v !== 0) return '';
  if (v instanceof Date) {
    return ('0' + v.getHours()).slice(-2) + ':' + ('0' + v.getMinutes()).slice(-2);
  }
  const s = String(v).trim();
  if (s.indexOf('T') !== -1) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2);
    }
  }
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const parts = s.split(':');
    return ('0' + parseInt(parts[0], 10)).slice(-2) + ':' + parts[1];
  }
  return s;
}

function horEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function horInitials(name) {
  return String(name || '').split(/\s+/).slice(0, 2)
    .map(function(w) { return w[0] || ''; }).join('').toUpperCase();
}

function horSumChip(val, lbl) {
  return '<div class="hor-sum-chip">' +
    '<span class="hor-sum-val">' + horEsc(val) + '</span>' +
    '<span class="hor-sum-lbl">' + horEsc(lbl) + '</span>' +
  '</div>';
}
