/* ============================================
   VILA VALQUEIRE NEWS - JavaScript Principal
   JSMuniz Publicidade
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos os modulos
    initDateTime();
    initWeather();
    initNews();
    initRadio();
    initRadioFloat();
    initNavigation();
    initSearch();
    initScrollTop();
    initStickyAd();
    initAdsFallback();
    initAdSlider();

    // Atualizacao automatica das noticias (sem precisar de F5)
    // Busca novas noticias reais a cada 60 segundos enquanto a pagina esta aberta
    setInterval(function() {
        try {
            // A aba "Rio de Janeiro" (politica) busca todas e filtra por isRio no cliente
            const apiUrl = '/api/news' + (currentCategory !== 'todas' && currentCategory !== 'politica' ? '?cat=' + encodeURIComponent(currentCategory) : '');
            fetch(apiUrl, { cache: 'no-store' })
                .then(function(res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(function(data) {
                    if (data.status !== 'ok' || !data.items || data.items.length === 0) return;
                    const collected = data.items.map(function(item) {
                        item.isReal = true;
                        item.categoryLabel = NEWS_CATEGORIES[item.category] || 'Noticias';
                        if (!item.time) item.time = 'Agora';
                        if (!item.views) item.views = 1;
                        return item;
                    });
                    const target = currentCategory !== 'todas' ? currentCategory : null;
                    if (collected.length > 0) {
                        if (collected.length >= NEWS_PER_PAGE) {
                            ACTIVE_NEWS = collected;
                        } else {
                            let localNews = NEWS_DATABASE.news.filter(function(n) { return n.category !== 'politica'; });
                            if (target) localNews = localNews.filter(function(n) { return n.category === target; });
                            ACTIVE_NEWS = collected.concat(localNews);
                        }
                        refreshNewsDisplay();
                    }
                })
                .catch(function() {});
        } catch (e) {}
    }, 60000);
});

/* ============================================
   RELOGIO E DATA
   ============================================ */
