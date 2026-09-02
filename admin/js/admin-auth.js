/* ============================================
   VILA VALQUEIRE NEWS - Admin Auth JS
   Login e autenticacao (credenciais privadas)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Credenciais de acesso (proprietario JSMuniz Publicidade)
    const ADMIN_USER = 'vilavalqueirenews';
    const ADMIN_PASS = 'Jojo7811';
    const AUTH_KEY = 'vvn_admin_auth';

    // Se ja estiver logado, redireciona para dashboard
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }

    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');
    const errorText = document.getElementById('errorText');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = loginBtn.querySelector('span');

    // Mostrar/ocultar senha
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.innerHTML = type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    });

    // Submeter formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        errorBox.style.display = 'none';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Validar campos vazios
        if (!username || !password) {
            errorText.textContent = 'Preencha todos os campos.';
            errorBox.style.display = 'flex';
            shakeError();
            return;
        }

        // Simular pequena pausa para autenticacao
        loginBtn.disabled = true;
        loginBtn.classList.add('loading');
        loginBtnText.textContent = 'Autenticando...';
        loginBtn.querySelector('i').className = 'fas fa-circle-notch';

        setTimeout(function() {
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                // Sucesso - registrar sessao
                sessionStorage.setItem(AUTH_KEY, 'true');
                sessionStorage.setItem('vvn_admin_user', username);
                sessionStorage.setItem('vvn_admin_login_time', new Date().toISOString());
                
                // Toast de sucesso
                showToast('success', '<i class="fas fa-check-circle"></i> Login realizado com sucesso!');
                
                setTimeout(function() {
                    window.location.href = 'dashboard.html';
                }, 800);
            } else {
                // Falha
                loginBtn.disabled = false;
                loginBtn.classList.remove('loading');
                loginBtnText.textContent = 'Entrar no Painel';
                loginBtn.querySelector('i').className = 'fas fa-sign-in-alt';
                
                errorText.textContent = 'Usuario ou senha incorretos. Tente novamente.';
                errorBox.style.display = 'flex';
                shakeError();
                
                // Limpar campos
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 800);
    });

    function shakeError() {
        errorBox.style.animation = 'none';
        errorBox.offsetHeight;
        errorBox.style.animation = '';
    }

    function showToast(type, message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // Protecao contra acesso via iframe
    if (window.self !== window.top) {
        // Previne clickjacking
        window.top.location = window.self.location;
    }
});
