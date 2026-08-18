/**
 * Gestión del mapa interactivo con Leaflet
 * Con zoom automático, agrupación de marcadores, iconos personalizados y animaciones
 */

const Mapa = (() => {
    let map = null;
    let marcadores = new Map();
    let clusterGroup = null;

    /**
     * Inicializa el mapa con OpenStreetMap y estilos modernos
     * Coordenadas centradas en Cortés, Honduras
     */
    const inicializar = () => {
        // Coordenadas de Cortés, Honduras (aproximadamente al centro del departamento)
        const coordenadas = [16.5, -88.5];
        const zoom = 9;

        // Crear el mapa con opciones de animación
        map = L.map('map', {
            center: coordenadas,
            zoom: zoom,
            fadeAnimation: true,
            markerZoomAnimation: true,
            zoomAnimation: true
        });

        // Capa base de OpenStreetMap con estilo moderno
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 8,
            noWrap: false,
            className: 'map-tiles'
        }).addTo(map);

        // Inicializar grupo de clustering
        clusterGroup = L.markerClusterGroup({
            maxClusterRadius: 80,
            disableClusteringAtZoom: 15,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: true,
            zoomToBoundsOnClick: true,
            iconCreateFunction: crearIconoCluster
        });

        map.addLayer(clusterGroup);

        console.log('✓ Mapa inicializado en Cortés, Honduras');
        console.log('  - Centro: ' + coordenadas[0] + ', ' + coordenadas[1]);
        console.log('  - Zoom: ' + zoom);
        console.log('  - Clustering activado');
        
        return map;
    };

    /**
     * Crea el icono para un cluster de marcadores
     */
    const crearIconoCluster = (cluster) => {
        const childCount = cluster.getChildCount();
        let c = ' marker-cluster-';
        
        if (childCount < 10) {
            c += 'small';
        } else if (childCount < 100) {
            c += 'medium';
        } else {
            c += 'large';
        }

        return new L.DivIcon({
            html: `<div><span>${childCount}</span></div>`,
            className: 'marker-cluster' + c,
            iconSize: new L.Point(40, 40)
        });
    };

    /**
     * Agrega un marcador al mapa con animación
     */
    const agregarMarcador = (refugio) => {
        if (!map) return;

        const { id, nombre, latitud, longitud, tipo, municipio, direccion } = refugio;

        // Crear marcador personalizado según tipo
        const icono = crearIcono(tipo);
        
        const marcador = L.marker([latitud, longitud], { 
            icon: icono,
            riseOnHover: true,
            title: nombre
        })
            .bindPopup(crearPopup(refugio), {
                maxWidth: 300,
                className: 'popup-moderno'
            });

        // Agregar evento de click con animación
        marcador.on('click', () => {
            // Animar marcador
            animarMarcador(marcador);
            dispatchEvent(new CustomEvent('refugioSeleccionado', { detail: refugio }));
        });

        // Agregar hover effect
        marcador.on('mouseover', function() {
            this.setOpacity(0.8);
        });
        marcador.on('mouseout', function() {
            this.setOpacity(1);
        });

        // Agregar al cluster group en lugar de directamente al mapa
        clusterGroup.addLayer(marcador);
        marcadores.set(id, marcador);
        
        return marcador;
    };

    /**
     * Anima un marcador cuando se selecciona
     */
    const animarMarcador = (marcador) => {
        const icon = marcador.getElement();
        if (icon) {
            icon.style.animation = 'none';
            setTimeout(() => {
                icon.style.animation = 'pulse 0.6s ease-in-out';
            }, 10);
        }
    };

    /**
     * Crea un icono personalizado según el tipo de refugio
     */
    const crearIcono = (tipo) => {
        const iconos = {
            'Albergue': { color: '#3498db', emoji: '🏨', nombre: 'albergue' },
            'Centro de Evacuación': { color: '#e74c3c', emoji: '🏢', nombre: 'evacuacion' },
            'Refugio Temporal': { color: '#f39c12', emoji: '⛺', nombre: 'temporal' },
            'Punto de Reunión': { color: '#27ae60', emoji: '📍', nombre: 'reunion' }
        };

        const config = iconos[tipo] || { color: '#95a5a6', emoji: '🛡️', nombre: 'default' };

        // Crear HTML para el icono con efecto de sombra
        const html = `
            <div class="custom-marker ${config.nombre}" style="
                background: linear-gradient(135deg, ${config.color} 0%, ${oscurecerColor(config.color)} 100%);
                width: 45px;
                height: 45px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
                font-size: 22px;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
            ">
                <span style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));">${config.emoji}</span>
                <div style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 2px solid ${config.color};
                    opacity: 0;
                    animation: ripple 2s infinite;
                "></div>
            </div>
        `;

        return L.divIcon({
            html: html,
            iconSize: [45, 45],
            iconAnchor: [22.5, 22.5],
            popupAnchor: [0, -25],
            className: 'custom-marker-icon'
        });
    };

    /**
     * Oscurece un color hexadecimal para el gradiente
     */
    const oscurecerColor = (color) => {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = 20;
        const usePound = true;
        
        const R = (num >> 16) & 255;
        const G = (num >> 8) & 255;
        const B = num & 255;
        
        const dark = ((R - amt) << 16) | ((G - amt) << 8) | (B - amt);
        return (usePound ? "#" : "") + dark.toString(16).padStart(6, '0');
    };

    /**
     * Crea el contenido del popup para un refugio con diseño moderno
     */
    const crearPopup = (refugio) => {
        const { nombre, tipo, municipio, direccion, telefono } = refugio;
        
        let contenido = `
            <div class="popup-content" style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 12px;
                border-radius: 8px;
                background: white;
            ">
                <h3 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 16px;">${nombre}</h3>
                <div style="border-left: 3px solid #3498db; padding-left: 10px; margin: 8px 0;">
                    <p style="margin: 4px 0; color: #555; font-size: 13px;"><strong>Tipo:</strong> ${tipo}</p>
                    <p style="margin: 4px 0; color: #555; font-size: 13px;"><strong>Municipio:</strong> ${municipio}</p>
                    <p style="margin: 4px 0; color: #555; font-size: 13px;"><strong>Dirección:</strong> ${direccion}</p>
        `;
        
        if (telefono) {
            contenido += `<p style="margin: 4px 0; color: #555; font-size: 13px;"><strong>Teléfono:</strong> <a href="tel:${telefono}" style="color: #3498db; text-decoration: none;">${telefono}</a></p>`;
        }
        
        contenido += `
                </div>
            </div>
        `;
        return contenido;
    };

    /**
     * Agrega múltiples marcadores al mapa
     */
    const agregarMarcadores = (refugios) => {
        if (!clusterGroup || !map) {
            console.warn('⚠️ No se pueden agregar marcadores porque el mapa no está disponible');
            return;
        }

        limpiarMarcadores();
        refugios.forEach((refugio, index) => {
            // Animar la adición de marcadores
            setTimeout(() => {
                agregarMarcador(refugio);
            }, index * 50);
        });
        console.log(`✓ ${refugios.length} marcadores agregados`);
    };

    /**
     * Limpia todos los marcadores del mapa
     */
    const limpiarMarcadores = () => {
        if (!clusterGroup) {
            marcadores.clear();
            return;
        }

        clusterGroup.clearLayers();
        marcadores.clear();
    };

    /**
     * Centra el mapa en un refugio específico con animación suave
     */
    const centrarEn = (refugio) => {
        if (!map) return;
        
        // Zoom suave con animación
        map.flyTo([refugio.latitud, refugio.longitud], 15, {
            duration: 1.5,
            easeLinearity: 0.25
        });
        
        // Abrir popup del marcador
        const marcador = marcadores.get(refugio.id);
        if (marcador) {
            // Esperar a que termine la animación de zoom
            setTimeout(() => {
                marcador.openPopup();
            }, 1500);
        }
    };

    /**
     * Ajusta el zoom del mapa para mostrar todos los marcadores con animación
     */
    const ajustarZoom = () => {
        if (!map || !clusterGroup || marcadores.size === 0) return;
        
        const bounds = clusterGroup.getBounds();
        if (bounds.isValid()) {
            map.flyToBounds(bounds, {
                padding: [50, 50],
                duration: 1.2,
                easeLinearity: 0.25,
                maxZoom: 13
            });
        }
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