function initDateTime() {
    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');

    function updateClock() {
        const now = new Date();
        const days = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'];
        const months = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');

        dateElement.textContent = `${dayName}, ${day} de ${month} de ${year}`;
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* ============================================
   CLIMA (Open-Meteo API - Gratis sem chave)
   Lat: -22.9111, Lon: -43.3406 (Vila Valqueire)
   ============================================ */
function initWeather() {
    const lat = -22.9111;
    const lon = -43.3406;
    
    const weatherText = document.getElementById('weatherText');
    const tempDisplay = document.getElementById('tempDisplay');
    const weatherTempBig = document.getElementById('weatherTempBig');
    const weatherDescBig = document.getElementById('weatherDescBig');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const visibility = document.getElementById('visibility');
    const weatherIcon = document.getElementById('weatherIcon');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=America%2FSao_Paulo`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temp = Math.round(data.current.temperature_2m);
            const humidityValue = data.current.relative_humidity_2m;
            const windValue = Math.round(data.current.wind_speed_10m);
            const weatherCode = data.current.weather_code;

            const weatherInfo = weatherCodeToInfo(weatherCode);
            
            weatherText.textContent = weatherInfo.text + ', ' + data.current.time.split('T')[0];
            tempDisplay.textContent = temp + '°C';
            weatherTempBig.textContent = temp + '°C';
            weatherDescBig.textContent = weatherInfo.text;
            humidity.textContent = humidityValue + '%';
            wind.textContent = windValue + ' km/h';
            const visibilityKm = (weatherCode === 0 ? 10 : weatherCode <= 2 ? 7 : 5);
            visibility.textContent = visibilityKm + ' km';
            weatherIcon.className = 'fas ' + weatherInfo.icon + ' weather-icon';
        })
        .catch(error => {
            console.error('Erro ao carregar clima:', error);
            weatherText.textContent = 'Clima indisponivel';
            weatherTempBig.textContent = '--°C';
            weatherDescBig.textContent = 'Vila Valqueire, RJ';
            humidity.textContent = '--%';
            wind.textContent = '-- km/h';
        });
}

function weatherCodeToInfo(code) {
    const weatherMap = {
        0: { text: 'Ceu limpo', icon: 'fa-sun' },
        1: { text: 'Parcialmente nublado', icon: 'fa-cloud-sun' },
        2: { text: 'Nublado', icon: 'fa-cloud' },
        3: { text: 'Nublado', icon: 'fa-cloud' },
        45: { text: 'Nevoeiro', icon: 'fa-smog' },
        48: { text: 'Nevoeiro', icon: 'fa-smog' },
        51: { text: 'Garoa', icon: 'fa-cloud-rain' },
        53: { text: 'Garoa', icon: 'fa-cloud-rain' },
        55: { text: 'Garoa intensa', icon: 'fa-cloud-showers-heavy' },
        61: { text: 'Chuva leve', icon: 'fa-cloud-rain' },
        63: { text: 'Chuva', icon: 'fa-cloud-showers-heavy' },
        65: { text: 'Chuva forte', icon: 'fa-cloud-showers-heavy' },
        71: { text: 'Neve', icon: 'fa-snowflake' },
        80: { text: 'Pancadas de chuva', icon: 'fa-cloud-showers-heavy' },
        95: { text: 'Tempestade', icon: 'fa-cloud-bolt' }
    };
    return weatherMap[code] || { text: 'Clima', icon: 'fa-cloud' };
}

/* ============================================
   NOTICIAS
   ============================================ */
let currentCategory = 'todas';
let newsLoadedCount = 0;
const NEWS_PER_PAGE = 6;

// Buffer de noticias em exibicao (reais quando disponiveis, locais como fallback)
let ACTIVE_NEWS = [];

function initNews() {
    // Carregar noticias locais imediatamente (fallback)
    ACTIVE_NEWS = NEWS_DATABASE.news.slice();
    loadFeaturedNews();
    loadNewsGrid(NEWS_PER_PAGE);
    loadMostRead();

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', function() {
        newsLoadedCount += NEWS_PER_PAGE;
        loadNewsGrid(newsLoadedCount, true);
        
        if (newsLoadedCount >= getFilteredNews().length) {
            loadMoreBtn.style.display = 'none';
        }
    });

    // Buscar noticias REAIS e atualizadas de fontes confiaveis
    fetchRealNews();
}

// Busca noticias reais e atualizadas de fontes (G1, UOL, etc.)
// Procedimento:
//  1. Tenta a Netlify Function (roda no servidor, sem CORS) - caminho /api/news
//  2. Se falhar (ex.: preview local sem Netlify), usa rss2json como fallback
function fetchRealNews() {
    // A aba "Rio de Janeiro" (politica) busca todas e filtra por isRio no cliente
    const targetCategory = currentCategory !== 'todas' && currentCategory !== 'politica' ? currentCategory : null;

    // 1. Tenta a Netlify Function primeiro
    const apiUrl = '/api/news' + (targetCategory ? '?cat=' + encodeURIComponent(currentCategory) : '');
    fetch(apiUrl, { cache: 'no-store' })
        .then(function(res) {
            if (!res.ok) throw new Error('Funcao indisponivel HTTP ' + res.status);
            return res.json();
        })
        .then(function(data) {
            if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                throw new Error('Sem noticias da funcao');
            }
            // Itens ja vem prontos da funcao (buildNews feito no servidor)
            const collected = data.items.map(function(item) {
                item.isReal = true;
                item.categoryLabel = NEWS_CATEGORIES[item.category] || 'Noticias';
                if (!item.time) item.time = 'Agora';
                if (!item.views) item.views = 1;
                return item;
            });
            finalizeRealNews(collected, targetCategory);
        })
        .catch(function(err) {
            console.warn('Netlify Function indisponivel, usando rss2json fallback:', err);
            fetchRealNewsFallback(targetCategory);
        });
}

// Fallback usando rss2json (funciona em preview local sem Netlify)
function fetchRealNewsFallback(targetCategory) {
    let done = 0;
    const collected = [];

    NEWS_SOURCES.forEach(function(source, idx) {
        const rssUrl = RSS_PROXY + encodeURIComponent(source.url);
        fetch(rssUrl, { cache: 'no-store' })
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function(data) {
                if (data.status !== 'ok' || !data.items) throw new Error('Feed invalido');
                data.items.forEach(function(item) {
                    if (item.title === '') return;
                    const newsObj = buildNewsFromSource(item, source, idx);
                    if (targetCategory && newsObj.category !== targetCategory) return;
                    collected.push(newsObj);
                });
            })
            .catch(function(err) {
                console.warn('Falha na fonte', source.name, err);
            })
            .finally(function() {
                done++;
                if (done === NEWS_SOURCES.length) {
                    finalizeRealNews(collected, targetCategory);
                }
            });
    });
}

// Converte item de RSS para formato interno da noticia
function buildNewsFromSource(item, source, sourceIndex) {
    const title = cleanHtml(item.title || '');
    const description = cleanHtml(item.description || item.content || title);
    const link = item.link || '';
    const pubDate = item.pubDate || '';
    const thumb = item.thumbnail || '';

    const isRio = isRioNews(title + ' ' + description);
    const isBairro = isBairroNews(title + ' ' + description);
    const category = guessCategory(title + ' ' + description, source.categoryGuess);

    let content = description;
    if (content.length < 30) content = description + ' Leia a materia completa na fonte.';

    return {
        id: 'src_' + sourceIndex + '_' + (item.guid || Math.random().toString(36).slice(2, 8)),
        title: title,
        excerpt: description,
        content: content,
        category: category,
        categoryLabel: NEWS_CATEGORIES[category] || source.categoryGuess || 'Noticias',
        time: formatPubDate(pubDate),
        date: formatDateOnly(pubDate),
        image: thumb && thumb !== '' ? thumb : getPlaceholderImage(category),
        comments: 0,
        views: Math.floor(Math.random() * 20) + 1,
        source: source.shortName || source.name,
        sourceName: source.name,
        sourceUrl: link,
        isReal: true,
        isRio: isRio,
        isBairro: isBairro
    };
}

// Decide a categoria da noticia a partir do texto
function guessCategory(text, fallback) {
    const lower = text.toLowerCase();
    for (const cat in CATEGORY_KEYWORDS) {
        for (let i = 0; i < CATEGORY_KEYWORDS[cat].length; i++) {
            if (lower.indexOf(CATEGORY_KEYWORDS[cat][i]) !== -1) {
                return cat;
            }
        }
    }
    return fallback || 'politica';
}

// Verifica se a noticia fala do Rio de Janeiro
function isRioNews(text) {
    const lower = text.toLowerCase();
    for (let i = 0; i < RIO_KEYWORDS.length; i++) {
        if (lower.indexOf(RIO_KEYWORDS[i].toLowerCase()) !== -1) {
            return true;
        }
    }
    return false;
}

// Verifica se fala especificamente do bairro Vila Valqueire
function isBairroNews(text) {
    const lower = text.toLowerCase();
    for (let i = 0; i < BAIRRO_KEYWORDS.length; i++) {
        if (lower.indexOf(BAIRRO_KEYWORDS[i].toLowerCase()) !== -1) {
            return true;
        }
    }
    return false;
}

// Limpa tags HTML e entidades
function cleanHtml(html) {
    return String(html)
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

// Formata a data do RSS para "ha X horas"
function formatPubDate(pubDate) {
    if (!pubDate) return 'Agora';
    try {
        const d = new Date(pubDate);
        if (isNaN(d.getTime())) return 'Agora';
        const diff = Math.floor((Date.now() - d.getTime()) / 1000);
        if (diff < 60) return 'Agora';
        if (diff < 3600) return 'Ha ' + Math.floor(diff / 60) + ' min';
        if (diff < 86400) return 'Ha ' + Math.floor(diff / 3600) + ' hora(s)';
        if (diff < 604800) return 'Ha ' + Math.floor(diff / 86400) + ' dia(s)';
        return formatDateOnly(pubDate);
    } catch (e) {
        return 'Agora';
    }
}

// Formata apenas a data (DD/MM/AAAA)
function formatDateOnly(pubDate) {
    try {
        const d = new Date(pubDate);
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    } catch (e) {
        return '';
    }
}

// Imagem de placeholder por categoria (caso o feed nao traga thumbnail)
function getPlaceholderImage(category) {
    const images = {
        politica: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=300&fit=crop',
        seguranca: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=300&fit=crop',
        saude: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop',
        educacao: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop',
        cultura: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
        esportes: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop',
        economia: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
        comunidade: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop'
    };
    return images[category] || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop';
}

// Finaliza: junta noticias reais com locais (reais na frente, priorizando bairro/Rio)
// As noticias de politica foram removidas do site a pedido (nao aparecem nem como reserva).
function finalizeRealNews(collected, targetCategory) {
    // Se nao foram carregadas noticias reais, mantem as locais (sem politica)
    if (collected.length === 0) {
        if (currentCategory !== 'todas') {
            ACTIVE_NEWS = NEWS_DATABASE.news.filter(function(n) {
                return n.category === currentCategory && n.category !== 'politica';
            });
        } else {
            ACTIVE_NEWS = NEWS_DATABASE.news.filter(function(n) {
                return n.category !== 'politica';
            });
        }
        refreshNewsDisplay();
        return;
    }

    // Prioriza noticias do bairro, depois do Rio, depois gerais
    collected.sort(function(a, b) {
        if (a.isBairro !== b.isBairro) return a.isBairro ? -1 : 1;
        if (a.isRio !== b.isRio) return a.isRio ? -1 : 1;
        return 0;
    });

    // Mostra SOMENTE as noticias reais. As noticias de exemplo (locais) entram
    // apenas como reserva quando houver menos de 6 reais (para nao deixar a
    // pagina vazia). Reais sempre em primeiro lugar.
    if (collected.length >= NEWS_PER_PAGE) {
        ACTIVE_NEWS = collected;
    } else {
        let localNews = NEWS_DATABASE.news.filter(function(n) { return n.category !== 'politica'; });
        if (targetCategory) {
            localNews = localNews.filter(function(n) { return n.category === targetCategory; });
        }
        ACTIVE_NEWS = collected.concat(localNews);
    }

    refreshNewsDisplay();
}

// Atualiza a interface com as noticias ativas
function refreshNewsDisplay() {
    newsLoadedCount = NEWS_PER_PAGE;
    loadNewsGrid(NEWS_PER_PAGE);
    loadMostRead();
}

// Retorna as noticias conforme a categoria atual
function getFilteredNews() {
    if (currentCategory === 'todas') {
        return ACTIVE_NEWS;
    }
    // A aba "politica" exibe as noticias do Rio de Janeiro (G1 Rio), atualizadas
    if (currentCategory === 'politica') {
        return ACTIVE_NEWS.filter(n => n.isRio === true || n.category === 'comunidade');
    }
    return ACTIVE_NEWS.filter(n => n.category === currentCategory);
}

function loadFeaturedNews() {
    // Se houver noticias reais, usa a primeira (prioridade bairro/Rio) como destaque
    let featured = null;
    if (ACTIVE_NEWS.length > 0) {
        const realFeatured = ACTIVE_NEWS.find(function(n) { return n.isReal === true; });
        if (realFeatured) {
            featured = realFeatured;
        }
    }
    if (!featured) {
        featured = NEWS_DATABASE.featured;
    }
    
    document.getElementById('featuredImg').src = featured.image;
    document.getElementById('featuredImg').alt = featured.title;
    document.getElementById('featuredCategory').textContent = featured.categoryLabel;
    document.getElementById('featuredTime').innerHTML = '<i class="fas fa-clock"></i> ' + featured.time;
    document.getElementById('featuredTitle').textContent = featured.title;
    document.getElementById('featuredExcerpt').textContent = featured.excerpt;
    
    document.querySelector('.featured-news').addEventListener('click', function() {
        openNewsArticle(featured);
    });
}

function loadNewsGrid(count, append = false) {
    const newsGrid = document.getElementById('newsGrid');
    const filteredNews = getFilteredNews();
    
    if (!append) {
        newsLoadedCount = count;
        newsGrid.innerHTML = '';
        count = Math.min(count, filteredNews.length);
    } else {
        count = Math.min(count, filteredNews.length);
    }

    if (filteredNews.length === 0) {
        newsGrid.innerHTML = '<div class="no-news">Nenhuma noticia encontrada nesta categoria.</div>';
        return;
    }

    const newsToLoad = filteredNews.slice(newsLoadedCount - count, newsLoadedCount);

    newsToLoad.forEach((news, index) => {
        const card = document.createElement('article');
        card.className = 'news-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="news-card-image" style="background: ${getCategoryGradient(news.category)}">
                <img src="${news.image}" alt="${news.title}" loading="lazy">
                <span class="news-card-category">${news.categoryLabel}</span>
            </div>
            <div class="news-card-body">
                <div class="news-card-meta">
                    <span><i class="fas fa-clock"></i> ${news.time}</span>
                    <span><i class="fas fa-eye"></i> ${formatViews(news.views)}</span>
                </div>
                <h3>${news.title}</h3>
                <p>${news.excerpt}</p>
                ${news.isReal ? `<span class="news-source-tag"><i class="fas fa-external-link-alt"></i> Fonte: ${news.sourceName || news.source}</span>` : ''}
            </div>
        `;
        card.addEventListener('click', function() {
            if (news.isReal && news.sourceUrl) {
                window.open(news.sourceUrl, '_blank', 'noopener,noreferrer');
            } else {
                openNewsArticle(news);
            }
        });
        newsGrid.appendChild(card);
    });

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (newsLoadedCount >= filteredNews.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
}

function getCategoryGradient(category) {
    const gradients = {
        politica: 'linear-gradient(135deg, #2c3e50, #34495e)',
        seguranca: 'linear-gradient(135deg, #c0392b, #e74c3c)',
        saude: 'linear-gradient(135deg, #16a085, #1abc9c)',
        educacao: 'linear-gradient(135deg, #2980b9, #3498db)',
        cultura: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
        esportes: 'linear-gradient(135deg, #27ae60, #2ecc71)',
        economia: 'linear-gradient(135deg, #d35400, #e67e22)',
        comunidade: 'linear-gradient(135deg, #7f8c8d, #95a5a6)'
    };
    return gradients[category] || 'linear-gradient(135deg, #667eea, #764ba2)';
}

function loadMostRead() {
    const mostReadList = document.getElementById('mostReadList');
    const source = (ACTIVE_NEWS && ACTIVE_NEWS.length > 0) ? ACTIVE_NEWS : NEWS_DATABASE.news;
    const sorted = [...source].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    
    mostReadList.innerHTML = '';
    sorted.forEach((news, index) => {
        const item = document.createElement('div');
        item.className = 'most-read-item';
        item.innerHTML = `
            <span class="most-read-number">${index + 1}</span>
            <div class="most-read-text">
                ${news.title}
                <small><i class="fas fa-clock"></i> ${news.time}${news.isReal ? ' · ' + (news.source || '') : ''}</small>
            </div>
        `;
        item.addEventListener('click', function() {
            if (news.isReal && news.sourceUrl) {
                window.open(news.sourceUrl, '_blank', 'noopener,noreferrer');
            } else {
                openNewsArticle(news);
            }
        });
        mostReadList.appendChild(item);
    });
}

function formatViews(views) {
    if (views >= 1000) return (views / 1000).toFixed(1) + 'k';
    return views.toString();
}

function openNewsArticle(news) {
    const modal = createNewsModal(news);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('modal-open');
    }, 50);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            modal.classList.remove('modal-open');
            setTimeout(() => modal.remove(), 300);
            document.body.style.overflow = '';
        }
    });
    
    document.body.style.overflow = 'hidden';
}

