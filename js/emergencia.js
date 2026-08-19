/**
 * Sistema de reportes de emergencia para ciudadanos
 * Formulario público sin autenticación requerida
 * Almacena reportes en localStorage
 */

const Emergencia = (() => {
    /**
     * Inicializa el módulo de emergencia
     */
    const inicializar = () => {
        console.log('🚨 Inicializando sistema de reportes de emergencia...');
        configurarEventos();
        cargarMunicipios();
    };

    /**
     * Configura los eventos del formulario
     */
    const configurarEventos = () => {
        const emergencyForm = document.getElementById('emergencyReportForm');
        const departmentSelect = document.getElementById('reportDepartment');
        const btnCancelReport = document.getElementById('btnCancelReport');
        const btnBackFromReport = document.getElementById('btnBackFromReport');
        const btnNewReport = document.getElementById('btnNewReport');
        const btnReturnToMap = document.getElementById('btnReturnToMap');
        const reportDescription = document.getElementById('reportDescription');

        if (emergencyForm) {
            emergencyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                enviarReporte();
            });
        }

        if (departmentSelect) {
            departmentSelect.addEventListener('change', cargarMunicipios);
        }

        if (btnCancelReport) {
            btnCancelReport.addEventListener('click', () => {
                volverAlMapa();
            });
        }

        if (btnBackFromReport) {
            btnBackFromReport.addEventListener('click', () => {
                volverAlMapa();
            });
        }

        if (btnNewReport) {
            btnNewReport.addEventListener('click', () => {
                abrirFormulario();
            });
        }

        if (btnReturnToMap) {
            btnReturnToMap.addEventListener('click', () => {
                volverAlMapa();
            });
        }

        if (reportDescription) {
            reportDescription.addEventListener('input', (e) => {
                const charCount = document.getElementById('charCount');
                if (charCount) {
                    charCount.textContent = obtenerTextoConteoCaracteres(e.target.value.length);
                }
            });
        }

        console.log('✓ Eventos del formulario configurados');
    };

    /**
     * Cierra el modal de confirmación
     */
    const cerrarConfirmacion = () => {
        const modal = document.getElementById('reportConfirmationModal');
        if (modal) {
            modal.classList.remove('active');
        }
    };

    /**
     * Reinicia el formulario a su estado inicial
     */
    const resetearFormulario = () => {
        const form = document.getElementById('emergencyReportForm');
        const charCount = document.getElementById('charCount');

        if (form) {
            form.reset();
        }

        if (charCount) {
            charCount.textContent = `0/${obtenerLimiteDescripcion()} caracteres`;
        }
    };

    /**
     * Obtiene el límite configurado para la descripción
     */
    const obtenerLimiteDescripcion = () => {
        const reportDescription = document.getElementById('reportDescription');
        return reportDescription && reportDescription.maxLength > 0
            ? reportDescription.maxLength
            : 1000;
    };

    /**
     * Genera el texto del contador de caracteres
     */
    const obtenerTextoConteoCaracteres = (cantidadActual) => {
        return `${cantidadActual}/${obtenerLimiteDescripcion()} caracteres`;
    };

    /**
     * Abre el formulario de reportes
     */
    const abrirFormulario = () => {
        cerrarConfirmacion();
        resetearFormulario();
        Vista.mostrar('emergencyReportView');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Regresa a la vista principal del mapa
     */
    const volverAlMapa = () => {
        cerrarConfirmacion();
        Vista.mostrar('mapView');
    };

    /**
     * Carga los municipios según el departamento seleccionado
     */
    const cargarMunicipios = () => {
        const departmentSelect = document.getElementById('reportDepartment');
        const municipalitySelect = document.getElementById('reportMunicipality');
        const departamento = departmentSelect.value;

        // Limpiar municipios anteriores
        municipalitySelect.innerHTML = '<option value="">-- Selecciona municipio --</option>';

        if (departamento) {
            const municipiosList = Datos.obtenerMunicipios(departamento);
            municipiosList.forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio.toLowerCase().replace(/\s+/g, '_');
                option.textContent = municipio;
                municipalitySelect.appendChild(option);
            });
        }
    };

    /**
     * Sanitiza un string para evitar XSS
     */
    const sanitizar = (texto) => {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    };

    /**
     * Envía el reporte de emergencia
     */
    const enviarReporte = async () => {
        const form = document.getElementById('emergencyReportForm');
        const btnSubmit = document.getElementById('btnSubmitReport');
        const tipoReporte = document.querySelector('input[name="emergencyType"]:checked');

        try {
            // Validar que se haya seleccionado un tipo
            if (!tipoReporte) {
                Notificaciones.mostrar('Por favor selecciona un tipo de reporte', 'error');
                return;
            }

            const descripcion = document.getElementById('reportDescription').value.trim();
            const ubicacionEspecifica = document.getElementById('reportLocation').value.trim();
            const municipio = document.getElementById('reportMunicipality').value;

            // Validaciones
            if (!descripcion) {
                Notificaciones.mostrar('Por favor escribe una descripción', 'error');
                return;
            }

            if (descripcion.length < 10) {
                Notificaciones.mostrar('La descripción debe tener al menos 10 caracteres', 'error');
                return;
            }

            if (descripcion.length > 1000) {
                Notificaciones.mostrar('La descripción no puede superar 1000 caracteres', 'error');
                return;
            }

            if (!ubicacionEspecifica) {
                Notificaciones.mostrar('Por favor indica la ubicación específica', 'error');
                return;
            }

            if (!municipio) {
                Notificaciones.mostrar('Por favor selecciona un municipio', 'error');
                return;
            }

            btnSubmit.disabled = true;
            btnSubmit.textContent = '⏳ Enviando...';

            // Obtener datos y sanitizarlos
            const reporteData = {
                tipo: tipoReporte.value,
                descripcion: sanitizar(descripcion),
                municipio: municipio,
                ubicacionEspecifica: sanitizar(ubicacionEspecifica),
                nombre: sanitizar(document.getElementById('reporterName').value || ''),
                telefono: sanitizar(document.getElementById('reporterPhone').value || ''),
                estado: 'pendiente',
                tipoReporte: 'ciudadano'
            };

            // Guardar en localStorage
            const reporteId = AlmacenamientoReportes.guardar(reporteData);

            // Mostrar confirmación
            mostrarConfirmacion(reporteId);

            // Limpiar formulario
            resetearFormulario();
            Notificaciones.mostrar('Reporte enviado correctamente', 'success');

            console.log('✓ Reporte de emergencia enviado:', reporteId);

        } catch (error) {
            console.error('Error al enviar reporte:', error);
            Notificaciones.mostrar(`Error: ${error.message}`, 'error');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Enviar Reporte';
        }
    };

    /**
     * Muestra la pantalla de confirmación
     */
    const mostrarConfirmacion = (reporteId) => {
        const reportIdElement = document.getElementById('reportId');
        if (reportIdElement) {
            reportIdElement.textContent = reporteId;
        }
        
        const modal = document.getElementById('reportConfirmationModal');
        if (modal) {
            modal.classList.add('active');
        }
    };

    return {
        inicializar,
        abrirFormulario
    };
})();

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => Emergencia.inicializar(), 100);
    });
} else {
    setTimeout(() => Emergencia.inicializar(), 100);
}