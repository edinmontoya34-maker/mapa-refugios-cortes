/**
 * Panel de administración para gestión de reportes de emergencia
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
     * Carga todos los reportes de Firestore
     */
    const cargarReportes = async () => {
        try {
            const db = FirebaseConfig.getDB();
            const snapshot = await db.collection('reportes_emergencia')
                .orderBy('timestamp', 'desc')
                .get();

            reportes = [];
            snapshot.forEach(doc => {
                reportes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            actualizarEstadisticas();
            mostrarReportes(reportes);

            console.log('✓ Reportes cargados:', reportes.length);

        } catch (error) {
            console.error('Error al cargar reportes:', error);
            Notificaciones.mostrar('Error al cargar reportes', 'error');
        }
    };

    /**
     * Actualiza los contadores de estadísticas
     */
    const actualizarEstadisticas = () => {
        const pendientes = reportes.filter(r => r.estado === 'pendiente').length;
        const enProceso = reportes.filter(r => r.estado === 'en_proceso').length;
        const resueltos = reportes.filter(r => r.estado === 'resuelto').length;

        document.getElementById('countPending').textContent = pendientes;
        document.getElementById('countProcessing').textContent = enProceso;
        document.getElementById('countResolved').textContent = resueltos;
    };

    /**
     * Filtra y muestra reportes según criterios
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
        
        if (listaReportes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay reportes</td></tr>';
            return;
        }

        tbody.innerHTML = listaReportes.map(reporte => `
            <tr>
                <td>${formatearFecha(reporte.timestamp.toDate())}</td>
                <td>
                    <span class="type-badge">${obtenerEtiquetaTipo(reporte.tipo)}</span>
                </td>
                <td>${reporte.municipio}</td>
                <td>${reporte.nombre || 'Anónimo'}</td>
                <td>
                    <span class="status-badge ${reporte.estado}">
                        ${obtenerEtiquetaEstado(reporte.estado)}
                    </span>
                </td>
                <td>
                    <button class="btn-ver-detalles" onclick="Admin.verDetalles('${reporte.id}')">
                        Ver Detalles
                    </button>
                </td>
            </tr>
        `).join('');
    };

    /**
     * Abre los detalles de un reporte
     */
    const verDetalles = (reporteId) => {
        reporteActual = reportes.find(r => r.id === reporteId);
        
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
        
        const notas = reporte.notas || [];
        const notasHTML = notas.map((nota, index) => `
            <div class="nota-item">
                <div class="nota-header">
                    <strong>Nota ${index + 1}</strong>
                    <span class="nota-fecha">${formatearFecha(nota.timestamp)}</span>
                </div>
                <p>${nota.contenido}</p>
            </div>
        `).join('');

        content.innerHTML = `
            <div class="reporte-detalle">
                <div class="detalle-seccion">
                    <h3>Información del Reporte</h3>
                    <div class="detalle-info">
                        <p><strong>ID:</strong> ${reporte.id}</p>
                        <p><strong>Fecha:</strong> ${formatearFecha(reporte.timestamp.toDate())}</p>
                        <p><strong>Tipo:</strong> ${obtenerEtiquetaTipo(reporte.tipo)}</p>
                        <p><strong>Ubicación:</strong> ${reporte.municipio} - ${reporte.ubicacionEspecifica}</p>
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
                    <h3>Historial de Notas</h3>
                    <div class="notas-container">
                        ${notasHTML || '<p class="sin-notas">Sin notas aún</p>'}
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
                        <div class="form-group">
                            <label>Nueva Nota</label>
                            <textarea id="nuevaNota" class="form-control" placeholder="Agrega una nota sobre las acciones tomadas..." rows="4"></textarea>
                        </div>
                        <button class="btn-guardar" onclick="Admin.guardarActualizacion('${reporte.id}')">
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Guarda las actualizaciones de un reporte
     */
    const guardarActualizacion = async (reporteId) => {
        const nuevoEstado = document.getElementById('nuevoEstado').value;
        const nuevaNota = document.getElementById('nuevaNota').value;

        if (!nuevoEstado) {
            Notificaciones.mostrar('Selecciona un estado', 'error');
            return;
        }

        try {
            const db = FirebaseConfig.getDB();
            const reporte = reportes.find(r => r.id === reporteId);

            if (!reporte) {
                throw new Error('Reporte no encontrado');
            }

            // Preparar notas
            let notas = reporte.notas || [];
            if (nuevaNota.trim()) {
                notas.push({
                    contenido: nuevaNota,
                    timestamp: new Date().toISOString(),
                    autor: Auth.obtenerUsuario().nombre
                });
            }

            // Actualizar reporte
            await db.collection('reportes_emergencia').doc(reporteId).update({
                estado: nuevoEstado,
                notas: notas,
                ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });

            Notificaciones.mostrar('Reporte actualizado correctamente', 'success');

            // Recargar reportes
            cargarReportes();
            cerrarDetalleReporte();

        } catch (error) {
            console.error('Error al guardar actualización:', error);
            Notificaciones.mostrar('Error al guardar cambios', 'error');
        }
    };

    /**
     * Cierra el modal de detalles
     */
    const cerrarDetalleReporte = () => {
        const modal = document.getElementById('reportDetailModal');
        if (modal) {
            modal.classList.remove('active');
        }
        reporteActual = null;
    };

    /**
     * Obtiene la etiqueta de tipo de emergencia
     */
    const obtenerEtiquetaTipo = (tipo) => {
        const tipos = {
            inundacion: '🌊 Inundación',
            derrumbe: '🪨 Derrumbe',
            calle_bloqueada: '🚧 Calle Bloqueada',
            personas_atrapadas: '🆘 Personas Atrapadas',
            necesidad_agua: '💧 Necesidad de Agua',
            necesidad_alimentos: '🍽️ Necesidad de Alimentos',
            necesidad_medicamentos: '💊 Necesidad de Medicamentos',
            otro: '❓ Otro'
        };
        return tipos[tipo] || tipo;
    };

    /**
     * Obtiene la etiqueta de estado
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
     * Formatea una fecha
     */
    const formatearFecha = (fecha) => {
        if (typeof fecha === 'string') {
            fecha = new Date(fecha);
        }
        return fecha.toLocaleString('es-HN', {
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
        guardarActualizacion
    };
})();