/**
 * Configuración centralizada de Firebase
 * Contiene las credenciales y referencias globales
 */

const FirebaseConfig = {
    // IMPORTANTE: Reemplaza estos valores con tus credenciales de Firebase
    config: {
        apiKey: "TU_API_KEY_AQUI",
        authDomain: "TU_AUTH_DOMAIN_AQUI",
        projectId: "TU_PROJECT_ID_AQUI",
        storageBucket: "TU_STORAGE_BUCKET_AQUI",
        messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUI",
        appId: "TU_APP_ID_AQUI"
    },

    db: null,
    storage: null,
    auth: null,

    /**
     * Inicializa Firebase
     */
    initialize: function() {
        try {
            // Verificar si ya está inicializado
            if (firebase.apps.length === 0) {
                firebase.initializeApp(this.config);
            }

            this.db = firebase.firestore();
            this.storage = firebase.storage();
            this.auth = firebase.auth();

            console.log('✓ Firebase inicializado correctamente');
            return true;
        } catch (error) {
            console.error('Error al inicializar Firebase:', error);
            return false;
        }
    },

    /**
     * Obtiene la referencia a Firestore
     */
    getDB: function() {
        return this.db;
    },

    /**
     * Obtiene la referencia a Storage
     */
    getStorage: function() {
        return this.storage;
    },

    /**
     * Obtiene la referencia a Auth
     */
    getAuth: function() {
        return this.auth;
    }
};

// Inicializar cuando esté disponible Firebase
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => FirebaseConfig.initialize(), 100);
    });
} else {
    setTimeout(() => FirebaseConfig.initialize(), 100);
}