function createNewsModal(news) {
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.innerHTML = `
        <div class="news-modal-content">
            <button class="modal-close"><i class="fas fa-times"></i></button>
            <div class="modal-image" style="background: ${getCategoryGradient(news.category)}">
                <img src="${news.image}" alt="${news.title}">
                <span class="news-modal-category">${news.categoryLabel}</span>
            </div>
            <div class="modal-body">
                <div class="modal-meta">
                    <span><i class="fas fa-clock"></i> ${news.time}</span>
                    <span><i class="fas fa-calendar"></i> ${news.date || 'Nao informado'}</span>
                </div>
                <h2>${news.title}</h2>
                <div class="modal-content-text">
                    <p>${news.content || news.excerpt}</p>
                </div>
                <div class="modal-actions">
                    <button class="share-btn facebook"><i class="fab fa-facebook-f"></i> Compartilhar</button>
                    <button class="share-btn whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</button>
                    <button class="share-btn twitter"><i class="fab fa-x-twitter"></i> Compartilhar</button>
                </div>
                <div class="ad-label">Publicidade</div>
                <div class="ad-container modal-ad">
                    <div class="ad-fallback">
                        <div class="ad-fallback-content">
                            <span class="ad-tag">PUBLICIDADE</span>
                            <p><strong>JSMuniz Publicidade</strong> | Vila Valqueire - RJ</p>
                            <p class="ad-contact"><i class="fas fa-phone"></i> (21) 2453-4420</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return modal;
}

/* ============================================
   RADIO JOVEM RIO
   ============================================ */
function initRadio() {
    const audio = document.getElementById('radioAudio');
    const playBtn = document.getElementById('radioPlayBtn');
    const playIcon = document.getElementById('radioPlayIcon');
    const status = document.getElementById('radioStatus');
    const volumeSlider = document.getElementById('volumeSlider');
    const visualizer = document.getElementById('radioVisualizer');
    const volumeIcon = document.getElementById('volumeIcon');

    // Configurar volume
    audio.volume = 0.8;

    // Fonte da radio (stream real do ZenoFM usado no site oficial)
    // Obs: as fontes antigas (radiojovemrio.com:8000 e stream-159.zeno.fm)
    // estavam fora do ar/erradas - o stream oficial e o abaixo.
    const streams = [
        'https://stream.zeno.fm/vu4v6xtdyy8uv',
        'http://stream.zeno.fm/vu4v6xtdyy8uv'
    ];
    let streamIndex = 0;

    async function playRadio() {
        const source = document.createElement('source');
        source.type = 'audio/mpeg';
        source.src = streams[streamIndex];
        audio.innerHTML = '';
        audio.appendChild(source);
        audio.load();
        
        try {
            await audio.play();
            playIcon.className = 'fas fa-pause';
            status.textContent = 'Ao vivo agora';
            playBtn.style.background = '#2ecc71';
            visualizer.classList.add('playing');
        } catch (error) {
            tryNextStream();
        }
    }

    function tryNextStream() {
        if (streamIndex < streams.length - 1) {
            streamIndex++;
            playRadio();
        } else {
            status.textContent = 'Falha ao conectar. Tente novamente.';
            playIcon.className = 'fas fa-play';
            playBtn.style.background = '#c0392b';
            visualizer.classList.remove('playing');
            setTimeout(resetStreams, 5000);
        }
    }

    function resetStreams() {
        streamIndex = 0;
        playIcon.className = 'fas fa-play';
        playBtn.style.background = '#c0392b';
        status.textContent = 'Clique para ouvir';
        visualizer.classList.remove('playing');
    }

    playBtn.addEventListener('click', function() {
        if (audio.paused) {
            playRadio();
        } else {
            audio.pause();
            resetStreams();
        }
    });

    volumeSlider.addEventListener('input', function() {
        audio.volume = this.value / 100;
        volumeIcon.className = this.value === '0' ? 'fas fa-volume-mute' : this.value < 50 ? 'fas fa-volume-down' : 'fas fa-volume-up';
    });

    audio.addEventListener('ended', function() {
        resetStreams();
    });

    audio.addEventListener('error', function() {
        tryNextStream();
    });

    // Tentar autoplay (apenas se permitido pelo navegador)
    // Configuracao manual desejada pelo usuario
    if (localStorage.getItem('radioAutoplay') === 'true') {
        playRadio();
    }
}

/* ============================================
   RADIO FLUTUANTE (abrir/fechar no canto)
   ============================================ */
function initRadioFloat() {
    const floatBtn = document.getElementById('radioFloatBtn');
    const panel = document.getElementById('radioFloatPanel');
    const closeBtn = document.getElementById('radioFloatClose');
    if (!floatBtn || !panel || !closeBtn) return;

    function openFloat() {
        panel.classList.add('open');
    }

    function closeFloat() {
        panel.classList.remove('open');
    }

    floatBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (panel.classList.contains('open')) {
            closeFloat();
        } else {
            openFloat();
        }
    });

    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeFloat();
    });

    // Abrir ao clicar fora
    document.addEventListener('click', function(e) {
        const el = e.target;
        if (!el.closest('#radioFloat')) {
            closeFloat();
        }
    });

    // Expoe para o slider poder abrir a radio
    window.openRadioFloat = openFloat;
}

/* ============================================
   NAVEGACAO
   ============================================ */
function initNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-links li a');

    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('open');
    });

    navLinkItems.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinkItems.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = this.getAttribute('data-category');
            document.getElementById('loadMoreBtn').style.display = 'inline-block';
            loadFeaturedNews();
            loadNewsGrid(NEWS_PER_PAGE);
            loadMostRead();
            
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('open');
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

/* ============================================
   BUSCA
   ============================================ */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = searchInput.nextElementSibling;

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            loadNewsGrid(NEWS_PER_PAGE);
            return;
        }

        const results = NEWS_DATABASE.news.filter(n => 
            n.category !== 'politica' &&
            (n.title.toLowerCase().includes(query) || 
            n.excerpt.toLowerCase().includes(query))
        );

        const newsGrid = document.getElementById('newsGrid');
        newsGrid.innerHTML = '';

        if (results.length === 0) {
            newsGrid.innerHTML = '<div class="no-news">Nenhuma noticia encontrada para: "' + query + '"</div>';
            return;
        }

        results.forEach((news, index) => {
            const card = document.createElement('article');
            card.className = 'news-card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="news-card-image" style="background: ${getCategoryGradient(news.category)}">
                    <img src="${news.image}" alt="${news.title}">
                    <span class="news-card-category">${news.categoryLabel}</span>
                </div>
                <div class="news-card-body">
                    <div class="news-card-meta">
                        <span><i class="fas fa-clock"></i> ${news.time}</span>
                        <span><i class="fas fa-eye"></i> ${formatViews(news.views)}</span>
                    </div>
                    <h3>${news.title}</h3>
                    <p>${news.excerpt}</p>
                </div>
            `;
            card.addEventListener('click', function() {
                openNewsArticle(news);
            });
            newsGrid.appendChild(card);
        });

        document.getElementById('loadMoreBtn').style.display = 'none';
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

