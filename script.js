/**
 * DASHBOARD MUNDIAL PRO - OPTIMIZED 2026
 * Arquitectura: Parallel Pulse / DOM Caching / Error Isolation
 */

const CONFIG = {
    CACHE_DURATION: 300000, 
    API_METEO: 'https://api.open-meteo.com/v1/forecast',
    OIL_API_KEY: 'HLNARILAGSL9TNIR',
    MARKETS_REFRESH: 300000
};

const timezones = [
    { label: 'Colombia', elementId: 'hora-colombia', timezone: 'America/Bogota', lat: 4.60, lon: -74.08 },
    { label: 'Chile', elementId: 'hora-chile', timezone: 'America/Santiago', lat: -33.45, lon: -70.66 },
    { label: 'Perú', elementId: 'hora-peru', timezone: 'America/Lima', lat: -12.04, lon: -77.03 },
    { label: 'India', elementId: 'hora-india', timezone: 'Asia/Kolkata', lat: 28.61, lon: 77.20 },
    { label: 'Japón', elementId: 'hora-japon', timezone: 'Asia/Tokyo', lat: 35.68, lon: 139.65 },
];

const nodesCache = new Map();
const marketNodes = new Map();
const formattersCache = new Map();
const weatherCache = new Map();

/**
 * Utilitarios de Formateo y Fetch
 */
const fm = (v, p = "") => p + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const fetchJSON = async (url) => {
    try {
        const res = await fetch(url);
        return res.ok ? await res.json() : null;
    } catch { return null; }
};

// --- CLIMA Y RELOJ ---

const getIconClass = (code) => {
    const mapping = {
        0: 'icono-despejado', 1: 'icono-nublado-parcial', 2: 'icono-nublado-parcial', 3: 'icono-nublado-parcial',
        45: 'icono-neblina', 48: 'icono-neblina', 61: 'icono-lluvioso', 63: 'icono-lluvioso',
        65: 'icono-lluvia-fuerte', 67: 'icono-lluvia-fuerte', 71: 'icono-nieve', 73: 'icono-nieve',
        80: 'icono-lluvia-fuerte', 81: 'icono-lluvia-fuerte', 82: 'icono-lluvia-fuerte'
    };
    return mapping[code] || 'icono-desconocido';
};

async function fetchWeather(p) {
    const key = `${p.lat},${p.lon}`;
    const now = Date.now();
    const cached = weatherCache.get(key);
    if (cached && now - cached.timestamp < CONFIG.CACHE_DURATION) return cached.data;

    const data = await fetchJSON(`${CONFIG.API_METEO}?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code`);
    if (data) {
        const result = { temp: Math.round(data.current.temperature_2m), code: data.current.weather_code };
        weatherCache.set(key, { data: result, timestamp: now });
        return result;
    }
    return { temp: "--", code: -1 };
}

const setupUI = () => {
    // 1. Relojes
    timezones.forEach(p => {
        const container = document.getElementById(p.elementId);
        if (!container) return;
        container.innerHTML = `<div class="info-texto"><span class="pais">${p.label}</span><span class="hora"><span class="time">--:--:--</span></span><span class="clima"><span class="icono"></span><span class="temp">--°C</span></span></div>`;
        
        nodesCache.set(p.elementId, {
            time: container.querySelector('.time'),
            temp: container.querySelector('.temp'),
            icon: container.querySelector('.icono')
        });
        formattersCache.set(p.timezone, new Intl.DateTimeFormat('en-US', {
            timeZone: p.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        }));
    });

    // 2. Mercados (Cache de nodos para evitar re-escaneo del DOM)
    ['btc', 'oil', 'bcv', 'usdt'].forEach(id => {
        marketNodes.set(id, document.querySelector(`#market-${id} .market-price`));
    });
};

const pulse = async () => {
    const now = new Date();
    const isWeatherTick = (now.getSeconds() === 0 && now.getMinutes() % 5 === 0);

    timezones.forEach(async p => {
        const cache = nodesCache.get(p.elementId);
        if (!cache) return;
        
        cache.time.textContent = formattersCache.get(p.timezone).format(now);
        
        if (isWeatherTick || cache.temp.textContent === "--°C") {
            const w = await fetchWeather(p);
            cache.temp.textContent = `${w.temp}°C`;
            cache.icon.className = `icono ${getIconClass(w.code)}`;
        }
    });
};

// --- LÓGICA FINANCIERA (PARALELIZADA) ---

async function actualizarMercados() {
    // Definición de tareas
    const tasks = [
        fetchJSON('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd').then(data => {
            if (data) marketNodes.get('btc').textContent = fm(data.bitcoin.usd, "USD ");
        }),
        fetchJSON(`https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${CONFIG.OIL_API_KEY}`).then(data => {
            if (data?.data?.[0]) marketNodes.get('oil').textContent = `$${data.data[0].value} USD`;
        }),
        fetchJSON('https://ve.dolarapi.com/v1/dolares/oficial').then(data => {
            if (data) marketNodes.get('bcv').textContent = fm(data.promedio, "Bs. ");
        }),
        fetchJSON('https://ve.dolarapi.com/v1/dolares/cripto').then(data => {
            if (data) marketNodes.get('usdt').textContent = fm(data.promedio, "Bs. ");
        })
    ];

    // Ejecutar todas al mismo tiempo
    await Promise.allSettled(tasks);
}

// --- INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    setupUI();
    pulse(); 
    actualizarMercados(); 

    setInterval(pulse, 1000);
    setInterval(actualizarMercados, CONFIG.MARKETS_REFRESH);
});
