/**
 * Módulo de configuración
 * Almacena constantes y configuraciones globales
 */

const CONFIG = {
    APP_NAME: 'Mapa de Refugios de Cortés',
    VERSION: '2.0.0',
    
    // Configuración de mapas
    MAP: {
        CENTER: [15.5, -88.0],
        ZOOM: 10,
        MIN_ZOOM: 8,
        MAX_ZOOM: 18
    },

    // Configuración de almacenamiento
    STORAGE: {
        REPORTES_KEY: 'reportes_refugios_cortes',
        SESSION_KEY: 'sesionAdmin',
        REFUGIOS_KEY: 'refugios_cache'
    },

    // Tipos de reporte
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

    // Estados de reporte
    REPORT_STATUS: {
        pendiente: '⏳ Pendiente',
        en_proceso: '🔄 En Proceso',
        resuelto: '✓ Resuelto'
    },

    // Municipios de Cortés
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