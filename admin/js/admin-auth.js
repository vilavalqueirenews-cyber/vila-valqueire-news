/* ============================================
   VILA VALQUEIRE NEWS - Admin Auth JS
   Login e autenticacao (credenciais privadas)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Credenciais validadas NO SERVIDOR via /api/auth (Pages Function).
    // Nenhuma senha fica exposta no codigo publico.
    const AUTH_KEY = 'vvn_admin_auth';
    const TOKEN_KEY = 'vvn_admin_token';

    // Se ja estiver logado, redireciona para dashboard
    if (sessionStorage.getItem(AUTH_KEY) === 'true' && sessionStorage.getItem(TOKEN_KEY)) {
        // Revalida o token no servidor antes de abrir o dashboard
        verifySession().then(function(valid) {
            if (valid) {
                window.location.href = 'dashboard.html';
            } else {
                sessionStorage.removeItem(AUTH_KEY);
                sessionStorage.removeItem(TOKEN_KEY);
            }
        });
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

        // Autenticar no servidor (Cloudflare Pages Function /api/auth)
        loginBtn.disabled = true;
        loginBtn.classList.add('loading');
        loginBtnText.textContent = 'Autenticando...';
        loginBtn.querySelector('i').className = 'fas fa-circle-notch';

        fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function(data) {
            if (data.ok && data.token) {
                // Sucesso - registrar sessao
                sessionStorage.setItem(AUTH_KEY, 'true');
                sessionStorage.setItem(TOKEN_KEY, data.token);
                sessionStorage.setItem('vvn_admin_user', username);
                sessionStorage.setItem('vvn_admin_login_time', new Date().toISOString());

                // Toast de sucesso
                showToast('success', '<i class="fas fa-check-circle"></i> Login realizado com sucesso!');

                setTimeout(function() {
                    window.location.href = 'dashboard.html';
                }, 800);
            } else {
                throw new Error(data.error || 'Falha na autenticacao');
            }
        })
        .catch(function(err) {
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
        });
    });

    function verifySession() {
        const token = sessionStorage.getItem(TOKEN_KEY);
        if (!token) return Promise.resolve(false);
        return fetch('/api/auth?check=' + encodeURIComponent(token), { cache: 'no-store' })
            .then(function(res) { return res.json(); })
            .then(function(data) { return data.ok === true; })
            .catch(function() { return false; });
    }

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
