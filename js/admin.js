/**
 * Panel de administración para gestión de reportes
 * Solo accesible para administradores autenticados
 */

const Admin = (() => {
    let reportes = [];
    let reporteActual = null;

    const inicializar = async () => {
        console.log('📊 Inicializando panel de administración...');
        if (!Auth.estaAutenticado()) {
            Vista.mostrar('loginView');
            return;
        }
        configurarEventos();
        await cargarReportes();
    };

    const configurarEventos = () => {
        const filterStatus = document.getElementById('filterStatus');
        const filterType = document.getElementById('filterType');
        const btnCloseReportDetail = document.getElementById('btnCloseReportDetail');
        if (filterStatus) filterStatus.addEventListener('change', filtrarReportes);
        if (filterType) filterType.addEventListener('change', filtrarReportes);
        if (btnCloseReportDetail) btnCloseReportDetail.addEventListener('click', cerrarDetalleReporte);
    };

    const cargarReportes = async () => {
        try {
            reportes = await AlmacenamientoReportes.obtenerTodos();
            actualizarEstadisticas();
            mostrarReportes(reportes);
            console.log('✓ Reportes cargados desde Firestore:', reportes.length);
        } catch (error) {
            console.error('Error al cargar reportes:', error);
            reportes = [];
            actualizarEstadisticas();
            mostrarReportes([]);
            Notificaciones.mostrar('Error al cargar reportes desde Firestore', 'error');
        }
    };

    const actualizarEstadisticas = () => {
        const pendientes = reportes.filter(r => r.estado === 'pendiente').length;
        const enProceso = reportes.filter(r => r.estado === 'en_proceso').length;
        const resueltos = reportes.filter(r => r.estado === 'resuelto').length;
        const countPending = document.getElementById('countPending');
        const countProcessing = document.getElementById('countProcessing');
        const countResolved = document.getElementById('countResolved');
        if (countPending) countPending.textContent = pendientes;
        if (countProcessing) countProcessing.textContent = enProceso;
        if (countResolved) countResolved.textContent = resueltos;
    };

    const filtrarReportes = () => {
        const statusFilter = document.getElementById('filterStatus').value;
        const typeFilter = document.getElementById('filterType').value;
        let filtrados = reportes;
        if (statusFilter) filtrados = filtrados.filter(r => r.estado === statusFilter);
        if (typeFilter) filtrados = filtrados.filter(r => r.tipo === typeFilter);
        mostrarReportes(filtrados);
    };

    const mostrarReportes = (listaReportes) => {
        const tbody = document.getElementById('reportsTableBody');
        if (!tbody) return;
        if (listaReportes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay reportes</td></tr>';
            return;
        }
        tbody.innerHTML = listaReportes.map(reporte => `
            <tr>
                <td>${formatearFecha(reporte.fecha)}</td>
                <td><span class="type-badge">${obtenerEtiquetaTipo(reporte.tipo)}</span></td>
                <td>${reporte.municipio || 'N/A'}</td>
                <td>${reporte.nombre || 'Anónimo'}</td>
                <td><span class="status-badge ${reporte.estado}">${obtenerEtiquetaEstado(reporte.estado)}</span></td>
                <td><button class="btn-ver-detalles" onclick="Admin.verDetalles('${reporte.id}')">Ver Detalles</button></td>
            </tr>
        `).join('');
    };

    const verDetalles = async (reporteId) => {
        try {
            reporteActual = await AlmacenamientoReportes.obtenerPorId(reporteId);
            if (!reporteActual) {
                Notificaciones.mostrar('Reporte no encontrado', 'error');
                return;
            }
            mostrarDetalleReporte(reporteActual);
            const modal = document.getElementById('reportDetailModal');
            if (modal) modal.classList.add('active');
        } catch (error) {
            console.error('Error al obtener detalle del reporte:', error);
            Notificaciones.mostrar('Error al cargar el detalle del reporte', 'error');
        }
    };

    const mostrarDetalleReporte = (reporte) => {
        const content = document.getElementById('reportDetailContent');
        if (!content) return;
        content.innerHTML = `
            <div class="reporte-detalle">
                <div class="detalle-seccion">
                    <h3>Información del Reporte</h3>
                    <div class="detalle-info">
                        <p><strong>ID:</strong> ${reporte.id}</p>
                        <p><strong>Fecha:</strong> ${formatearFecha(reporte.fecha)}</p>
                        <p><strong>Tipo:</strong> ${obtenerEtiquetaTipo(reporte.tipo)}</p>
                        <p><strong>Municipio:</strong> ${reporte.municipio || 'N/A'}</p>
                        <p><strong>Ubicación:</strong> ${reporte.ubicacionEspecifica || 'N/A'}</p>
                        <p><strong>Descripción:</strong></p>
                        <p class="descripcion">${reporte.descripcion || ''}</p>
                    </div>
                </div>
                <div class="detalle-seccion">
                    <h3>Información del Reportante</h3>
                    <div class="detalle-info">
                        <p><strong>Nombre:</strong> ${reporte.nombre || 'Anónimo'}</p>
                        <p><strong>Teléfono:</strong> ${reporte.telefono ? `<a href="tel:${reporte.telefono}">${reporte.telefono}</a>` : 'No proporcionado'}</p>
                    </div>
                </div>
                <div class="detalle-seccion">
                    <h3>Actualizar Reporte</h3>
                    <div class="actualizar-form">
                        <div class="form-group">
                            <label>Estado</label>
                            <select id="nuevoEstado" class="form-control">
                                <option value="pendiente" ${reporte.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                                <option value="en_proceso" ${reporte.estado === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
                                <option value="resuelto" ${reporte.estado === 'resuelto' ? 'selected' : ''}>Resuelto</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button class="btn-guardar" onclick="Admin.guardarActualizacion('${reporte.id}')">Guardar Cambios</button>
                            <button class="btn-eliminar" onclick="Admin.eliminarReporte('${reporte.id}')">Eliminar Reporte</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const guardarActualizacion = async (reporteId) => {
        const estado = document.getElementById('nuevoEstado')?.value;
        if (!estado) {
            Notificaciones.mostrar('Selecciona un estado', 'error');
            return;
        }
        try {
            await AlmacenamientoReportes.actualizar(reporteId, {
                estado,
                ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            Notificaciones.mostrar('Reporte actualizado correctamente', 'success');
            await cargarReportes();
            cerrarDetalleReporte();
        } catch (error) {
            console.error('Error al actualizar reporte:', error);
            Notificaciones.mostrar('Error al guardar cambios en Firestore', 'error');
        }
    };

    const eliminarReporte = async (reporteId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.')) return;
        try {
            await AlmacenamientoReportes.eliminar(reporteId);
            Notificaciones.mostrar('Reporte eliminado correctamente', 'success');
            await cargarReportes();
            cerrarDetalleReporte();
        } catch (error) {
            console.error('Error al eliminar reporte:', error);
            Notificaciones.mostrar('Error al eliminar reporte en Firestore', 'error');
        }
    };

    const cerrarDetalleReporte = () => {
        const modal = document.getElementById('reportDetailModal');
        if (modal) modal.classList.remove('active');
        reporteActual = null;
    };

    const obtenerEtiquetaTipo = (tipo) => ({
        refugio_mal_ubicado: '📍 Refugio mal ubicado',
        refugio_inexistente: '❌ Refugio inexistente',
        informacion_incorrecta: '⚠️ Información incorrecta',
        refugio_cerrado: '🔒 Refugio cerrado',
        refugio_lleno: '👥 Refugio lleno',
        problema_acceso: '🚫 Problema de acceso',
        problema_seguridad: '🛡️ Problema seguridad',
        necesidad_suministros: '📦 Falta suministros',
        emergencia: '🚨 Emergencia',
        otro: '❓ Otro',
        prueba: '🧪 Prueba'
    }[tipo] || tipo);

    const obtenerEtiquetaEstado = (estado) => ({
        pendiente: '⏳ Pendiente',
        en_proceso: '🔄 En Proceso',
        resuelto: '✓ Resuelto'
    }[estado] || estado);

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Sin fecha';
        const valor = typeof fecha.toDate === 'function' ? fecha.toDate() : new Date(fecha);
        if (Number.isNaN(valor.getTime())) return 'Sin fecha';
        return valor.toLocaleString('es-HN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return { inicializar, verDetalles, guardarActualizacion, eliminarReporte };
})();
