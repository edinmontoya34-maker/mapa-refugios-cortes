/**
 * Sistema de reportes de emergencia para ciudadanos
 * Formulario público sin autenticación requerida
 */

const Emergencia = (() => {
    const tiposEmergencia = {
        inundacion: { icono: '🌊', label: 'Inundación' },
        derrumbe: { icono: '🪨', label: 'Derrumbe' },
        calle_bloqueada: { icono: '🚧', label: 'Calle Bloqueada' },
        personas_atrapadas: { icono: '🆘', label: 'Personas Atrapadas' },
        necesidad_agua: { icono: '💧', label: 'Necesidad de Agua' },
        necesidad_alimentos: { icono: '🍽️', label: 'Necesidad de Alimentos' },
        necesidad_medicamentos: { icono: '💊', label: 'Necesidad de Medicamentos' },
        otro: { icono: '❓', label: 'Otro' }
    };

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
        const reportButton = document.getElementById('reportButton');
        const btnReportEmergency = document.getElementById('btnSubmitReport');
        const btnCancelReport = document.getElementById('btnCancelReport');
        const btnBackFromReport = document.getElementById('btnBackFromReport');
        const emergencyForm = document.getElementById('emergencyReportForm');
        const departmentSelect = document.getElementById('reportDepartment');
        const btnNewReport = document.getElementById('btnNewReport');
        const btnReturnToMap = document.getElementById('btnReturnToMap');

        if (reportButton) {
            reportButton.addEventListener('click', () => {
                Vista.mostrar('emergencyReportView');
                document.getElementById('emergencyReportForm').reset();
            });
        }

        if (btnCancelReport) {
            btnCancelReport.addEventListener('click', () => {
                Vista.mostrar('mapView');
            });
        }

        if (btnBackFromReport) {
            btnBackFromReport.addEventListener('click', () => {
                Vista.mostrar('mapView');
            });
        }

        if (emergencyForm) {
            emergencyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                enviarReporte();
            });
        }

        if (departmentSelect) {
            departmentSelect.addEventListener('change', cargarMunicipios);
        }

        if (btnNewReport) {
            btnNewReport.addEventListener('click', () => {
                document.getElementById('emergencyReportForm').reset();
                Vista.mostrar('emergencyReportView');
            });
        }

        if (btnReturnToMap) {
            btnReturnToMap.addEventListener('click', () => {
                Vista.mostrar('mapView');
            });
        }
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
            const municipiosList = Auth.obtenerMunicipios(departamento);
            municipiosList.forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio.toLowerCase().replace(/\s+/g, '_');
                option.textContent = municipio;
                municipalitySelect.appendChild(option);
            });
        }
    };

    /**
     * Envía el reporte de emergencia
     */
    const enviarReporte = async () => {
        const form = document.getElementById('emergencyReportForm');
        const btnSubmit = document.getElementById('btnSubmitReport');

        try {
            btnSubmit.disabled = true;
            btnSubmit.textContent = '⏳ Enviando...';

            // Obtener datos del formulario
            const reporteData = {
                tipo: document.querySelector('input[name="emergencyType"]:checked').value,
                descripcion: document.getElementById('reportDescription').value,
                departamento: document.getElementById('reportDepartment').value,
                municipio: document.getElementById('reportMunicipality').value,
                ubicacionEspecifica: document.getElementById('reportLocation').value,
                nombre: document.getElementById('reporterName').value || null,
                telefono: document.getElementById('reporterPhone').value || null,
                estado: 'pendiente',
                fecha: new Date().toISOString(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                aceptaTrabajo: true
            };

            // Validar datos requeridos
            if (!reporteData.tipo || !reporteData.descripcion || !reporteData.ubicacionEspecifica) {
                throw new Error('Por favor completa todos los campos requeridos');
            }

            // Guardar en Firestore
            const db = FirebaseConfig.getDB();
            const docRef = await db.collection('reportes_emergencia').add(reporteData);

            // Mostrar confirmación
            mostrarConfirmacion(docRef.id);

            // Limpiar formulario
            form.reset();

            console.log('✓ Reporte de emergencia enviado:', docRef.id);

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
        document.getElementById('reportId').textContent = reporteId;
        const modal = document.getElementById('reportConfirmationModal');
        if (modal) {
            modal.classList.add('active');
        }
    };

    return {
        inicializar
    };
})();