/* ============================================
   SCROLL TO TOP
   ============================================ */
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const stickyAd = document.getElementById('stickyBottomAd');
    const closeSticky = document.getElementById('closeSticky');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    closeSticky.addEventListener('click', function() {
        stickyAd.style.display = 'none';
    });
}

/* ============================================
   STICKY AD
   ============================================ */
function initStickyAd() {
    // Mostrar sticky ad apos rolar um pouco
    const stickyAd = document.getElementById('stickyBottomAd');
    let adShown = false;

    window.addEventListener('scroll', function() {
        if (!adShown && window.scrollY > 600) {
            adShown = true;
            setTimeout(() => {
                stickyAd.style.display = 'block';
            }, 3000);
        }
    });
}

/* ============================================
   ADS FALLBACK (mostrar se AdSense falhar)
   ============================================ */
function initAdsFallback() {
    // Verificar se as propagandas do AdSense foram bloqueadas
    // Se o ADS carregar, nao precisa fazer nada
    setTimeout(function() {
        document.querySelectorAll('.ad-container').forEach(container => {
            const hasAdSense = container.querySelector('ins.adsbygoogle');
            const fallback = container.querySelector('.ad-fallback');
            
            if (hasAdSense && fallback) {
                // Deixar ambos; o AdSense vai renderizar quando aprovado
                // O fallback fica escondido atras enquanto nao aprovado
            }
        });
    }, 1000);
}

