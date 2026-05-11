// Configuración de países
const timezones = [
  { label: 'Colombia', elementId: 'hora-colombia', timezone: 'America/Bogota', lat: 4.60, lon: -74.08 },
  { label: 'Chile',    elementId: 'hora-chile',    timezone: 'America/Santiago', lat: -33.45, lon: -70.66 },
  { label: 'Perú',     elementId: 'hora-peru',     timezone: 'America/Lima', lat: -12.04, lon: -77.03 },
  { label: 'India',    elementId: 'hora-india',    timezone: 'Asia/Kolkata', lat: 28.61, lon: 77.20 },
];

// Nueva función para obtener temperatura + weathercode
async function obtenerClima(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    
    if (datos.current) {
      return {
        temperatura: Math.round(datos.current.temperature_2m),
        weathercode: datos.current.weather_code || 0
      };
    }
    return { temperatura: "--", weathercode: 0 };
  } catch (error) {
    console.error("Error clima:", error);
    return { temperatura: "--", weathercode: 0 };
  }
}

// Mapeo de iconos por weathercode (WMO)
const getIconClass = (code) => {
  if (code === 0) return 'icono-despejado';
  if (code >= 1 && code <= 3) return 'icono-nublado-parcial';
  if (code >= 45 && code <= 48) return 'icono-neblina';
  if (code >= 61 && code <= 67) return 'icono-lluvioso';
  if (code >= 71 && code <= 77) return 'icono-nieve';
  if (code >= 80) return 'icono-lluvia-fuerte';
  return 'icono-desconocido';
};

const actualizarHora = async (pais) => {
  const container = document.getElementById(pais.elementId);
  if (!container) return;

  const ahora = new Date();
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: pais.timezone,
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  }).format(ahora);

  const infoTexto = container.querySelector('.info-texto');
  const ahoraMins = ahora.getMinutes();

  if (!infoTexto || ahoraMins % 5 === 0) {
    const clima = await obtenerClima(pais.lat, pais.lon);
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
  } else {
    container.querySelector('.time').textContent = formattedTime;
  }
};

const inicializarRelojes = () => {
  timezones.forEach(actualizarHora);
  setInterval(() => timezones.forEach(actualizarHora), 1000);
};

document.addEventListener('DOMContentLoaded', inicializarRelojes);
