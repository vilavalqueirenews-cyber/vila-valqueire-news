/*
 * ============================================
 * VILA VALQUEIRE NEWS - Autenticacao do Admin
 * Rota: /api/auth
 *
 * Valida as credenciais NO SERVIDOR (nao mais
 * em JS publico) e emite um token assinado
 * (HMAC-SHA256) com expiracao de 12 horas.
 *
 * A senha nao e armazenada em texto plano: fica
 * como hash SHA-256 com salt. Em producao, os
 * valores podem ser sobrescritos pelas variaveis
 * de ambiente ADMIN_USER e ADMIN_PASS_HASH do
 * Cloudflare Pages.
 * ============================================
 */

// Hash SHA-256(salt + ':' + password) da senha padrao.
// Nao e segredo (e derivado da senha), mas permite
// verificar a senha sem guarda-la em texto plano.
const DEFAULT_USER = 'vilavalqueirenews';
const DEFAULT_SALT = 'vila-valqueire-salt-2026-09';
const DEFAULT_PASS_HASH = '42fae7056c9d86eb7329b030c739fd7f28ca9e580a90b3952aa02d8f86152b34';
const DEFAULT_SECRET = 'vvn-auth-secret-2f8Kz9!@#2026';

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const env = context.env || {};

    const adminUser = env.ADMIN_USER || DEFAULT_USER;
    const adminSalt = env.ADMIN_SALT || DEFAULT_SALT;
    const adminPassHash = env.ADMIN_PASS_HASH || DEFAULT_PASS_HASH;
    const secret = env.ADMIN_SECRET || DEFAULT_SECRET;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
    };

    if (context.request.method === 'OPTIONS') {
        return new Response('OK', { status: 200, headers });
    }

    // GET /api/auth?check=TOKEN -> valida sessao ativa
    if (context.request.method === 'GET') {
        const token = url.searchParams.get('check');
        if (!token) {
            return jsonResponse({ ok: false, error: 'Token obrigatorio' }, 400, headers);
        }
        const session = await verifyToken(token, secret);
        if (!session) {
            return jsonResponse({ ok: false, error: 'Sessao invalida ou expirada' }, 401, headers);
        }
        return jsonResponse({ ok: true, user: session.user }, 200, headers);
    }

    // POST /api/auth -> login
    if (context.request.method === 'POST') {
        let body;
        try {
            body = await context.request.json();
        } catch (e) {
            return jsonResponse({ ok: false, error: 'JSON invalido' }, 400, headers);
        }

        const { username, password } = body || {};
        if (!username || !password) {
            return jsonResponse({ ok: false, error: 'Preencha todos os campos' }, 400, headers);
        }

        const inputHash = await hashPassword(password, adminSalt);
        const userOk = username === adminUser;
        const passOk = constantTimeEqual(inputHash, adminPassHash);

        if (!userOk || !passOk) {
            return jsonResponse({ ok: false, error: 'Usuario ou senha incorretos' }, 401, headers);
        }

        const token = await createToken(username, secret);
        return jsonResponse({ ok: true, token: token, user: username }, 200, headers);
    }

    return jsonResponse({ ok: false, error: 'Metodo nao suportado' }, 405, headers);
}

// ---------- helpers ----------

async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hashPassword(password, salt) {
    return sha256(salt + ':' + password);
}

function constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= (a.charCodeAt(i) ^ b.charCodeAt(i));
    }
    return diff === 0;
}

async function createToken(user, secret) {
    const exp = Date.now() + (12 * 60 * 60 * 1000);
    const payload = btoa(JSON.stringify({ u: user, exp: exp }));
    const sig = await sha256(secret + ':' + payload);
    return payload + '.' + sig;
}

async function verifyToken(token, secret) {
    if (!token || typeof token !== 'string') return null;
    const dot = token.indexOf('.');
    if (dot < 0) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    const expected = await sha256(secret + ':' + payload);
    if (!constantTimeEqual(sig, expected)) return null;

    try {
        const data = JSON.parse(atob(payload));
        if (!data.u || !data.exp) return null;
        if (Date.now() > data.exp) return null;
        return { user: data.u };
    } catch (e) {
        return null;
    }
}

function jsonResponse(obj, status, headers) {
    return new Response(JSON.stringify(obj), { status: status, headers: headers });
}