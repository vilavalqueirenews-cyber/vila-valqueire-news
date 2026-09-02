/* ============================================
   VILA VALQUEIRE NEWS - Admin Dashboard JS
   JSMuniz Publicidade
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticacao
    if (sessionStorage.getItem('vvn_admin_auth') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    initLayout();
    initNavigation();
    initClock();
    loadDashboard();
    loadNewsTable();
    loadCategories();
    initNewsForm();
    initSiteConfig();
    initRadioConfig();
    initProfile();
    initLogout();
});

/* ============================================
   LAYOUT
   ============================================ */
function initLayout() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    sidebarToggle.addEventListener('click', function() {
        document.getElementById('adminSidebar').classList.add('open');
        sidebarOverlay.classList.add('show');
    });

    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    function closeSidebar() {
        document.getElementById('adminSidebar').classList.remove('open');
        sidebarOverlay.classList.remove('show');
    }
}

/* ============================================
   NAVIGATION
   ============================================ */
let currentPage = 'dashboard';

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            showPage(page);
            closeSidebar();
        });
    });

    // Links goto
    document.querySelectorAll('[data-goto]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-goto');
            navItems.forEach(i => i.classList.remove('active'));
            document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
            showPage(page);
        });
    });

    function closeSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) {
        target.classList.add('active');
        currentPage = page;
        
        const titles = {
            dashboard: 'Dashboard',
            news: 'Gerenciar Noticias',
            'new-news': 'Nova Noticia',
            categories: 'Categorias',
            ads: 'Publicidade',
            radio: 'Radio Jovem Rio',
            'site-config': 'Configuracoes do Site',
            profile: 'Meu Perfil'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    }
}

/* ============================================
   CLOCK
   ============================================ */
