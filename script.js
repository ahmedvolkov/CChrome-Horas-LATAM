const colombiaTimezone = 'America/Bogota';
const chileTimezone = 'America/Santiago';
const peruTimezone = 'America/Lima';

function formatDateTime(date, timezone, label) {
  const formattedDate = date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const formattedTime = date.toLocaleTimeString('es-CL', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: timezone,
  });
  return `${label}: ${formattedDate} ${formattedTime}`;
}

function mostrarHoraColombia() {
  const fechaColombia = new Date();
  const formattedTime = formatDateTime(fechaColombia, colombiaTimezone, 'Hora Colombia');
  document.getElementById('hora-colombia').innerText = formattedTime;
}

setInterval(mostrarHoraColombia, 1000);

function mostrarHoraChile() {
  const fechaChile = new Date();
  const formattedTime = formatDateTime(fechaChile, chileTimezone, 'Hora Chile');
  document.getElementById('hora-chile').innerText = formattedTime;
}

setInterval(mostrarHoraChile, 1000);

function mostrarHoraPeru() {
  const fechaPeru = new Date();
  const formattedTime = formatDateTime(fechaPeru, peruTimezone, 'Hora Perú');
  document.getElementById('hora-peru').innerText = formattedTime;
}

setInterval(mostrarHoraPeru, 1000);

function mostrarHoraIndia() {
    const indiaTimezone = 'Asia/Kolkata';
    const fechaIndia = new Date();
    const formattedTime = formatDateTime(fechaIndia, indiaTimezone, 'Hora India');
    document.getElementById('hora-india').innerText = formattedTime;
}

setInterval(mostrarHoraIndia, 1000);  
