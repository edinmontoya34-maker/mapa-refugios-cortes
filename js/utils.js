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

    obtenerFirestore() {
        if (!window.firebase || !firebase.firestore) {
            throw new Error('Firestore no está disponible');
        }
        return firebase.firestore();
    },

    normalizarFecha(fecha) {
        if (!fecha) return 0;
        if (typeof fecha.toMillis === 'function') return fecha.toMillis();
        const milisegundos = Date.parse(fecha);
        return Number.isNaN(milisegundos) ? 0 : milisegundos;
    },

    async obtenerTodos() {
        await CONFIG.firebaseReady;
        const snapshot = await this.obtenerFirestore()
            .collection(this.coleccion)
            .get();

        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => this.normalizarFecha(b.fecha) - this.normalizarFecha(a.fecha));
    },

    async guardar(reporte) {
        await CONFIG.firebaseReady;
        const referencia = await this.obtenerFirestore().collection(this.coleccion).add({
            tipo: reporte.tipo || 'otro',
            descripcion: reporte.descripcion || '',
            estado: 'pendiente',
            municipio: reporte.municipio || '',
            ubicacionEspecifica: reporte.ubicacionEspecifica || '',
            nombre: reporte.nombre || '',
            telefono: reporte.telefono || '',
            tipoReporte: reporte.tipoReporte || 'ciudadano',
            fecha: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✓ Reporte guardado en Firestore:', referencia.id);
        return referencia.id;
    },

    async obtenerPorId(id) {
        await CONFIG.firebaseReady;
        const doc = await this.obtenerFirestore().collection(this.coleccion).doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async actualizar(id, datos) {
        await CONFIG.firebaseReady;
        await this.obtenerFirestore().collection(this.coleccion).doc(id).update(datos);
        return true;
    },

    async eliminar(id) {
        await CONFIG.firebaseReady;
        await this.obtenerFirestore().collection(this.coleccion).doc(id).delete();
        return true;
    },

    async exportar() {
        return JSON.stringify(await this.obtenerTodos(), null, 2);
    }
};
