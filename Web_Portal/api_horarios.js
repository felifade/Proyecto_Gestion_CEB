// ============================================================
// api_horarios.js — Cliente API del visor de Horarios CEB
// ============================================================

const HORARIOS_API_URL = "https://script.google.com/macros/s/AKfycbyQUyTVSi3-IxFpHR_ySzjaW5AxmXEiI29bVve4IixeKyOwtohWO-kreg8ycl0jFphw/exec";

// Caché en sessionStorage — 15 minutos de vigencia
const _HOR_CACHE_KEY = 'hor_web_v1';
const _HOR_CACHE_TTL = 15 * 60 * 1000;

const horariosAPI = {

  /** Obtiene los datos de HORARIOS_WEB (con caché). */
  async getHorariosWeb(forceRefresh) {
    if (!forceRefresh) {
      try {
        const raw = sessionStorage.getItem(_HOR_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Date.now() - parsed.ts < _HOR_CACHE_TTL) return parsed.data;
        }
      } catch (_) {}
    }

    const url  = `${HORARIOS_API_URL}?action=getHorariosWeb&_t=${Date.now()}`;
    const res  = await fetch(url, { method: 'GET', redirect: 'follow' });
    const json = await res.json();

    if (json.status === 'error') throw new Error(json.message);

    try {
      sessionStorage.setItem(_HOR_CACHE_KEY, JSON.stringify({
        data: json.data,
        ts:   Date.now()
      }));
    } catch (_) {}

    return json.data;
  },

  /** Dispara la regeneración de HORARIOS_WEB. */
  async regenerar(adminKey) {
    const url = `${HORARIOS_API_URL}?action=regenerar&adminKey=${encodeURIComponent(adminKey)}&_t=${Date.now()}`;
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return res.json();
  },

  /** Limpia la caché local. */
  clearCache() {
    try { sessionStorage.removeItem(_HOR_CACHE_KEY); } catch (_) {}
  }
};
