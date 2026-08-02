/**
 * Gestión de datos de refugios
 * Este módulo maneja la carga, almacenamiento y manipulación de datos de refugios
 */

const Refugios = (() => {
    let refugios = [];

    /**
     * Carga los datos de refugios desde el archivo JSON
     */
    const cargar = async () => {
        try {
            const respuesta = await fetch('data/refugios.json');
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            refugios = await respuesta.json();
            console.log(`✓ ${refugios.length} refugios cargados exitosamente`);
            return refugios;
        } catch (error) {
            console.error('Error al cargar refugios:', error);
            return [];
        }
    };

    /**
     * Obtiene todos los refugios
     */
    const obtener = () => refugios;

    /**
     * Obtiene un refugio por su ID
     */
    const obtenerPorId = (id) => {
        return refugios.find(r => r.id === id);
    };

    /**
     * Busca refugios por nombre
     */
    const buscar = (termino) => {
        if (!termino.trim()) return refugios;
        
        const terminoLower = termino.toLowerCase();
        return refugios.filter(r => 
            r.nombre.toLowerCase().includes(terminoLower) ||
            r.municipio.toLowerCase().includes(terminoLower)
        );
    };

    /**
     * Obtiene todos los municipios con refugios
     */
    const obtenerMunicipios = () => {
        return [...new Set(refugios.map(r => r.municipio))].sort();
    };

    return {
        cargar,
        obtener,
        obtenerPorId,
        buscar,
        obtenerMunicipios
    };
})();