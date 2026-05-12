/**
 * NIVEL DE OPTIMIZACIÓN: EXTREMO (High-Performance Edition)
 */

const CONFIG = {
  CACHE_DURATION: 300000, // 5 min en ms
  API_URL: 'https://api.open-meteo.com/v1/forecast'
};

const timezones = [
  { label: 'Colombia', elementId: 'hora-colombia', timezone: 'America/Bogota', lat: 4.60, lon: -74.08 },
  { label: 'Chile', elementId: 'hora-chile', timezone: 'America/Santiago', lat: -33.45, lon: -70.66 },
  { label: 'Perú', elementId: 'hora-peru', timezone: 'America/Lima', lat: -12.04, lon: -77.03 },
  { label: 'India', elementId: 'hora-india', timezone: 'Asia/Kolkata', lat: 28.61, lon: 77.20 },
];

// Pre-caché de elementos del DOM y formateadores para evitar búsquedas cada segundo
const nodes = new Map();
const formatters = new Map();
const climaCache = new Map();

/**
 * OPTIMIZACIÓN 1: Inicialización estática
 * Buscamos los elementos una sola vez y creamos los formateadores.
 */
const setup = () => {
  timezones.forEach(p => {
    const container = document.getElementById(p.elementId);
    if (!container) return;

    // Inyectamos la estructura base una única vez
    container.innerHTML = `
      <div class="info-texto">
        <span class="pais">${p.label}</span>
        <span class="hora"><span class="time"></span></span>
        <span class="clima"><span class="icono"></span> <span class="temp">--°C</span></span>
      </div>`;

    // Guardamos las referencias directas a los nodos hijos
    nodes.set(p.elementId, {
      time: container.querySelector('.time'),
      temp: container.querySelector('.temp'),
      icon: container.querySelector('.icono')
    });

    // Reutilizamos el mismo objeto formateador (Ahorra CPU y Memoria)
    formatters.set(p.timezone, new Intl.DateTimeFormat('en-US', {
      timeZone: p.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    }));
  });
};

/**
 * OPTIMIZACIÓN 2: Lógica de Clima con Bloqueo de Peticiones
 */
async function fetchClima(p) {
  const key = `${p.lat},${p.lon}`;
  const ahora = Date.now();
  const cached = climaCache.get(key);

  if (cached && ahora - cached.timestamp < CONFIG.CACHE_DURATION) return cached.data;

  try {
    const res = await fetch(`${CONFIG.API_URL}?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code`);
    const { current } = await res.json();
    const data = { temp: Math.round(current.temperature_2m), code: current.weather_code };
    climaCache.set(key, { data, timestamp: ahora });
    return data;
  } catch {
    return { temp: "--", code: 0 };
  }
}

/**
 * OPTIMIZACIÓN 3: El "Heartbeat" síncrono
 * Usamos un solo objeto Date para todos los relojes en cada ciclo.
 */
const pulse = async () => {
  const ahora = new Date();
  const seg = ahora.getSeconds();
  const min = ahora.getMinutes();
  const esCicloClima = (seg === 0 && min % 5 === 0);

  timezones.forEach(async p => {
    const nodeSet = nodes.get(p.elementId);
    if (!nodeSet) return;

    // Actualización de hora: Solo si cambia el texto (minimiza repintado)
    const timeStr = formatters.get(p.timezone).format(ahora);
    if (nodeSet.time.textContent !== timeStr) {
      nodeSet.time.textContent = timeStr;
    }

    // Actualización de clima: Desacoplada del flujo principal
    if (esCicloClima || nodeSet.temp.textContent === "--°C") {
      const clima = await fetchClima(p);
      nodeSet.temp.textContent = `${clima.temp}°C`;
      nodeSet.icon.className = `icono ${getIconClass(clima.code)}`;
    }
  });
};

// Iniciar con máxima eficiencia
document.addEventListener('DOMContentLoaded', () => {
  setup();
  pulse(); // Primer pulso inmediato
  setInterval(pulse, 1000);
});
