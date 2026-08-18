/**
 * Módulo de utilidades para gestionar vistas
 * Controla qué vista se muestra en pantalla
 */

const Vista = {
    /**
     * Inicializa el módulo de vistas
     */
    inicializar: function() {
        console.log('📺 Inicializando módulo de vistas...');
    },

    /**
     * Muestra una vista y oculta las demás
     */
    mostrar: function(nombreVista) {
        // Ocultar todas las vistas
        const vistas = document.querySelectorAll('.view');
        vistas.forEach(vista => {
            vista.classList.remove('active');
        });

        // Mostrar la vista solicitada
        const vista = document.getElementById(nombreVista);
        if (vista) {
            vista.classList.add('active');
            console.log('📺 Vista mostrada:', nombreVista);
        } else {
            console.error('Vista no encontrada:', nombreVista);
        }
    }
};

/**
 * Módulo de notificaciones
 * Muestra toasts con mensajes al usuario
 */

const Notificaciones = {
    /**
     * Inicializa el módulo
     */
    inicializar: function() {
        console.log('🔔 Inicializando módulo de notificaciones...');
    },

    /**
     * Muestra una notificación
     */
    mostrar: function(mensaje, tipo = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.warn('Elemento toast no encontrado');
            return;
        }

        toast.textContent = mensaje;
        toast.className = `toast ${tipo} active`;

        // Remover después de 4 segundos
        setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);

        console.log(`🔔 ${tipo.toUpperCase()}: ${mensaje}`);
    }
};

/**
 * Módulo de datos para municipios por departamento
 */

const Datos = {
    municipios: {
        cortes: [
            'San Pedro Sula',
            'Choloma',
            'Puerto Cortés',
            'La Lima',
            'Villanueva',
            'Potrerillos',
            'Pimienta',
            'San Manuel',
            'Omoa',
            'Baracoa'
        ]
    },

    /**
     * Obtiene municipios de un departamento
     */
    obtenerMunicipios: function(departamento) {
        return this.municipios[departamento] || [];
    }
};

/**
 * Sistema de almacenamiento de reportes en localStorage
 */

const AlmacenamientoReportes = {
    /**
     * Clave de almacenamiento
     */
    clave: 'reportes_refugios_cortes',

    /**
     * Obtiene todos los reportes
     */
    obtenerTodos: function() {
        try {
            const datos = localStorage.getItem(this.clave);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al obtener reportes:', error);
            return [];
        }
    },

    /**
     * Guarda un nuevo reporte
     */
    guardar: function(reporte) {
        try {
            const reportes = this.obtenerTodos();
            reporte.id = Date.now().toString();
            reporte.fecha = new Date().toISOString();
            reportes.push(reporte);
            localStorage.setItem(this.clave, JSON.stringify(reportes));
            console.log('✓ Reporte guardado:', reporte.id);
            return reporte.id;
        } catch (error) {
            console.error('Error al guardar reporte:', error);
            throw error;
        }
    },

    /**
     * Obtiene un reporte por ID
     */
    obtenerPorId: function(id) {
        const reportes = this.obtenerTodos();
        return reportes.find(r => r.id === id);
    },

    /**
     * Actualiza un reporte
     */
    actualizar: function(id, datos) {
        try {
            const reportes = this.obtenerTodos();
            const index = reportes.findIndex(r => r.id === id);
            if (index >= 0) {
                reportes[index] = { ...reportes[index], ...datos };
                localStorage.setItem(this.clave, JSON.stringify(reportes));
                console.log('✓ Reporte actualizado:', id);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al actualizar reporte:', error);
            throw error;
        }
    },

    /**
     * Elimina un reporte (solo para admin)
     */
    eliminar: function(id) {
        try {
            const reportes = this.obtenerTodos();
            const filtrados = reportes.filter(r => r.id !== id);
            localStorage.setItem(this.clave, JSON.stringify(filtrados));
            console.log('✓ Reporte eliminado:', id);
            return true;
        } catch (error) {
            console.error('Error al eliminar reporte:', error);
            throw error;
        }
    },

    /**
     * Exporta todos los reportes como JSON
     */
    exportar: function() {
        const reportes = this.obtenerTodos();
        return JSON.stringify(reportes, null, 2);
    }
};