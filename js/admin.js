/**
 * Panel de administración para gestión de reportes
 * Solo accesible para administradores autenticados
 */

const Admin = (() => {
    let reportes = [];
    let reporteActual = null;

    /**
     * Inicializa el panel de administración
     */
    const inicializar = () => {
        console.log('📊 Inicializando panel de administración...');
        
        // Verificar autenticación
        if (!Auth.estaAutenticado()) {
            Vista.mostrar('loginView');
            return;
        }

        configurarEventos();
        cargarReportes();
    };

    /**
     * Configura los eventos del panel
     */
    const configurarEventos = () => {
        const filterStatus = document.getElementById('filterStatus');
        const filterType = document.getElementById('filterType');
        const btnCloseReportDetail = document.getElementById('btnCloseReportDetail');

        if (filterStatus) {
            filterStatus.addEventListener('change', () => {
                filtrarReportes();
            });
        }

        if (filterType) {
            filterType.addEventListener('change', () => {
                filtrarReportes();
            });
        }

        if (btnCloseReportDetail) {
            btnCloseReportDetail.addEventListener('click', () => {
                cerrarDetalleReporte();
            });
        }
    };

    /**
     * Carga todos los reportes
     */
    const cargarReportes = () => {
        try {
            reportes = AlmacenamientoReportes.obtenerTodos();
            actualizarEstadisticas();
            mostrarReportes(reportes);
            console.log('✓ Reportes cargados:', reportes.length);
        } catch (error) {
            console.error('Error al cargar reportes:', error);
            Notificaciones.mostrar('Error al cargar reportes', 'error');
        }
    };

    /**
     * Actualiza los contadores
     */
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

    /**
     * Filtra reportes
     */
    const filtrarReportes = () => {
        const statusFilter = document.getElementById('filterStatus').value;
        const typeFilter = document.getElementById('filterType').value;

        let reportesFiltrados = reportes;

        if (statusFilter) {
            reportesFiltrados = reportesFiltrados.filter(r => r.estado === statusFilter);
        }

        if (typeFilter) {
            reportesFiltrados = reportesFiltrados.filter(r => r.tipo === typeFilter);
        }

        mostrarReportes(reportesFiltrados);
    };

    /**
     * Muestra los reportes en la tabla
     */
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
                <td>${reporte.municipio}</td>
                <td>${reporte.nombre || 'Anónimo'}</td>
                <td><span class="status-badge ${reporte.estado}">${obtenerEtiquetaEstado(reporte.estado)}</span></td>
                <td><button class="btn-ver-detalles" onclick="Admin.verDetalles('${reporte.id}')">Ver Detalles</button></td>
            </tr>
        `).join('');
    };

    /**
     * Abre los detalles de un reporte
     */
    const verDetalles = (reporteId) => {
        reporteActual = AlmacenamientoReportes.obtenerPorId(reporteId);
        
        if (!reporteActual) {
            Notificaciones.mostrar('Reporte no encontrado', 'error');
            return;
        }

        mostrarDetalleReporte(reporteActual);
        
        const modal = document.getElementById('reportDetailModal');
        if (modal) {
            modal.classList.add('active');
        }
    };

    /**
     * Muestra el contenido del modal de detalles
     */
    const mostrarDetalleReporte = (reporte) => {
        const content = document.getElementById('reportDetailContent');
        
        content.innerHTML = `
            <div class="reporte-detalle">
                <div class="detalle-seccion">
                    <h3>Información del Reporte</h3>
                    <div class="detalle-info">
                        <p><strong>ID:</strong> ${reporte.id}</p>
                        <p><strong>Fecha:</strong> ${formatearFecha(reporte.fecha)}</p>
                        <p><strong>Tipo:</strong> ${obtenerEtiquetaTipo(reporte.tipo)}</p>
                        <p><strong>Municipio:</strong> ${reporte.municipio}</p>
                        <p><strong>Ubicación:</strong> ${reporte.ubicacionEspecifica}</p>
                        <p><strong>Descripción:</strong></p>
                        <p class="descripcion">${reporte.descripcion}</p>
                    </div>
                </div>

                <div class="detalle-seccion">
                    <h3>Información del Reportante</h3>
                    <div class="detalle-info">
                        <p><strong>Nombre:</strong> ${reporte.nombre || 'Anónimo'}</p>
                        <p><strong>Teléfono:</strong> 
                            ${reporte.telefono ? `<a href="tel:${reporte.telefono}">${reporte.telefono}</a>` : 'No proporcionado'}
                        </p>
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

    /**
     * Guarda actualizaciones
     */
    const guardarActualizacion = (reporteId) => {
        const nuevoEstado = document.getElementById('nuevoEstado').value;

        if (!nuevoEstado) {
            Notificaciones.mostrar('Selecciona un estado', 'error');
            return;
        }

        try {
            AlmacenamientoReportes.actualizar(reporteId, {
                estado: nuevoEstado,
                ultimaActualizacion: new Date().toISOString()
            });

            Notificaciones.mostrar('Reporte actualizado correctamente', 'success');
            cargarReportes();
            cerrarDetalleReporte();

        } catch (error) {
            console.error('Error al guardar actualización:', error);
            Notificaciones.mostrar('Error al guardar cambios', 'error');
        }
    };

    /**
     * Elimina un reporte
     */
    const eliminarReporte = (reporteId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            AlmacenamientoReportes.eliminar(reporteId);
            Notificaciones.mostrar('Reporte eliminado correctamente', 'success');
            cargarReportes();
            cerrarDetalleReporte();
        } catch (error) {
            console.error('Error al eliminar reporte:', error);
            Notificaciones.mostrar('Error al eliminar reporte', 'error');
        }
    };

    /**
     * Cierra el modal
     */
    const cerrarDetalleReporte = () => {
        const modal = document.getElementById('reportDetailModal');
        if (modal) {
            modal.classList.remove('active');
        }
        reporteActual = null;
    };

    /**
     * Obtiene etiqueta de tipo
     */
    const obtenerEtiquetaTipo = (tipo) => {
        const tipos = {
            refugio_mal_ubicado: '📍 Refugio mal ubicado',
            refugio_inexistente: '❌ Refugio inexistente',
            informacion_incorrecta: '⚠️ Información incorrecta',
            refugio_cerrado: '🔒 Refugio cerrado',
            refugio_lleno: '👥 Refugio lleno',
            problema_acceso: '🚫 Problema de acceso',
            problema_seguridad: '🛡️ Problema de seguridad',
            necesidad_suministros: '📦 Necesidad de suministros',
            emergencia: '🚨 Emergencia',
            otro: '❓ Otro'
        };
        return tipos[tipo] || tipo;
    };

    /**
     * Obtiene etiqueta de estado
     */
    const obtenerEtiquetaEstado = (estado) => {
        const estados = {
            pendiente: '⏳ Pendiente',
            en_proceso: '🔄 En Proceso',
            resuelto: '✓ Resuelto'
        };
        return estados[estado] || estado;
    };

    /**
     * Formatea fecha
     */
    const formatearFecha = (fecha) => {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleString('es-HN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return {
        inicializar,
        verDetalles,
        guardarActualizacion,
        eliminarReporte
    };
})();