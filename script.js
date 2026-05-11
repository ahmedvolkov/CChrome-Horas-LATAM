const timezones = [
  { label: 'Colombia', elementId: 'hora-colombia', timezone: 'America/Bogota', lat: 4.60, lon: -74.08 },
  { label: 'Chile', elementId: 'hora-chile', timezone: 'America/Santiago', lat: -33.45, lon: -70.66 },
  { label: 'Perú', elementId: 'hora-peru', timezone: 'America/Lima', lat: -12.04, lon: -77.03 },
  { label: 'India', elementId: 'hora-india', timezone: 'Asia/Kolkata', lat: 28.61, lon: 77.20 },
];

// Cache de clima (expira en 5 min)
const climaCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function obtenerClima(lat, lon) {
  const key = `${lat},${lon}`;
  const cached = climaCache.get(key);
  const ahora = Date.now();
  
  if (cached && ahora - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    
    const resultado = datos.current ? {
      temperatura: Math.round(datos.current.temperature_2m),
      weathercode: datos.current.weather_code || 0
    } : { temperatura: "--", weathercode: 0 };
    
    climaCache.set(key, { data: resultado, timestamp: ahora });
    return resultado;
  } catch (error) {
    console.error("Error clima:", error);
    return { temperatura: "--", weathercode: 0 };
  }
}

const getIconClass = (code) => {
  const icons = {
    0: 'icono-despejado',
    1: 'icono-nublado-parcial', 2: 'icono-nublado-parcial', 3: 'icono-nublado-parcial',
    45: 'icono-neblina', 48: 'icono-neblina',
    61: 'icono-lluvioso', 63: 'icono-lluvioso', 65: 'icono-lluvia-fuerte', 67: 'icono-lluvia-fuerte',
    71: 'icono-nieve', 73: 'icono-nieve', 75: 'icono-nieve', 77: 'icono-nieve',
    80: 'icono-lluvia-fuerte', 81: 'icono-lluvia-fuerte', 82: 'icono-lluvia-fuerte'
  };
  return icons[code] || 'icono-desconocido';
};

let updateInterval;

const actualizarHora = (pais) => {
  const container = document.getElementById(pais.elementId);
  if (!container) return;

  const ahora = new Date();
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: pais.timezone, hour: '2-digit', minute: '2-digit', 
    second: '2-digit', hour12: true
  }).format(ahora);

  const infoTexto = container.querySelector('.info-texto');
  const necesitaClima = !infoTexto || ahora.getMinutes() % 5 === 0;

  if (necesitaClima) {
    obtenerClima(pais.lat, pais.lon).then(clima => {
      const iconClass = getIconClass(clima.weathercode);
      container.innerHTML = `
        <div class="info-texto">
          <span class="pais">${pais.label}</span>
          <span class="hora"><span class="time">${formattedTime}</span></span>
          <span class="clima">
            <span class="icono ${iconClass}"></span>
            <span class="temp">${clima.temperatura}°C</span>
          </span>
        </div>
      `;
    });
  } else {
    infoTexto.querySelector('.time').textContent = formattedTime;
  }
};

const inicializarRelojes = () => {
  timezones.forEach(actualizarHora);
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(() => timezones.forEach(actualizarHora), 1000);
};

document.addEventListener('DOMContentLoaded', inicializarRelojes);