function initClock() {
    const clockElement = document.getElementById('topbarClock');
    
    function updateClock() {
        const now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

/* ============================================
   DASHBOARD
   ============================================ */
function loadDashboard() {
    const username = sessionStorage.getItem('vvn_admin_user') || 'Administrador';
    document.getElementById('welcomeName').textContent = username.charAt(0).toUpperCase() + username.slice(1);
    document.getElementById('adminName').textContent = 'JSMuniz Admin';

    // Stats
    const allNews = NEWS_DATABASE.news;
    const totalViews = allNews.reduce((sum, n) => sum + n.views, 0);
    const totalComments = allNews.reduce((sum, n) => sum + n.comments, 0);
    
    document.getElementById('statNews').textContent = allNews.length + 1;
    document.getElementById('statViews').textContent = formatNumber(totalViews);
    document.getElementById('statComments').textContent = formatNumber(totalComments);
    document.getElementById('statCategories').textContent = Object.keys(NEWS_CATEGORIES).length - 1;

    // Most read
    const mostRead = [...allNews].sort((a, b) => b.views - a.views).slice(0, 5);
    const mostReadContainer = document.getElementById('dashboardMostRead');
    mostReadContainer.innerHTML = '';
    
    mostRead.forEach((news, index) => {
        const item = document.createElement('div');
        item.className = 'most-read-item-admin';
        item.innerHTML = `
            <span class="most-read-rank">${index + 1}</span>
            <span class="mr-title">${news.title}</span>
            <span class="mr-views"><i class="fas fa-eye"></i> ${formatNumber(news.views)}</span>
        `;
        mostReadContainer.appendChild(item);
    });

    // Activity log
    const activityContainer = document.getElementById('activityLog');
    const activities = [
        { icon: 'fa-plus', text: 'Noticia publicada', time: 'Hoje, 14:30' },
        { icon: 'fa-edit', text: 'Noticia atualizada: Festival Cultural', time: 'Hoje, 11:15' },
        { icon: 'fa-trash', text: 'Noticia excluida: Evento antigo', time: 'Ontem, 16:40' },
        { icon: 'fa-chart-line', text: 'Relatorio semanal gerado', time: 'Ontem, 09:00' },
        { icon: 'fa-cog', text: 'Configuracao do site atualizada', time: '29/08, 15:20' }
    ];
    
    activityContainer.innerHTML = '';
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon"><i class="fas ${activity.icon}"></i></div>
            <div class="activity-text">
                <p>${activity.text}</p>
                <small><i class="fas fa-clock"></i> ${activity.time}</small>
            </div>
        `;
        activityContainer.appendChild(item);
    });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

/* ============================================
   NEWS TABLE
   ============================================ */
function loadNewsTable() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('newsSearchInput');
    
    // Populate category filter
    Object.entries(NEWS_CATEGORIES).forEach(([key, value]) => {
        if (key !== 'todas') {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            categoryFilter.appendChild(option);
        }
    });

    function renderTable() {
        const filter = categoryFilter.value;
        const search = searchInput.value.trim().toLowerCase();
        
        let news = NEWS_DATABASE.news;
        if (filter !== 'todas') {
            news = news.filter(n => n.category === filter);
        }
        if (search) {
            news = news.filter(n => 
                n.title.toLowerCase().includes(search) || 
                n.excerpt.toLowerCase().includes(search)
            );
        }
        
        const tbody = document.getElementById('newsTableBody');
        tbody.innerHTML = '';
        
        if (news.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data"><i class="fas fa-inbox"></i>Nenhuma noticia encontrada</td></tr>';
            return;
        }
        
        news.forEach(n => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${n.id}</td>
                <td><img src="${n.image}" class="table-thumb" alt=""></td>
                <td class="table-title">${n.title}</td>
                <td><span class="category-badge cat-${n.category}">${n.categoryLabel}</span></td>
                <td>${formatNumber(n.views)}</td>
                <td>${n.time}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn action-view" data-action="view" data-id="${n.id}" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="table-action-btn action-edit" data-action="edit" data-id="${n.id}" title="Editar">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="table-action-btn action-delete" data-action="delete" data-id="${n.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Actions
            const viewBtn = row.querySelector('[data-action="view"]');
            viewBtn.addEventListener('click', function() {
                const news = NEWS_DATABASE.news.find(x => x.id === n.id);
                if (news) {
                    showToast('info', `<i class="fas fa-eye"></i> ${news.title}`);
                }
            });
            
            const editBtn = row.querySelector('[data-action="edit"]');
            editBtn.addEventListener('click', function() {
                const news = NEWS_DATABASE.news.find(x => x.id === n.id);
                if (news) {
                    // Preencher formulario
                    document.getElementById('newsTitle').value = news.title;
                    document.getElementById('newsCategory').value = news.category;
                    document.getElementById('newsExcerpt').value = news.excerpt;
                    document.getElementById('newsContent').value = news.content || news.excerpt;
                    document.getElementById('newsImage').value = news.image;
                    showPage('new-news');
                    showToast('warning', '<i class="fas fa-pen"></i> Editando noticia #' + news.id);
                }
            });
            
            const deleteBtn = row.querySelector('[data-action="delete"]');
            deleteBtn.addEventListener('click', function() {
                showDeleteModal(n.id);
            });
            
            tbody.appendChild(row);
        });
    }
    
    categoryFilter.addEventListener('change', renderTable);
    searchInput.addEventListener('input', renderTable);
    renderTable();
}

/* ============================================
   DELETE MODAL
   ============================================ */
let newsToDelete = null;

function showDeleteModal(newsId) {
    newsToDelete = newsId;
    document.getElementById('deleteModal').style.display = 'flex';
}

function initDeleteModal() {
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    cancelBtn.addEventListener('click', function() {
        document.getElementById('deleteModal').style.display = 'none';
        newsToDelete = null;
    });
    
    confirmBtn.addEventListener('click', function() {
        if (newsToDelete) {
            const index = NEWS_DATABASE.news.findIndex(n => n.id === newsToDelete);
            if (index > -1) {
                NEWS_DATABASE.news.splice(index, 1);
                loadNewsTable();
                loadDashboard();
                showToast('success', '<i class="fas fa-check-circle"></i> Noticia excluida com sucesso');
            }
        }
        document.getElementById('deleteModal').style.display = 'none';
        newsToDelete = null;
    });
}

initDeleteModal();

/* ============================================
   CATEGORIES
   ============================================ */
function loadCategories() {
    const container = document.getElementById('categoriesList');
    container.innerHTML = '';
    
    Object.entries(NEWS_CATEGORIES).forEach(([key, value]) => {
        if (key === 'todas') return;
        
        const count = NEWS_DATABASE.news.filter(n => n.category === key).length;
        const icons = {
            politica: 'fa-landmark',
            seguranca: 'fa-shield-alt',
            saude: 'fa-heartbeat',
            educacao: 'fa-graduation-cap',
            cultura: 'fa-palette',
            esportes: 'fa-futbol',
            economia: 'fa-chart-line',
            comunidade: 'fa-users'
        };
        
        const item = document.createElement('div');
        item.className = 'most-read-item-admin';
        item.innerHTML = `
            <span class="most-read-rank cat-${key}" style="background: inherit; color: inherit; width: auto; padding: 6px 12px; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                <i class="fas ${icons[key] || 'fa-tag'}"></i> ${value}
            </span>
            <span class="mr-title" style="margin-left: auto;">${count} noticia(s)</span>
        `;
        container.appendChild(item);
    });
}

/* ============================================
   NEWS FORM
   ============================================ */
function initNewsForm() {
    const form = document.getElementById('newsForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('newsTitle').value.trim();
        const category = document.getElementById('newsCategory').value;
        const excerpt = document.getElementById('newsExcerpt').value.trim();
        const content = document.getElementById('newsContent').value.trim();
        const image = document.getElementById('newsImage').value.trim() || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop';
        const time = document.getElementById('newsTime').value.trim() || 'Agora';
        
        if (!title || !category || !excerpt || !content) {
            showToast('error', '<i class="fas fa-exclamation-circle"></i> Preencha todos os campos obrigatorios');
            return;
        }
        
        const categoryLabels = {
            politica: 'Politica',
            seguranca: 'Seguranca',
            saude: 'Saude',
            educacao: 'Educacao',
            cultura: 'Cultura',
            esportes: 'Esportes',
            economia: 'Economia',
            comunidade: 'Comunidade'
        };
        
        // Criar nova noticia
        const newId = Math.max(...NEWS_DATABASE.news.map(n => n.id), NEWS_DATABASE.featured.id) + 1;
        const newNews = {
            id: newId,
            title: title,
            excerpt: excerpt,
            content: content.length > excerpt.length ? content : excerpt,
            category: category,
            categoryLabel: categoryLabels[category] || category,
            time: time,
            date: new Date().toLocaleDateString('pt-BR'),
            image: image,
            views: 0,
            comments: 0
        };
        
        NEWS_DATABASE.news.unshift(newNews);
        
        form.reset();
        showToast('success', '<i class="fas fa-check-circle"></i> Noticia publicada com sucesso!');
        
        // Atualizar dados
        loadNewsTable();
        loadDashboard();
        loadCategories();
        
        setTimeout(() => {
            showPage('news');
        }, 1500);
    });
}

/* ============================================
   SITE CONFIG
   ============================================ */
function initSiteConfig() {
    document.getElementById('saveSiteBtn').addEventListener('click', function() {
        showToast('success', '<i class="fas fa-check-circle"></i> Configuracoes salvas com sucesso');
    });
    
    document.getElementById('saveCompanyBtn').addEventListener('click', function() {
        showToast('success', '<i class="fas fa-check-circle"></i> Contato atualizado com sucesso');
    });
    
    document.getElementById('saveAdsBtn').addEventListener('click', function() {
        const clientId = document.getElementById('adsenseClientId').value;
        if (!clientId || clientId.includes('XXXX')) {
            showToast('warning', '<i class="fas fa-exclamation-triangle"></i> Adicione seu ID real do Google AdSense');
        } else {
            showToast('success', '<i class="fas fa-check-circle"></i> AdSense configurado com sucesso');
        }
    });
}

/* ============================================
   RADIO CONFIG
   ============================================ */
function initRadioConfig() {
    const testBtn = document.getElementById('testRadioBtn');
    const resultDiv = document.getElementById('playerTestResult');
    
    testBtn.addEventListener('click', function() {
        resultDiv.innerHTML = '<span style="color:#f39c12;font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Testando conexao...</span>';
        
        const testAudio = new Audio();
        testAudio.preload = 'none';
        
        testAudio.addEventListener('canplay', function() {
            resultDiv.innerHTML = '<span style="color:#27ae60;font-size:13px;"><i class="fas fa-check-circle"></i> Transmissao encontrada e operacional!</span>';
        });
        
        testAudio.addEventListener('error', function() {
            resultDiv.innerHTML = '<span style="color:#e74c3c;font-size:13px;"><i class="fas fa-times-circle"></i> Nao foi possivel conectar. Verifique a URL.</span>';
        });
        
        testAudio.src = document.getElementById('radioUrl').value || 'https://radiojovemrio.com:8000/stream';
    });
    
    // Autoplay preference
    if (localStorage.getItem('radioAutoplay') === 'true') {
        document.getElementById('radioAutoplay').checked = true;
    }
    
    document.getElementById('radioAutoplay').addEventListener('change', function() {
        localStorage.setItem('radioAutoplay', this.checked ? 'true' : 'false');
        showToast('success', '<i class="fas fa-check-circle"></i> Preferencia de autoplay salva');
    });
}

/* ============================================
   PROFILE
   ============================================ */
function initProfile() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    
    changePasswordBtn.addEventListener('click', function() {
        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        
        if (!currentPass && !newPass) {
            showToast('warning', '<i class="fas fa-exclamation-triangle"></i> Preencha as senhas');
            return;
        }
        
        if (newPass !== confirmPass) {
            showToast('error', '<i class="fas fa-exclamation-circle"></i> As senhas nao coincidem');
            return;
        }
        
        // Em producao real, atualizar via backend
        showToast('success', '<i class="fas fa-check-circle"></i> Senha alterada com sucesso');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    });
}

/* ============================================
   LOGOUT
   ============================================ */
function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.removeItem('vvn_admin_auth');
        sessionStorage.removeItem('vvn_admin_user');
        window.location.href = 'index.html';
    });
}

/* ============================================
   TOAST
   ============================================ */
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ============================================
   PROTECAO ADICIONAL
   ============================================ */
// Bloquear clique direito em areas sensiveis
document.addEventListener('contextmenu', function(e) {
    if (window.confirm) { /* permitir */ }
});

// Protecao contra iframe
if (window.self !== window.top) {
    window.top.location = window.self.location;
}
