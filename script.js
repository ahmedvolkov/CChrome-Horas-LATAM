// Configuración de países con coordenadas y zonas horarias
const timezones = [
  { label: 'Colombia', elementId: 'hora-colombia', timezone: 'America/Bogota', lat: 4.60, lon: -74.08 },
  { label: 'Chile',    elementId: 'hora-chile',    timezone: 'America/Santiago', lat: -33.45, lon: -70.66 },
  { label: 'Perú',     elementId: 'hora-peru',     timezone: 'America/Lima', lat: -12.04, lon: -77.03 },
  { label: 'India',    elementId: 'hora-india',    timezone: 'Asia/Kolkata', lat: 28.61, lon: 77.20 },
];

async function obtenerTemperatura(lat, lon) {
  try {
    // URL corregida: agregar current=temperature_2m para obtener temperatura actual
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    
    // Verificar si hay datos válidos
    if (datos.current && typeof datos.current.temperature_2m === 'number') {
      return Math.round(datos.current.temperature_2m);
    } else {
      console.warn("Datos de temperatura no disponibles:", datos);
      return "--";
    }
  } catch (error) {
    console.error("Error obteniendo clima:", error);
    return "--";
  }
}

const actualizarHora = async (pais) => {
  const container = document.getElementById(pais.elementId);
  if (!container) {
    console.warn(`Elemento no encontrado: ${pais.elementId}`);
    return;
  }

  const ahora = new Date();
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: pais.timezone,
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true
  }).format(ahora);

  const infoTexto = container.querySelector('.info-texto');
  const ahoraMins = ahora.getMinutes();

  // Actualizar temperatura cada 5 minutos o si no existe
  if (!infoTexto || ahoraMins % 5 === 0) {
    const tempReal = await obtenerTemperatura(pais.lat, pais.lon);
    if (infoTexto) {
      infoTexto.querySelector('.temp').textContent = `${tempReal}°C`;
    } else {
      container.innerHTML = `
        <div class="info-texto">
          <span class="pais">${pais.label}</span>
          <span class="hora"><span class="time">${formattedTime}</span></span>
          <span class="temp">${tempReal}°C</span>
        </div>
      `;
    }
  } else {
    // Solo actualizar hora
    container.querySelector('.time').textContent = formattedTime;
  }
};

// Función para inicializar todos los países
const inicializarRelojes = () => {
  timezones.forEach(actualizarHora);
  // Actualizar cada segundo para la hora
  setInterval(() => {
    timezones.forEach(actualizarHora);
  }, 1000);
};

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarRelojes);
