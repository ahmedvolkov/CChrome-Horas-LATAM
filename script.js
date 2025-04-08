const timezones = [
  { timezone: 'America/Bogota', label: 'Hora Colombia', elementId: 'hora-colombia' },
  { timezone: 'America/Santiago', label: 'Hora Chile', elementId: 'hora-chile' },
  { timezone: 'America/Lima', label: 'Hora Perú', elementId: 'hora-peru' },
  { timezone: 'Asia/Kolkata', label: 'Hora India', elementId: 'hora-india' },
  { timezone: 'Asia/Tokyo', label: 'Hora Japón', elementId: 'hora-japon' },
];

function formatDateTime(date, timezone) {
  // Formatear fecha y hora con la zona horaria correcta
  const formattedDate = date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone, // Agregar zona horaria a la fecha
  });
  const formattedTime = date.toLocaleTimeString('es-CL', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: timezone,
  });
  return `${formattedDate} ${formattedTime}`;
}

function actualizarHora(timezoneData) {
  const now = new Date();
  const formattedTime = formatDateTime(now, timezoneData.timezone);
  const element = document.getElementById(timezoneData.elementId);
  if (element) {
    element.innerText = `${timezoneData.label}: ${formattedTime}`;
  } else {
    console.error(`Elemento con id "${timezoneData.elementId}" no encontrado.`);
  }
}

function iniciarRelojes() {
  timezones.forEach(timezoneData => {
    actualizarHora(timezoneData); // Actualizar inmediatamente al cargar la página
  });
}

// Asegurarse de que el DOM esté cargado antes de iniciar los relojes
document.addEventListener('DOMContentLoaded', () => {
  iniciarRelojes();
  setInterval(() => {
    timezones.forEach(actualizarHora);
  }, 1000);
});
