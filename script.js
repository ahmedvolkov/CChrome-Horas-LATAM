/**
 * SISTEMA DE RELOJ Y CLIMA INTEGRADO
 * Arquitectura: Single Pulse / DOM Caching / CSS-Driven Icons
 */

const CONFIG = {
  CACHE_DURATION: 300000, // 5 minutos en milisegundos
  API_URL: 'https://api.open-meteo.com/v1/forecast'
};

const timezones = [
  { label: 'Colombia', elementId: 'hora-colombia', timezone: 'America/Bogota', lat: 4.60, lon: -74.08 },
  { label: 'Chile', elementId: 'hora-chile', timezone: 'America/Santiago', lat: -33.45, lon: -70.66 },
  { label: 'Perú', elementId: 'hora-peru', timezone: 'America/Lima', lat: -12.04, lon: -77.03 },
  { label: 'India', elementId: 'hora-india', timezone: 'Asia/Kolkata', lat: 28.61, lon: 77.20 },
  { label: 'Japón', elementId: 'hora-japon', timezone: 'Asia/Tokyo', lat: 35.68, lon: 139.65 }, // <--- Japón agregado
];

// Estructuras de datos para optimización (Memoización)
const nodesCache = new Map();
const formattersCache = new Map();
const weatherCache = new Map();

/**
 * Mapeo de códigos Open-Meteo a tus clases de CSS
 */
const getIconClass = (code) => {
  const mapping = {
    0: 'icono-despejado',
    1: 'icono-nublado-parcial', 2: 'icono-nublado-parcial', 3: 'icono-nublado-parcial',
    45: 'icono-neblina', 48: 'icono-neblina',
    61: 'icono-lluvioso', 63: 'icono-lluvioso', 
    65: 'icono-lluvia-fuerte', 67: 'icono-lluvia-fuerte',
    71: 'icono-nieve', 73: 'icono-nieve', 75: 'icono-nieve', 77: 'icono-nieve',
    80: 'icono-lluvia-fuerte', 81: 'icono-lluvia-fuerte', 82: 'icono-lluvia-fuerte'
  };
  return mapping[code] || 'icono-desconocido';
};

/**
 * Obtención de clima con lógica de caché
 */
async function fetchWeather(p) {
  const key = `${p.lat},${p.lon}`;
  const now = Date.now();
  const cached = weatherCache.get(key);

  if (cached && now - cached.timestamp < CONFIG.CACHE_DURATION) {
    return cached.data;
  }

  try {
    const url = `${CONFIG.API_URL}?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    
    const data = await res.json();
    const result = {
      temp: Math.round(data.current.temperature_2m),
      code: data.current.weather_code
    };
    
    weatherCache.set(key, { data: result, timestamp: now });
    return result;
  } catch (e) {
    return { temp: "--", code: -1 };
  }
}

/**
 * Inicialización de la UI y caché de nodos
 */
const setupUI = () => {
  timezones.forEach(p => {
    const container = document.getElementById(p.elementId);
    if (!container) return;

    // Inyectar estructura solo una vez
    container.innerHTML = `
      <div class="info-texto">
        <span class="pais">${p.label}</span>
        <span class="hora"><span class="time">--:--:--</span></span>
        <span class="clima">
          <span class="icono"></span>
          <span class="temp">--°C</span>
        </span>
      </div>`;

    // Guardar referencias a los nodos (Evita buscar en el DOM cada segundo)
    nodesCache.set(p.elementId, {
      time: container.querySelector('.time'),
      temp: container.querySelector('.temp'),
      icon: container.querySelector('.icono')
    });

    // Guardar formateadores (Evita crear objetos pesados cada segundo)
    formattersCache.set(p.timezone, new Intl.DateTimeFormat('en-US', {
      timeZone: p.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    }));
  });
};

/**
 * El Pulso (Heartbeat) del sistema
 */
const pulse = async () => {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  
  // El clima se actualiza al inicio (cuando está vacío) o cada 5 minutos
  const shouldUpdateWeather = (seconds === 0 && minutes % 5 === 0);

  timezones.forEach(async p => {
    const cache = nodesCache.get(p.elementId);
    if (!cache) return;

    // 1. Actualizar Hora (textContent es atómico y rápido)
    const timeStr = formattersCache.get(p.timezone).format(now);
    if (cache.time.textContent !== timeStr) {
      cache.time.textContent = timeStr;
    }

    // 2. Actualizar Clima
    if (shouldUpdateWeather || cache.temp.textContent === "--°C") {
      const weather = await fetchWeather(p);
      
      // Actualizar temperatura
      cache.temp.textContent = `${weather.temp}°C`;
      
      // Actualizar Icono via ClassName (Lógica CSS)
      const newIconClass = getIconClass(weather.code);
      if (!cache.icon.classList.contains(newIconClass)) {
        cache.icon.className = `icono ${newIconClass}`;
      }
    }
  });
};

// Punto de entrada
document.addEventListener('DOMContentLoaded', () => {
  setupUI();
  pulse(); 
  setInterval(pulse, 1000);
});

/**
 * Lógica dedicada para el Indicador de Bitcoin
 */

const actualizarBTC = async () => {
    const btcPriceEl = document.querySelector('#market-btc .market-price');
    
    // Si el elemento no existe en el DOM, salimos para evitar errores
    if (!btcPriceEl) return;

    try {
        // Usamos la API de CoinGecko que no requiere API Key y permite CORS
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        const precio = data.bitcoin.usd;

        // Formateo profesional: USD 64,230.50
        btcPriceEl.textContent = `USD ${precio.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    } catch (error) {
        console.error("Error al obtener BTC:", error);
        // Fallback en caso de error de conexión
        if (btcPriceEl.textContent === "Cargando...") {
            btcPriceEl.textContent = "Servicio no disponible";
        }
    }
};

/**
 * Inicialización
 */
document.addEventListener('DOMContentLoaded', () => {
    // Primera carga inmediata
    actualizarBTC();

    // Actualización cada 60 segundos (óptimo para no ser bloqueado por la API)
    setInterval(actualizarBTC, 60000);
});

// OIL -- from Here! CON alphavantage 25 calls daily""

'use strict';

/**
 * Función para obtener y mostrar el precio del petróleo (WTI)
 * utilizando la API de Alpha Vantage.
 */
async function actualizarPrecioPetroleo() {
    const apiKey = 'HLNARILAGSL9TNIR';
    const url = `https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${apiKey}`;
    
    // Seleccionamos el elemento donde se mostrará el precio
    const precioElemento = document.querySelector('#market-oil .market-price');

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error de red: ${response.status}`);
        }

        const data = await response.json();

        // La API de Alpha Vantage para WTI devuelve la info en data[0].value
        if (data && data.data && data.data[0]) {
            const ultimoPrecio = data.data[0].value;
            precioElemento.innerText = `$${ultimoPrecio} USD`;
        } else if (data.Note) {
            // Manejo de límite de API (Alpha Vantage permite pocas peticiones por minuto)
            precioElemento.innerText = "Límite excedido";
            console.warn("Nota de la API:", data.Note);
        } else {
            precioElemento.innerText = "No disponible";
        }

    } catch (error) {
        console.error('Error al obtener el precio del petróleo:', error);
        precioElemento.innerText = "Error de conexión";
    }
}

// Ejecutar cuando el HTML esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    actualizarPrecioPetroleo();

    // Opcional: Actualizar cada 60 minutos para no agotar la API Key
    setInterval(actualizarPrecioPetroleo, 3600000);
});
