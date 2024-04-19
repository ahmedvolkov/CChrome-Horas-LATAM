function mostrarHoraColombia() {
    // Crear un objeto de fecha para Colombia con la zona horaria 'America/Bogota'
    let fechaColombia = new Date().toLocaleString("es-CL", {timeZone: "America/Bogota"});
    // Mostrar la hora en el elemento con id 'hora-colombia'
    const formattedTime = 'Hora Colombia: ' + fechaColombia
    document.getElementById('hora-colombia').innerText = formattedTime;
  }
  
  // Llamar a la función cada segundo para actualizar la hora
  setInterval(mostrarHoraColombia, 1000);

  function mostrarHoraChile() {
    // Crear un objeto de fecha para Chile con la zona horaria 'America/Santiago'
    let fechaChile = new Date().toLocaleString("es-CL", {timeZone: "America/Santiago"});
    // Mostrar la hora en el elemento con id 'hora-chile'
    const formattedTime = 'Hora Chile: ' + fechaChile
    document.getElementById('hora-chile').innerText = formattedTime;
  }
  
  // Llamar a la función cada segundo para actualizar la hora
  setInterval(mostrarHoraChile, 1000);

  // ojo :
  //FALTA HORA MEXICO ********************************** ahmeKKK

  function mostrarHoraPeru() {
    // Crear un objeto de fecha para Chile con la zona horaria 'America/Santiago'
    let fechaPeru = new Date().toLocaleString("es-CL", {timeZone: "America/Lima"});
    // Mostrar la hora en el elemento con id 'hora-chile'
    const formattedTime = 'Hora Perú: ' + fechaPeru
    document.getElementById('hora-peru').innerText = formattedTime;
  }
  
  // Llamar a la función cada segundo para actualizar la hora
  setInterval(mostrarHoraPeru, 1000);
  
  