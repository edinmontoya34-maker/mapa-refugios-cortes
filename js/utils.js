/**
 * Módulo de utilidades para gestionar vistas
 * Controla qué vista se muestra en pantalla
 */

const Vista = {
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
     * Muestra una notificación
     */
    mostrar: function(mensaje, tipo = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = mensaje;
        toast.className = `toast ${tipo} active`;

        // Remover después de 4 segundos
        setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
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