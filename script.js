/**
 * Optimizaciones aplicadas:
 * 1. Desacoplamiento de datos y vista.
 * 2. Actualización atómica del DOM (sin innerHTML recurrente).
 * 3. Manejo de errores resiliente y cache inteligente.
 */

const CONFIG = {
  CACHE_DURATION: 5 * 60 * 1000,
  API_URL: 'https://api.open-meteo.com/v1/forecast'
};

const timezones = [
  { label: 'Colombia', elementId: 'hora-colombia', timezone: 'America/Bogota', lat: 4.60, lon: -74.08 },
  { label: 'Chile', elementId: 'hora-chile', timezone: 'America/Santiago', lat: -33.45, lon: -70.66 },
  { label: 'Perú', elementId: 'hora-peru', timezone: 'America/Lima', lat: -12.04, lon: -77.03 },
  { label: 'India', elementId: 'hora-india', timezone: 'Asia/Kolkata', lat: 28.61, lon: 77.20 },
];

const climaCache = new Map();

// Formateador reutilizable para mejorar el rendimiento
const timeFormatter = (tz) => new Intl.DateTimeFormat('en-US', {
  timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
});

const getIconClass = (code) => {
  const icons = {
    0: 'icono-despejado',
    1: 'icono-nublado-parcial', 2: 'icono-nublado-parcial', 3: 'icono-nublado-parcial',
    45: 'icono-neblina', 48: 'icono-neblina',
    61: 'icono-lluvioso', 63: 'icono-lluvioso', 65: 'icono-lluvia-fuerte',
    71: 'icono-nieve', 80: 'icono-lluvia-fuerte'
  };
  return icons[code] || 'icono-desconocido';
};

async function obtenerClima(lat, lon) {
  const key = `${lat},${lon}`;
  const cached = climaCache.get(key);
  const ahora = Date.now();

  if (cached && ahora - cached.timestamp < CONFIG.CACHE_DURATION) return cached.data;

  try {
    const url = `${CONFIG.API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error('API Error');
    
    const datos = await respuesta.json();
    const resultado = {
      temperatura: datos.current ? Math.round(datos.current.temperature_2m) : "--",
      weathercode: datos.current?.weather_code || 0
    };

    climaCache.set(key, { data: resultado, timestamp: ahora });
    return resultado;
  } catch (error) {
    return { temperatura: "--", weathercode: 0 };
  }
}

const actualizarUI = async (pais, forzarClima = false) => {
  const container = document.getElementById(pais.elementId);
  if (!container) return;

  // 1. Inicialización única de la estructura (Skeleton)
  if (!container.querySelector('.info-texto')) {
    container.innerHTML = `
      <div class="info-texto">
        <span class="pais">${pais.label}</span>
        <span class="hora"><span class="time"></span></span>
        <span class="clima">
          <span class="icono"></span>
          <span class="temp">--°C</span>
        </span>
      </div>`;
  }

  // 2. Referencias a nodos específicos (Acceso quirúrgico)
  const timeEl = container.querySelector('.time');
  const tempEl = container.querySelector('.temp');
  const iconEl = container.querySelector('.icono');

  // 3. Actualizar hora (Cada segundo)
  const timeStr = timeFormatter(pais.timezone).format(new Date());
  if (timeEl.textContent !== timeStr) {
    timeEl.textContent = timeStr;
  }

  // 4. Actualizar clima (Solo si es necesario)
  if (forzarClima) {
    const clima = await obtenerClima(pais.lat, pais.lon);
    tempEl.textContent = `${clima.temperatura}°C`;
    iconEl.className = `icono ${getIconClass(clima.weathercode)}`;
  }
};

const tick = () => {
  const ahora = new Date();
  const esMomentoClima = ahora.getSeconds() === 0 && ahora.getMinutes() % 5 === 0;
  
  timezones.forEach(p => actualizarUI(p, esMomentoClima));
};

document.addEventListener('DOMContentLoaded', () => {
  // Primer renderizado inmediato
  timezones.forEach(p => actualizarUI(p, true));
  // Heartbeat del sistema
  setInterval(tick, 1000);
});
