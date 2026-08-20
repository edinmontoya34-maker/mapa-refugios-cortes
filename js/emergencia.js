/**
 * Sistema de reportes de emergencia para ciudadanos
 * Formulario público sin autenticación requerida
 * Almacena reportes compartidos en Cloud Firestore
 */

const Emergencia = (() => {
    const inicializar = () => {
        console.log('🚨 Inicializando sistema de reportes de emergencia...');
        configurarEventos();
        cargarMunicipios();
    };

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
        if (departmentSelect) departmentSelect.addEventListener('change', cargarMunicipios);
        if (btnCancelReport) btnCancelReport.addEventListener('click', volverAlMapa);
        if (btnBackFromReport) btnBackFromReport.addEventListener('click', volverAlMapa);
        if (btnNewReport) btnNewReport.addEventListener('click', abrirFormulario);
        if (btnReturnToMap) btnReturnToMap.addEventListener('click', volverAlMapa);
        if (reportDescription) {
            reportDescription.addEventListener('input', (e) => {
                const charCount = document.getElementById('charCount');
                if (charCount) charCount.textContent = obtenerTextoConteoCaracteres(e.target.value.length);
            });
        }
    };

    const cerrarConfirmacion = () => {
        const modal = document.getElementById('reportConfirmationModal');
        if (modal) modal.classList.remove('active');
    };

    const resetearFormulario = () => {
        const form = document.getElementById('emergencyReportForm');
        const charCount = document.getElementById('charCount');
        if (form) form.reset();
        if (charCount) charCount.textContent = `0/${obtenerLimiteDescripcion()} caracteres`;
        cargarMunicipios();
    };

    const obtenerLimiteDescripcion = () => {
        const reportDescription = document.getElementById('reportDescription');
        return reportDescription && reportDescription.maxLength > 0 ? reportDescription.maxLength : 1000;
    };

    const obtenerTextoConteoCaracteres = (cantidadActual) => `${cantidadActual}/${obtenerLimiteDescripcion()} caracteres`;

    const abrirFormulario = () => {
        cerrarConfirmacion();
        resetearFormulario();
        Vista.mostrar('emergencyReportView');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const volverAlMapa = () => {
        cerrarConfirmacion();
        Vista.mostrar('mapView');
    };

    const cargarMunicipios = () => {
        const departmentSelect = document.getElementById('reportDepartment');
        const municipalitySelect = document.getElementById('reportMunicipality');
        if (!departmentSelect || !municipalitySelect) return;
        const departamento = departmentSelect.value;
        municipalitySelect.innerHTML = '<option value="">-- Selecciona municipio --</option>';
        if (departamento) {
            Datos.obtenerMunicipios(departamento).forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio.toLowerCase().replace(/\s+/g, '_');
                option.textContent = municipio;
                municipalitySelect.appendChild(option);
            });
        }
    };

    const sanitizar = (texto) => {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    };

    const enviarReporte = async () => {
        const btnSubmit = document.getElementById('btnSubmitReport');
        const tipoReporte = document.querySelector('input[name="emergencyType"]:checked');
        try {
            if (!tipoReporte) {
                Notificaciones.mostrar('Por favor selecciona un tipo de reporte', 'error');
                return;
            }
            const descripcion = document.getElementById('reportDescription').value.trim();
            const ubicacionEspecifica = document.getElementById('reportLocation').value.trim();
            const municipio = document.getElementById('reportMunicipality').value;
            if (!descripcion) throw new Error('Por favor escribe una descripción');
            if (descripcion.length < 10) throw new Error('La descripción debe tener al menos 10 caracteres');
            if (descripcion.length > 1000) throw new Error('La descripción no puede superar 1000 caracteres');
            if (!ubicacionEspecifica) throw new Error('Por favor indica la ubicación específica');
            if (!municipio) throw new Error('Por favor selecciona un municipio');

            btnSubmit.disabled = true;
            btnSubmit.textContent = '⏳ Enviando...';
            const reporteData = {
                tipo: tipoReporte.value,
                descripcion: sanitizar(descripcion),
                municipio,
                ubicacionEspecifica: sanitizar(ubicacionEspecifica),
                nombre: sanitizar(document.getElementById('reporterName').value || ''),
                telefono: sanitizar(document.getElementById('reporterPhone').value || ''),
                estado: 'pendiente',
                tipoReporte: 'ciudadano'
            };

            const reporteId = await AlmacenamientoReportes.guardar(reporteData);
            mostrarConfirmacion(reporteId);
            resetearFormulario();
            Notificaciones.mostrar('Reporte enviado correctamente', 'success');
            console.log('✓ Reporte de emergencia enviado:', reporteId);
        } catch (error) {
            console.error('Error al enviar reporte:', error);
            Notificaciones.mostrar(`No se pudo enviar el reporte: ${error.message}`, 'error');
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Enviar Reporte';
            }
        }
    };

    const mostrarConfirmacion = (reporteId) => {
        const reportIdElement = document.getElementById('reportId');
        if (reportIdElement) reportIdElement.textContent = reporteId;
        const modal = document.getElementById('reportConfirmationModal');
        if (modal) modal.classList.add('active');
    };

    return { inicializar, abrirFormulario };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => Emergencia.inicializar(), 100));
} else {
    setTimeout(() => Emergencia.inicializar(), 100);
}
