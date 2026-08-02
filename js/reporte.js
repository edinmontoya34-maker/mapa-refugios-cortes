/**
 * Gestión de reportes con Firebase Firestore y Storage
 * Este módulo maneja el almacenamiento de reportes e imágenes en Firebase
 */

const Reporte = (() => {
    // Configuración de Firebase (reemplazar con tus credenciales)
    const firebaseConfig = {
        apiKey: "TU_API_KEY_AQUI",
        authDomain: "TU_AUTH_DOMAIN_AQUI",
        projectId: "TU_PROJECT_ID_AQUI",
        storageBucket: "TU_STORAGE_BUCKET_AQUI",
        messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUI",
        appId: "TU_APP_ID_AQUI"
    };

    let db = null;
    let storage = null;
    let firebaseInitializado = false;

    // Configuración de validación de archivos
    const CONFIG = {
        FORMATOS_PERMITIDOS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        TAMAÑO_MAX_ARCHIVO: 5 * 1024 * 1024, // 5MB
        CANTIDAD_MAX_ARCHIVOS: 5
    };

    /**
     * Inicializa Firebase Firestore y Storage
     */
    const inicializarFirebase = () => {
        try {
            // Verificar si Firebase ya está inicializado
            if (firebase.apps.length === 0) {
                firebase.initializeApp(firebaseConfig);
            }
            
            // Obtener referencias
            db = firebase.firestore();
            storage = firebase.storage();
            firebaseInitializado = true;
            
            console.log('✓ Firebase Firestore y Storage inicializados correctamente');
            return true;
        } catch (error) {
            console.error('Error al inicializar Firebase:', error);
            firebaseInitializado = false;
            return false;
        }
    };

    /**
     * Valida un archivo de imagen
     */
    const validarArchivo = (archivo) => {
        // Validar formato
        if (!CONFIG.FORMATOS_PERMITIDOS.includes(archivo.type)) {
            return {
                valido: false,
                error: `Formato no permitido. Solo se aceptan: JPG, JPEG, PNG, WEBP`
            };
        }

        // Validar tamaño
        if (archivo.size > CONFIG.TAMAÑO_MAX_ARCHIVO) {
            const tamaño = (CONFIG.TAMAÑO_MAX_ARCHIVO / (1024 * 1024)).toFixed(0);
            return {
                valido: false,
                error: `El archivo "${archivo.name}" supera ${tamaño}MB`
            };
        }

        return { valido: true };
    };

    /**
     * Sube una imagen a Firebase Storage
     */
    const subirImagen = async (archivo, reporteId) => {
        return new Promise((resolve, reject) => {
            // Validar archivo
            const validacion = validarArchivo(archivo);
            if (!validacion.valido) {
                reject(new Error(validacion.error));
                return;
            }

            // Crear ruta en Storage
            const timestamp = Date.now();
            const nombreArchivo = `${timestamp}_${archivo.name}`;
            const ruta = `reportes/${reporteId}/${nombreArchivo}`;
            const reference = storage.ref(ruta);

            // Subir archivo
            reference.put(archivo)
                .then((snapshot) => {
                    console.log(`✓ Imagen subida: ${nombreArchivo}`);
                    resolve({
                        nombre: nombreArchivo,
                        ruta: ruta,
                        tamaño: snapshot.metadata.size
                    });
                })
                .catch((error) => {
                    console.error('Error al subir imagen:', error);
                    reject(new Error(`Error al subir imagen: ${error.message}`));
                });
        });
    };

    /**
     * Envía un reporte con imágenes a Firestore
     */
    const enviar = async (reporteData, archivos = []) => {
        if (!firebaseInitializado) {
            throw new Error('Firebase no está inicializado. Verifica la configuración.');
        }

        try {
            // Validar datos requeridos
            if (!reporteData.tipo || !reporteData.descripcion) {
                throw new Error('Tipo y descripción son requeridos');
            }

            // Validar cantidad de archivos
            if (archivos.length > CONFIG.CANTIDAD_MAX_ARCHIVOS) {
                throw new Error(`No puedes subir más de ${CONFIG.CANTIDAD_MAX_ARCHIVOS} imágenes`);
            }

            // Preparar datos del reporte sin imágenes
            const nuevoReporte = {
                tipo: reporteData.tipo,
                descripcion: reporteData.descripcion,
                nombre: reporteData.nombre || null,
                email: reporteData.email || null,
                refugioId: reporteData.refugioId || null,
                estado: 'pendiente',
                fecha: new Date().toISOString(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                cantidadImagenes: archivos.length,
                imagenes: []
            };

            // Guardar reporte inicialmente
            const docRef = await db.collection('reportes').add(nuevoReporte);
            const reporteId = docRef.id;

            console.log(`✓ Reporte creado con ID: ${reporteId}`);

            // Subir imágenes si existen
            let imagenesSubidas = [];
            if (archivos.length > 0) {
                try {
                    const promesasSubida = archivos.map(archivo => 
                        subirImagen(archivo, reporteId)
                    );
                    imagenesSubidas = await Promise.all(promesasSubida);
                    console.log(`✓ ${imagenesSubidas.length} imágenes subidas correctamente`);

                    // Actualizar documento con referencias de imágenes
                    await db.collection('reportes').doc(reporteId).update({
                        imagenes: imagenesSubidas
                    });
                } catch (errorImagenes) {
                    // Si falla la subida de imágenes, el reporte ya fue guardado
                    console.warn('Advertencia: Algunas imágenes no se pudieron subir:', errorImagenes.message);
                    await db.collection('reportes').doc(reporteId).update({
                        imagenes: imagenesSubidas,
                        notaErrorImagenes: errorImagenes.message
                    });
                }
            }

            return {
                exitoso: true,
                id: reporteId,
                mensaje: 'Reporte enviado correctamente',
                imagenesSubidas: imagenesSubidas.length
            };
        } catch (error) {
            console.error('Error al enviar reporte:', error);
            throw error;
        }
    };

    /**
     * Obtiene todos los reportes
     */
    const obtenerTodos = async () => {
        if (!firebaseInitializado) {
            throw new Error('Firebase no está inicializado');
        }

        try {
            const querySnapshot = await db.collection('reportes')
                .orderBy('timestamp', 'desc')
                .get();

            const reportes = [];
            querySnapshot.forEach((doc) => {
                reportes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return reportes;
        } catch (error) {
            console.error('Error al obtener reportes:', error);
            throw error;
        }
    };

    /**
     * Obtiene reportes por refugio
     */
    const obtenerPorRefugio = async (refugioId) => {
        if (!firebaseInitializado) {
            throw new Error('Firebase no está inicializado');
        }

        try {
            const querySnapshot = await db.collection('reportes')
                .where('refugioId', '==', refugioId)
                .orderBy('timestamp', 'desc')
                .get();

            const reportes = [];
            querySnapshot.forEach((doc) => {
                reportes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return reportes;
        } catch (error) {
            console.error('Error al obtener reportes:', error);
            throw error;
        }
    };

    /**
     * Obtiene estadísticas de reportes
     */
    const obtenerEstadisticas = async () => {
        if (!firebaseInitializado) {
            throw new Error('Firebase no está inicializado');
        }

        try {
            const querySnapshot = await db.collection('reportes').get();
            
            const stats = {
                total: querySnapshot.size,
                porTipo: {},
                porEstado: {},
                totalImagenes: 0
            };

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                // Contar por tipo
                if (!stats.porTipo[data.tipo]) {
                    stats.porTipo[data.tipo] = 0;
                }
                stats.porTipo[data.tipo]++;

                // Contar por estado
                if (!stats.porEstado[data.estado]) {
                    stats.porEstado[data.estado] = 0;
                }
                stats.porEstado[data.estado]++;

                // Contar total de imágenes
                if (data.imagenes && Array.isArray(data.imagenes)) {
                    stats.totalImagenes += data.imagenes.length;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    };

    return {
        inicializarFirebase,
        enviar,
        obtenerTodos,
        obtenerPorRefugio,
        obtenerEstadisticas,
        validarArchivo,
        CONFIG
    };
})();