/* ============================================
   SLIDER DE PUBLICIDADE (autoplay + setas)
   ============================================ */
// Slides de anuncio. Cada slide pode ter bg (imagem) ou usar o gradiente.
// Troque o conteudo/links dos anuncios dos seus anunciantes aqui.
const AD_SLIDES = [
    {
        logo: 'JS Muniz Publicidade',
        msg: 'Divulgue a sua empresa para o bairro inteiro',
        cta: 'Anuncie aqui',
        url: 'https://wa.me/552124534420',
        slideClass: 'ad-slide-1'
    },
    {
        logo: 'Radio Jovem Rio',
        msg: 'A radio que toca no coracao de Vila Valqueire',
        cta: 'Ouvir agora',
        url: '#radio',
        slideClass: 'ad-slide-2'
    },
    {
        logo: 'Onde Viver Bem',
        msg: 'Imoveis na regiao de Vila Valqueire',
        cta: 'Ver imoveis',
        url: '#',
        slideClass: 'ad-slide-3'
    },
    {
        logo: 'Sabor da Vila',
        msg: 'Gastronomia local com entrega rapida',
        cta: 'Fazer pedido',
        url: '#',
        slideClass: 'ad-slide-4'
    },
    {
        logo: 'Auto Escola Central',
        msg: 'Habilitacao e renovacao sem complicacao',
        cta: 'Chamar no Zap',
        url: 'https://wa.me/552124534420',
        slideClass: 'ad-slide-5'
    }
];

