/**
 * Controlador principal de la aplicación
 * Orquesta la interacción entre el mapa y los datos de refugios
 */

const App = (() => {
    let refugiosActuales = [];

    /**
     * Inicializa la aplicación
     */
    const inicializar = async () => {
        console.log('🚀 Iniciando aplicación...');
        
        try {
            // Inicializar mapa
            Mapa.inicializar();
            
            // Cargar refugios
            await Refugios.cargar();
            refugiosActuales = Refugios.obtener();
            
            // Mostrar refugios en el mapa
            Mapa.agregarMarcadores(refugiosActuales);
            Mapa.ajustarZoom();
            
            // Renderizar lista de refugios
            renderizarLista(refugiosActuales);
            
            // Configurar eventos
            configurarEventos();
            
            console.log('✓ Aplicación lista');
        } catch (error) {
            console.error('Error al inicializar aplicación:', error);
            mostrarError('Error al cargar la aplicación');
        }
    };

    /**
     * Configura los eventos de la aplicación
     */
    const configurarEventos = () => {
        const searchInput = document.getElementById('searchInput');
        const refugiosList = document.getElementById('refugiosList');
        const reportButton = document.getElementById('reportButton');

        // Evento de búsqueda
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const termino = e.target.value;
                buscar(termino);
            });
        }

        // Evento de clic en elemento de refugio
        if (refugiosList) {
            refugiosList.addEventListener('click', (e) => {
                const item = e.target.closest('.refugio-item');
                if (item) {
                    const id = parseInt(item.dataset.id);
                    const refugio = Refugios.obtenerPorId(id);
                    if (refugio) {
                        seleccionarRefugio(refugio);
                    }
                }
            });
        }

        // Evento de botón de reporte
        if (reportButton) {
            reportButton.addEventListener('click', () => {
                abrirFormularioReporte();
            });
        }

        // Evento personalizado de refugio seleccionado desde el mapa
        window.addEventListener('refugioSeleccionado', (e) => {
            seleccionarRefugio(e.detail);
        });
    };

    /**
     * Realiza la búsqueda de refugios
     */
    const buscar = (termino) => {
        refugiosActuales = Refugios.buscar(termino);
        Mapa.agregarMarcadores(refugiosActuales);
        renderizarLista(refugiosActuales);
        
        if (refugiosActuales.length > 0) {
            Mapa.ajustarZoom();
        }
    };

    /**
     * Selecciona un refugio y lo muestra en el mapa
     */
    const seleccionarRefugio = (refugio) => {
        // Centrar mapa en refugio
        Mapa.centrarEn(refugio);
        
        // Actualizar lista visual
        const items = document.querySelectorAll('.refugio-item');
        items.forEach(item => {
            if (parseInt(item.dataset.id) === refugio.id) {
                item.classList.add('active');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    };

    /**
     * Renderiza la lista de refugios en el sidebar
     */
    const renderizarLista = (refugios) => {
        const lista = document.getElementById('refugiosList');
        const contador = document.getElementById('refugiosCount');

        if (!lista) return;

        // Actualizar contador
        if (contador) {
            contador.textContent = refugios.length;
        }

        // Lista vacía
        if (refugios.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <h3>No se encontraron refugios</h3>
                    <p>Intenta con otro término de búsqueda</p>
                </div>
            `;
            return;
        }

        // Renderizar items
        lista.innerHTML = refugios.map(refugio => `
            <div class="refugio-item" data-id="${refugio.id}">
                <h3>${refugio.nombre}</h3>
                <p><strong>Municipio:</strong> ${refugio.municipio}</p>
                <p><strong>Dirección:</strong> ${refugio.direccion}</p>
            </div>
        `).join('');
    };

    /**
     * Abre el formulario de reporte
     */
    const abrirFormularioReporte = () => {
        alert('Formulario de reporte - Esta funcionalidad se implementará próximamente');
        console.log('Abriendo formulario de reporte...');
    };

    /**
     * Muestra un mensaje de error
     */
    const mostrarError = (mensaje) => {
        const lista = document.getElementById('refugiosList');
        if (lista) {
            lista.innerHTML = `
                <div class="empty-state">
                    <h3>Error</h3>
                    <p>${mensaje}</p>
                </div>
            `;
        }
    };

    return {
        inicializar
    };
})();

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.inicializar());
} else {
    App.inicializar();
}