/**
 * Gestión del mapa interactivo con Leaflet
 * Este módulo maneja la inicialización y control del mapa
 */

const Mapa = (() => {
    let map = null;
    let marcadores = new Map();

    /**
     * Inicializa el mapa con OpenStreetMap
     * Coordenadas centradas en Cortés, Honduras
     */
    const inicializar = () => {
        // Coordenadas de Cortés, Honduras (aproximadamente al centro del departamento)
        const coordenadas = [16.5, -88.5];
        const zoom = 9;

        // Crear el mapa
        map = L.map('map').setView(coordenadas, zoom);

        // Capa base de OpenStreetMap (estilo por defecto)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 8,
            noWrap: false
        }).addTo(map);

        console.log('✓ Mapa inicializado en Cortés, Honduras');
        console.log('  - Centro: ' + coordenadas[0] + ', ' + coordenadas[1]);
        console.log('  - Zoom: ' + zoom);
        
        return map;
    };

    /**
     * Agrega un marcador al mapa
     */
    const agregarMarcador = (refugio) => {
        if (!map) return;

        const { id, nombre, latitud, longitud, tipo, municipio, direccion } = refugio;

        // Crear marcador personalizado según tipo
        const icono = crearIcono(tipo);
        
        const marcador = L.marker([latitud, longitud], { icon: icono })
            .bindPopup(crearPopup(refugio))
            .addTo(map);

        // Agregar evento de click
        marcador.on('click', () => {
            dispatchEvent(new CustomEvent('refugioSeleccionado', { detail: refugio }));
        });

        marcadores.set(id, marcador);
        return marcador;
    };

    /**
     * Crea un icono personalizado según el tipo de refugio
     */
    const crearIcono = (tipo) => {
        const iconos = {
            'Albergue': { color: '#3498db', emoji: '🏨' },
            'Centro de Evacuación': { color: '#e74c3c', emoji: '🏢' },
            'Refugio Temporal': { color: '#f39c12', emoji: '⛺' },
            'Punto de Reunión': { color: '#27ae60', emoji: '📍' }
        };

        const config = iconos[tipo] || { color: '#95a5a6', emoji: '🛡️' };

        // Crear HTML para el icono
        const html = `
            <div style="
                background-color: ${config.color};
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                font-size: 20px;
            ">
                ${config.emoji}
            </div>
        `;

        return L.divIcon({
            html: html,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
            className: 'custom-marker-icon'
        });
    };

    /**
     * Crea el contenido del popup para un refugio
     */
    const crearPopup = (refugio) => {
        const { nombre, tipo, municipio, direccion, telefono } = refugio;
        
        let contenido = `
            <div class="popup-content">
                <h3>${nombre}</h3>
                <p><strong>Tipo:</strong> ${tipo}</p>
                <p><strong>Municipio:</strong> ${municipio}</p>
                <p><strong>Dirección:</strong> ${direccion}</p>
        `;
        
        if (telefono) {
            contenido += `<p><strong>Teléfono:</strong> <a href="tel:${telefono}">${telefono}</a></p>`;
        }
        
        contenido += '</div>';
        return contenido;
    };

    /**
     * Agrega múltiples marcadores al mapa
     */
    const agregarMarcadores = (refugios) => {
        limpiarMarcadores();
        refugios.forEach(refugio => agregarMarcador(refugio));
        console.log(`✓ ${refugios.length} marcadores agregados`);
    };

    /**
     * Limpia todos los marcadores del mapa
     */
    const limpiarMarcadores = () => {
        marcadores.forEach(marcador => map.removeLayer(marcador));
        marcadores.clear();
    };

    /**
     * Centra el mapa en un refugio específico
     */
    const centrarEn = (refugio) => {
        if (!map) return;
        map.setView([refugio.latitud, refugio.longitud], 14);
        
        // Abrir popup del marcador
        const marcador = marcadores.get(refugio.id);
        if (marcador) {
            marcador.openPopup();
        }
    };

    /**
     * Ajusta el zoom del mapa para mostrar todos los marcadores
     */
    const ajustarZoom = () => {
        if (marcadores.size === 0) return;
        
        const grupo = L.featureGroup(Array.from(marcadores.values()));
        map.fitBounds(grupo.getBounds().pad(0.1));
    };

    /**
     * Obtiene el mapa actual
     */
    const obtener = () => map;

    /**
     * Obtiene todos los marcadores
     */
    const obtenerMarcadores = () => marcadores;

    return {
        inicializar,
        agregarMarcador,
        agregarMarcadores,
        limpiarMarcadores,
        centrarEn,
        ajustarZoom,
        obtener,
        obtenerMarcadores
    };
})();