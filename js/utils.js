/**
 * Utilidades de aplicación y almacenamiento compartido de reportes en Firestore.
 */

const Vista = {
    inicializar: function() {
        const vistas = document.querySelectorAll('.view');
        vistas.forEach(vista => {
            vista.style.height = '100%';
            vista.style.display = vista.classList.contains('active') ? 'block' : 'none';
        });
        if (!document.querySelector('.view.active')) this.mostrar('mapView');
    },
    mostrar: function(nombreVista) {
        const vistaSolicitada = document.getElementById(nombreVista);
        if (!vistaSolicitada) return false;
        document.querySelectorAll('.view').forEach(vista => {
            const activa = vista === vistaSolicitada;
            vista.classList.toggle('active', activa);
            vista.style.height = '100%';
            vista.style.display = activa ? 'block' : 'none';
        });
        return true;
    }
};

const Notificaciones = {
    inicializar: function() {},
    mostrar: function(mensaje, tipo = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = mensaje;
        toast.className = `toast ${tipo} active`;
        setTimeout(() => toast.classList.remove('active'), 4000);
        console.log(`${tipo.toUpperCase()}: ${mensaje}`);
    }
};

const Datos = {
    municipios: {
        cortes: [
            'San Pedro Sula', 'Choloma', 'Puerto Cortés', 'La Lima', 'Villanueva',
            'Potrerillos', 'Pimienta', 'San Manuel', 'Omoa', 'Baracoa'
        ]
    },
    obtenerMunicipios: function(departamento) { return this.municipios[departamento] || []; }
};

const AlmacenamientoReportes = {
    coleccion: 'reportes',

    async obtenerTodos() {
        await CONFIG.firebaseReady;
        const snapshot = await firebase.firestore()
            .collection(this.coleccion)
            .orderBy('fecha', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async guardar(reporte) {
        await CONFIG.firebaseReady;
        const referencia = await firebase.firestore().collection(this.coleccion).add({
            ...reporte,
            fecha: new Date().toISOString()
        });
        console.log('✓ Reporte guardado en Firestore:', referencia.id);
        return referencia.id;
    },

    async obtenerPorId(id) {
        await CONFIG.firebaseReady;
        const doc = await firebase.firestore().collection(this.coleccion).doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async actualizar(id, datos) {
        await CONFIG.firebaseReady;
        await firebase.firestore().collection(this.coleccion).doc(id).update(datos);
        return true;
    },

    async eliminar(id) {
        await CONFIG.firebaseReady;
        await firebase.firestore().collection(this.coleccion).doc(id).delete();
        return true;
    },

    async exportar() {
        return JSON.stringify(await this.obtenerTodos(), null, 2);
    }
};
