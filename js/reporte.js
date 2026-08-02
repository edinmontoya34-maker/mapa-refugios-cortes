/**
 * Gestión de reportes con Firebase Firestore
 * Este módulo maneja el almacenamiento de reportes en la base de datos
 */

const Reporte = (() => {
    // Configuración de Firebase (se debe reemplazar con tus credenciales)
    const firebaseConfig = {
        apiKey: "TU_API_KEY_AQUI",
        authDomain: "TU_AUTH_DOMAIN_AQUI",
        projectId: "TU_PROJECT_ID_AQUI",
        storageBucket: "TU_STORAGE_BUCKET_AQUI",
        messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUI",
        appId: "TU_APP_ID_AQUI"
    };

    let db = null;

    /**
     * Inicializa Firebase Firestore
     */
    const inicializarFirebase = () => {
        try {
            // Inicializar Firebase
            firebase.initializeApp(firebaseConfig);
            
            // Obtener referencia a Firestore
            db = firebase.firestore();
            
            console.log('✓ Firebase Firestore inicializado correctamente');
            return true;
        } catch (error) {
            console.error('Error al inicializar Firebase:', error);
            return false;
        }
    };

    /**
     * Envía un reporte a Firestore
     */
    const enviar = async (reporteData) => {
        if (!db) {
            console.error('Firebase no está inicializado');
            throw new Error('Firebase no está disponible');
        }

        try {
            // Validar datos requeridos
            if (!reporteData.tipo || !reporteData.descripcion) {
                throw new Error('Tipo y descripción son requeridos');
            }

            // Preparar datos del reporte
            const nuevoReporte = {
                refugioId: reporteData.refugioId || null,
                tipo: reporteData.tipo,
                descripcion: reporteData.descripcion,
                nombre: reporteData.nombre || null,
                email: reporteData.email || null,
                fecha: new Date(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                estado: 'pendiente'
            };

            // Guardar en Firestore
            const docRef = await db.collection('reportes').add(nuevoReporte);
            
            console.log('✓ Reporte guardado con ID:', docRef.id);
            
            return {
                exitoso: true,
                id: docRef.id,
                mensaje: 'Reporte enviado correctamente'
            };
        } catch (error) {
            console.error('Error al enviar reporte:', error);
            throw error;
        }
    };

    /**
     * Obtiene todos los reportes (solo para administración)
     */
    const obtenerTodos = async () => {
        if (!db) {
            console.error('Firebase no está inicializado');
            throw new Error('Firebase no está disponible');
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
        if (!db) {
            console.error('Firebase no está inicializado');
            throw new Error('Firebase no está disponible');
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
        if (!db) {
            console.error('Firebase no está inicializado');
            throw new Error('Firebase no está disponible');
        }

        try {
            const querySnapshot = await db.collection('reportes').get();
            
            const stats = {
                total: querySnapshot.size,
                porTipo: {},
                porEstado: {}
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
        obtenerEstadisticas
    };
})();