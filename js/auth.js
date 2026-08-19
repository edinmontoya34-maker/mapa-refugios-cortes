/**
 * Sistema de autenticación para administradores
 * Maneja login, sesión persistente y protección de rutas
 */

const Auth = (() => {
    let usuarioActual = null;

    // Datos de demostración (en producción usar backend seguro)
    const ADMIN_DEMO = {
        email: 'edinmontoya34@gmail.com',
        password: 'admin123'
    };

    /**
     * Inicializa el sistema de autenticación
     */
    const inicializar = () => {
        console.log('🔐 Inicializando sistema de autenticación...');
        restaurarSesion();
        configurarEventos();
    };

    /**
     * Restaura la sesión persistente
     */
    const restaurarSesion = () => {
        const sesionGuardada = localStorage.getItem('sesionAdmin');
        if (sesionGuardada) {
            try {
                usuarioActual = JSON.parse(sesionGuardada);
                console.log('✓ Sesión restaurada:', usuarioActual.email);
            } catch (error) {
                console.error('Error al restaurar sesión:', error);
                localStorage.removeItem('sesionAdmin');
            }
        }
    };

    /**
     * Configura los eventos de autenticación
     */
    const configurarEventos = () => {
        const loginForm = document.getElementById('loginForm');
        const btnBackToMap = document.getElementById('btnBackToMap');
        const btnAdminLogin = document.getElementById('btnAdminLogin');
        const btnLogout = document.getElementById('btnLogout');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                procesarLogin();
            });
        }

        if (btnBackToMap) {
            btnBackToMap.addEventListener('click', () => {
                Vista.mostrar('mapView');
            });
        }

        if (btnAdminLogin) {
            btnAdminLogin.addEventListener('click', () => {
                Vista.mostrar('loginView');
            });
        }

        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                logout();
            });
        }
    };

    /**
     * Procesa el login del administrador
     */
    const procesarLogin = async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btnSubmit = document.getElementById('loginSubmitBtn');
        const errorDiv = document.getElementById('loginError');

        // Validar campos
        if (!email || !password) {
            mostrarError(errorDiv, 'Por favor completa todos los campos');
            return;
        }

        try {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Verificando...';

            // Simular autenticación
            await new Promise(resolve => setTimeout(resolve, 500));

            if (email !== ADMIN_DEMO.email || password !== ADMIN_DEMO.password) {
                mostrarError(errorDiv, 'Correo o contraseña incorrectos');
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Iniciar Sesión';
                console.warn('⚠️ Intento de login fallido:', email);
                return;
            }

            // Crear sesión
            usuarioActual = {
                email: email,
                nombre: 'Administrador',
                rol: 'admin'
            };

            // Guardar en localStorage
            localStorage.setItem('sesionAdmin', JSON.stringify(usuarioActual));

            // Limpiar formulario y errores
            document.getElementById('loginForm').reset();
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';

            // Actualizar UI
            actualizarUIAdmin();

            // Mostrar panel admin
            Vista.mostrar('adminView');
            Admin.inicializar();

            Notificaciones.mostrar(`¡Bienvenido ${usuarioActual.nombre}!`, 'success');

            console.log('✓ Login exitoso:', email);

        } catch (error) {
            console.error('Error en login:', error);
            mostrarError(errorDiv, 'Error al iniciar sesión. Intenta más tarde.');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Iniciar Sesión';
        }
    };

    /**
     * Actualiza la UI con información del administrador
     */
    const actualizarUIAdmin = () => {
        const userInfo = document.getElementById('adminUserInfo');
        if (userInfo && usuarioActual) {
            userInfo.textContent = usuarioActual.nombre;
        }
    };

    /**
     * Muestra error en el formulario de login
     */
    const mostrarError = (errorDiv, mensaje) => {
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
        }
    };

    /**
     * Verifica si el usuario está autenticado
     */
    const estaAutenticado = () => {
        return usuarioActual !== null;
    };

    /**
     * Obtiene el usuario actual
     */
    const obtenerUsuario = () => {
        return usuarioActual;
    };

    /**
     * Cierra la sesión
     */
    const logout = () => {
        usuarioActual = null;
        localStorage.removeItem('sesionAdmin');
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.reset();
        Vista.mostrar('mapView');
        Notificaciones.mostrar('Sesión cerrada correctamente', 'info');
        console.log('✓ Logout exitoso');
    };

    return {
        inicializar,
        estaAutenticado,
        obtenerUsuario,
        logout
    };
})();

// Mostrar credenciales de demostración en consola
console.log('🔐 CREDENCIALES DE DEMOSTRACIÓN:');
console.log('  Email: edinmontoya34@gmail.com');
console.log('  Contraseña: admin123');
