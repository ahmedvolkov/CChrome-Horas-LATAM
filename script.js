const timezones = [
    { timezone: 'America/Bogota', label: 'Hora Colombia', elementId: 'hora-colombia' },
    { timezone: 'America/Santiago', label: 'Hora Chile', elementId: 'hora-chile' },
    { timezone: 'America/Lima', label: 'Hora Perú', elementId: 'hora-peru' },
    { timezone: 'Asia/Kolkata', label: 'Hora India', elementId: 'hora-india' },
  ];
  
  function formatDateTime(date, timezone) {
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
    return `${formattedDate} ${formattedTime}`;
  }
  
  function actualizarHora(timezoneData) {
    const now = new Date();
    const formattedTime = formatDateTime(now, timezoneData.timezone);
    document.getElementById(timezoneData.elementId).innerText = `${timezoneData.label}: ${formattedTime}`;
  }
  
  function iniciarRelojes() {
    timezones.forEach(timezoneData => {
      actualizarHora(timezoneData); // Actualizar inmediatamente al cargar la página
    });
  }
  
  setInterval(() => {
    timezones.forEach(actualizarHora);
  }, 1000);
  
  iniciarRelojes();