function initAdSlider() {
    const track = document.getElementById('adSliderTrack');
    const dotsWrap = document.getElementById('adSliderDots');
    if (!track) return;

    let current = 0;

    // Cria os slides
    AD_SLIDES.forEach(function(slide, i) {
        const isRadio = slide.url === '#radio';
        const a = document.createElement('a');
        a.href = isRadio ? '#' : (slide.url || '#');
        a.className = 'ad-slide ' + slide.slideClass;
        a.setAttribute('aria-label', slide.logo);
        if (/^(https?:)?\/\//.test(a.href) || a.href === '#') {
            a.target = '_blank';
            a.rel = 'noopener';
        } else {
            a.target = '_self';
        }
        // Slide da radio: abre o player flutuante em vez de navegar
        if (isRadio) {
            a.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof window.openRadioFloat === 'function') {
                    window.openRadioFloat();
                }
            });
        }
        a.innerHTML = '<div class="ad-slide-content"><span class="ad-slide-logo">' +
            slide.logo + '</span><span class="ad-slide-msg">' + slide.msg +
            '</span><span class="ad-slide-cta">' + slide.cta + '</span></div>';
        track.appendChild(a);

        // Dots
        const dot = document.createElement('button');
        dot.className = 'ad-slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', function() {
            goTo(i);
        });
        dotsWrap.appendChild(dot);
    });

    const slides = track.querySelectorAll('.ad-slide');
    const dots = dotsWrap.querySelectorAll('.ad-slider-dot');
    if (slides.length === 0) return;

    function goTo(index) {
        current = (index + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        dots.forEach(function(d, i) {
            d.classList.toggle('active', i === current);
        });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    const nextBtn = document.getElementById('adSliderNext');
    const prevBtn = document.getElementById('adSliderPrev');
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    // Autoplay a cada 5s
    const interval = setInterval(next, 5000);

    // Pausa ao passar o mouse
    const slider = document.getElementById('adSlider');
    if (slider) {
        slider.addEventListener('mouseenter', function() { clearInterval(interval); });
        slider.addEventListener('mouseleave', function() {
            setInterval(next, 5000);
        });
    }
}
