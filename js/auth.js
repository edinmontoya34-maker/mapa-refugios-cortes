/**
 * Sistema de autenticación para administradores mediante Firebase Authentication.
 */

const Auth = (() => {
    let usuarioActual = null;
    let auth = null;

    const inicializar = async () => {
        console.log('🔐 Inicializando autenticación Firebase...');
        await CONFIG.firebaseReady;
        auth = firebase.auth();
        auth.onAuthStateChanged((usuario) => {
            usuarioActual = usuario && esAdministrador(usuario) ? usuario : null;
            if (usuario && !esAdministrador(usuario)) {
                auth.signOut();
                Notificaciones.mostrar('Esta cuenta no tiene permisos de administrador', 'error');
            }
        });
        configurarEventos();
    };

    const esAdministrador = (usuario) => Boolean(
        usuario && usuario.email && usuario.email.toLowerCase() === CONFIG.ADMIN_EMAIL.toLowerCase()
    );

    const configurarEventos = () => {
        const loginForm = document.getElementById('loginForm');
        const btnBackToMap = document.getElementById('btnBackToMap');
        const btnAdminLogin = document.getElementById('btnAdminLogin');
        const btnLogout = document.getElementById('btnLogout');

        if (loginForm) loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            procesarLogin();
        });
        if (btnBackToMap) btnBackToMap.addEventListener('click', () => Vista.mostrar('mapView'));
        if (btnAdminLogin) btnAdminLogin.addEventListener('click', () => Vista.mostrar('loginView'));
        if (btnLogout) btnLogout.addEventListener('click', logout);
    };

    const procesarLogin = async () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btnSubmit = document.getElementById('loginSubmitBtn');
        const errorDiv = document.getElementById('loginError');

        if (!email || !password) {
            mostrarError(errorDiv, 'Por favor completa todos los campos');
            return;
        }

        try {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Verificando...';
            await CONFIG.firebaseReady;
            if (email.toLowerCase() !== CONFIG.ADMIN_EMAIL.toLowerCase()) {
                throw new Error('Esta cuenta no tiene permisos de administrador');
            }
            const credencial = await firebase.auth().signInWithEmailAndPassword(email, password);
            if (!esAdministrador(credencial.user)) {
                await firebase.auth().signOut();
                throw new Error('Esta cuenta no tiene permisos de administrador');
            }
            usuarioActual = credencial.user;
            document.getElementById('loginForm').reset();
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            actualizarUIAdmin();
            Vista.mostrar('adminView');
            Admin.inicializar();
            Notificaciones.mostrar(`¡Bienvenido ${usuarioActual.email}!`, 'success');
        } catch (error) {
            console.error('Error en login:', error);
            mostrarError(errorDiv, traducirError(error));
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Iniciar Sesión';
        }
    };

    const traducirError = (error) => {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            return 'Correo o contraseña incorrectos';
        }
        if (error.code === 'auth/too-many-requests') return 'Demasiados intentos. Intenta más tarde.';
        return error.message || 'Error al iniciar sesión';
    };

    const actualizarUIAdmin = () => {
        const userInfo = document.getElementById('adminUserInfo');
        if (userInfo && usuarioActual) userInfo.textContent = usuarioActual.email;
    };

    const mostrarError = (errorDiv, mensaje) => {
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
        }
    };

    const estaAutenticado = () => esAdministrador(usuarioActual);
    const obtenerUsuario = () => usuarioActual;

    const logout = async () => {
        try {
            await firebase.auth().signOut();
            usuarioActual = null;
            Vista.mostrar('mapView');
            Notificaciones.mostrar('Sesión cerrada correctamente', 'info');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return { inicializar, estaAutenticado, obtenerUsuario, logout };
})();
