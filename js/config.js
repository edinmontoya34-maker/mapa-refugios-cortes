/**
 * Módulo de configuración
 * Almacena constantes y configuraciones globales
 */

const CONFIG = {
    APP_NAME: 'Mapa de Refugios de Cortés',
    VERSION: '2.0.0',

    MAP: {
        CENTER: [15.5, -88.0],
        ZOOM: 10,
        MIN_ZOOM: 8,
        MAX_ZOOM: 18
    },

    STORAGE: {
        REPORTES_KEY: 'reportes_refugios_cortes',
        SESSION_KEY: 'sesionAdmin',
        REFUGIOS_KEY: 'refugios_cache'
    },

    FIREBASE: {
        apiKey: 'AIzaSyASry2xG3DBvjRVtrHZCFmTAqi0Zkajyto',
        authDomain: 'mapa-refugios-cortes.firebaseapp.com',
        projectId: 'mapa-refugios-cortes',
        storageBucket: 'mapa-refugios-cortes.firebasestorage.app',
        messagingSenderId: '995803716744',
        appId: '1:995803716744:web:42233c87f27c335b19533d',
        measurementId: 'G-23HCHXNWQT'
    },

    ADMIN_EMAIL: 'edinmontoya34@gmail.com',

    REPORT_TYPES: {
        refugio_mal_ubicado: '📍 Refugio mal ubicado',
        refugio_inexistente: '❌ Refugio inexistente',
        informacion_incorrecta: '⚠️ Información incorrecta',
        refugio_cerrado: '🔒 Refugio cerrado',
        refugio_lleno: '👥 Refugio lleno',
        problema_acceso: '🚫 Problema de acceso',
        problema_seguridad: '🛡️ Problema de seguridad',
        necesidad_suministros: '📦 Necesidad de suministros',
        emergencia: '🚨 Emergencia',
        otro: '❓ Otro'
    },

    REPORT_STATUS: {
        pendiente: '⏳ Pendiente',
        en_proceso: '🔄 En Proceso',
        resuelto: '✓ Resuelto'
    },

    MUNICIPALITIES: [
        'San Pedro Sula',
        'Choloma',
        'Puerto Cortés',
        'La Lima',
        'Villanueva',
        'Potrerillos',
        'Pimienta',
        'San Manuel',
        'Omoa',
        'Baracoa',
        'San Antonio de Cortés'
    ]
};

/** Carga los SDK compat de Firebase sin exponer secretos privados. */
CONFIG.firebaseReady = (() => {
    const scripts = [
        'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
        'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
    ];

    const cargarScript = (src) => new Promise((resolve, reject) => {
        const existente = document.querySelector(`script[src="${src}"]`);
        if (existente) {
            existente.addEventListener('load', resolve, { once: true });
            if (window.firebase) resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`No se pudo cargar Firebase: ${src}`));
        document.head.appendChild(script);
    });

    return scripts.reduce((promesa, src) => promesa.then(() => cargarScript(src)), Promise.resolve())
        .then(() => {
            if (!firebase.apps.length) firebase.initializeApp(CONFIG.FIREBASE);
            return firebase;
        });
})();
