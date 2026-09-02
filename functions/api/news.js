/*
 * ============================================
 * VILA VALQUEIRE NEWS - Cloudflare Pages Function
 * Rota: /api/news
 *
 * Funcao AUTO-CONTIDA (nao depende do Netlify).
 * Busca noticias REAIS e atualizadas dos feeds
 * RSS de fontes confiaveis (G1, UOL) no servidor,
 * usando a Cloudflare Pages Function (onRequest).
 *
 * Sem dependencias externas (usa fetch nativo).
 * ============================================
 */

// Feeds RSS de fontes confiaveis (ordem = prioridade)
// O G1 usa o formato dynamo (rss2.xml). As URLs antigas (*.ghtml feed)
// voltam HTML e nao funcionam mais.
// Notas: fontes de politica nacional foram removidas a pedido do cliente.
// O foco e nas noticias do Rio de Janeiro (G1 Rio vem primeiro).
const SOURCES = [
    { name: 'G1 Rio de Janeiro', short: 'G1', fallbackCat: 'comunidade', isRioFeed: true,
      url: 'https://g1.globo.com/dynamo/rj/rio-de-janeiro/rss2.xml' },
    { name: 'G1 Educação', short: 'G1', fallbackCat: 'educacao',
      url: 'https://g1.globo.com/dynamo/educacao/rss2.xml' },
    { name: 'G1 Esporte', short: 'G1', fallbackCat: 'esportes',
      url: 'https://g1.globo.com/dynamo/esporte/rss2.xml' },
    { name: 'UOL Esporte', short: 'UOL', fallbackCat: 'esportes',
      url: 'https://rss.uol.com.br/feed/esporte.xml' }
];

// Palavras-chave do Rio de Janeiro
const RIO_KEYWORDS = [
    'rio de janeiro', 'rio', 'rj', 'cidade do rio', 'fluminense',
    'flamengo', 'vasco', 'botafogo', 'zona oeste', 'zona norte',
    'zona sul', 'jacarepagua', 'cascadura', 'madureira', 'campo grande',
    'bangu', 'realengo', 'padre miguel', 'bento ribeiro', 'maré',
    'rocinha', 'caxias', 'niteroi', 'gardênia'
];

// Palavras-chave do bairro (prioridade maxima)
const BAIRRO_KEYWORDS = ['vila valqueire', 'largo da vila'];

// Palavras-chave por categoria
const CATEGORY_KEYWORDS = {
    politica: ['prefeitura', 'vereador', 'camara', 'governo', 'secretaria', 'político', 'eleições', 'prefeito', 'dória', 'lula', 'bolsonaro'],
    seguranca: ['polícia', 'polícia', 'policia', 'prisão', 'preso', 'roubo', 'ladrão', 'delegacia', 'crime', 'violência', 'milícia', 'tiros', 'assassinato', 'morto'],
    saude: ['saúde', 'hospital', 'posto de saúde', 'ubs', 'vacina', 'dengue', 'covid', 'sus', 'médicos', 'médico', 'clínica'],
    educacao: ['escola', 'educação', 'aluno', 'professor', 'universidade', 'colégio', 'enem', 'faculdade'],
    cultura: ['cultura', 'show', 'arte', 'museu', 'cinema', 'teatro', 'livro', 'festa', 'festival', 'exposição'],
    esportes: ['futebol', 'time', 'campeonato', 'jogo', 'gol', 'clube', 'jogador', 'esporte', 'partida', 'final', 'brasileirão', 'copa'],
    economia: ['economia', 'emprego', 'mercado', 'empresa', 'dinheiro', 'preço', 'inflação', 'negócio', 'loja', 'mercado financeiro', 'ibovespa'],
    comunidade: ['comunidade', 'moradores', 'obra', 'rua', 'trânsito', 'asfalto', 'luz', 'iluminação', 'metrô', 'via', 'avenida']
};

export async function onRequest(context) {
    const url = new URL(context.request.url);

    // Configuracoes CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
    };

    // Preflight CORS
    if (context.request.method === 'OPTIONS') {
        return new Response('OK', { status: 200, headers });
    }

    // Parametro opcional de categoria: /api/news?cat=politica
    let categoryFilter = null;
    const cat = url.searchParams.get('cat');
    if (cat && Object.keys(CATEGORY_KEYWORDS).indexOf(cat.toLowerCase()) !== -1) {
        categoryFilter = cat.toLowerCase();
    }

    try {
        const allNews = [];

        // Tenta cada fonte em paralelo (com timeout interno)
        const fetchPromises = SOURCES.map(async (source, index) => {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);
                const res = await fetch(source.url, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (VilaValqueireNews bot; +https://www.vilavalqueirenews.com.br)',
                        'Accept': 'application/xml,text/xml,application/rss+xml;q=0.9,*/*;q=0.8'
                    }
                });
                clearTimeout(timeout);

                if (!res.ok) throw new Error('HTTP ' + res.status);
                const xml = await res.text();

                const items = parseRss(xml);
                items.forEach(item => {
                    if (!item.title) return;
                    const newsObj = buildNews(item, source, index);
                    if (categoryFilter && newsObj.category !== categoryFilter) return;
                    allNews.push(newsObj);
                });
            } catch (e) {
                console.error('Falha na fonte', source.name, e.message);
            }
        });

        await Promise.all(fetchPromises);

        // Prioriza bairro > Rio > gerais; depois ordena por data (mais recente)
        allNews.sort((a, b) => {
            if (a.isBairro !== b.isBairro) return a.isBairro ? -1 : 1;
            if (a.isRio !== b.isRio) return a.isRio ? -1 : 1;
            return (b.pubTs || 0) - (a.pubTs || 0);
        });

        return new Response(
            JSON.stringify({ status: 'ok', count: allNews.length, items: allNews }),
            { status: 200, headers }
        );
    } catch (err) {
        console.error('Erro geral:', err);
        return new Response(
            JSON.stringify({ status: 'error', message: err.message, items: [] }),
            { status: 500, headers }
        );
    }
}

// Converte a resposta do servico web para JSON limpo
function buildNews(item, source, sourceIndex) {
    const rawDesc = String(item.description || item.contentSnippet || '');
    const title = cleanHtml(item.title || '');
    const description = cleanHtml(rawDesc || title);
    const text = (title + ' ' + description).toLowerCase();

    let content = cleanHtml(item.content || rawDesc || description);
    if (!content || content.length < 30) {
        content = description.length > 30 ? description : (title + '. Leia a materia completa na fonte original.');
    }

    const pubTs = parseDate(item.pubDate || item.isoDate || '') || 0;
    const guid = cleanUrl(item.guid || '');
    let link = cleanUrl(item.link || '');
    const image = resolveImage(item, rawDesc, guessCategory(text, source.fallbackCat));

    // Se o link estiver vazio, usa o guid quando parecer uma URL real
    if (!link && /^https?:\/\//i.test(guid)) {
        link = guid;
    }

    return {
        id: 'src' + sourceIndex + '_' + (guid || link || Math.random().toString(36).slice(2, 8)),
        title: title,
        excerpt: description,
        content: content,
        category: guessCategory(text, source.fallbackCat),
        time: formatTime(pubTs),
        date: formatDate(pubTs),
        image: image,
        views: (Math.floor(Math.random() * 50) + 1),
        comments: 0,
        source: source.short,
        sourceName: source.name,
        sourceUrl: link,
        isReal: true,
        isRio: source.isRioFeed || matchesAny(text, RIO_KEYWORDS),
        isBairro: matchesAny(text, BAIRRO_KEYWORDS),
        pubTs: pubTs
    };
}

// Resolve a imagem da noticia: enclosure > <img> do description > placeholder
function resolveImage(item, rawDesc, category) {
    if (item.enclosure && item.enclosure.url) {
        const enc = cleanUrl(item.enclosure.url);
        if (enc) return enc;
    }
    // Alguns feeds (ex: UOL) colocam a imagem como <img> dentro do description
    const imgMatch = /<img[^>]+src=["']([^"']+)["']/i.exec(rawDesc);
    if (imgMatch && imgMatch[1] && /^https?:\/\//i.test(imgMatch[1])) {
        return cleanUrl(imgMatch[1]);
    }
    // Fallback: imagem generica por categoria
    return placeholderFor(category);
}

function placeholderFor(category) {
    const map = {
        politica: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=450&fit=crop',
        seguranca: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&h=450&fit=crop',
        saude: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=450&fit=crop',
        educacao: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=450&fit=crop',
        cultura: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=450&fit=crop',
        esportes: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=450&fit=crop',
        economia: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=450&fit=crop',
        comunidade: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=450&fit=crop'
    };
    return map[category] || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop';
}

// Parseia data em varios formatos comuns de RSS (cobre o padrao "Ter, 01 Set 2026 11:58:57 -0300")
function parseDate(str) {
    if (!str) return 0;
    const raw = String(str).replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
    const ts = Date.parse(raw);
    if (!isNaN(ts)) return ts;
    // Fallback manual para "Seg, 31 Ago 2026 16:23:05 -0300"
    const m = /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(raw);
    if (m) {
        let dd = parseInt(m[1], 10), mm = parseInt(m[2], 10), yyyy = parseInt(m[3], 10);
        if (yyyy < 100) yyyy += 2000;
        const hh = parseInt(m[4] || 0, 10), mi = parseInt(m[5] || 0, 10), ss = parseInt(m[6] || 0, 10);
        const d = new Date(yyyy, mm - 1, dd, hh, mi, ss);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    }
    return 0;
}

// Parseia XML RSS e Atom de forma simples sem dependencias
function parseRss(xml) {
    const items = [];

    // captura cada <item> (RSS) ou <entry> (Atom)
    const itemRegex = /<(?:item|entry)[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
    let m;
    while ((m = itemRegex.exec(xml)) !== null) {
        const block = m[1];
        items.push({
            title: extractTag(block, 'title'),
            description: extractTag(block, 'description'),
            content: extractTag(block, 'content:encoded') || extractTag(block, 'content'),
            contentSnippet: extractTag(block, 'description'),
            link: extractLink(block),
            pubDate: extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated'),
            guid: extractTag(block, 'guid') || extractTag(block, 'id'),
            enclosure: extractEnclosure(block)
        });
    }
    return items;

    function extractLink(block) {
        const direct = extractTag(block, 'link');
        // Atom usa <link href="...">
        const atomHref = /<link[^>]+href="([^"]+)"/i.exec(block);
        return direct || (atomHref ? atomHref[1] : '');
    }

    function extractEnclosure(block) {
        // <enclosure url="..." type="image/*">
        const enc = /<enclosure[^>]+url="([^"]+)"[^>]*type="image\/([^"]+)"/i.exec(block);
        if (enc) return { url: enc[1], type: enc[2] };
        // Atom <media:thumbnail url="...">
        const media = /<media:thumbnail[^>]+url="([^"]+)"|url="([^"]+)"[^>]*medium="image"/i.exec(block);
        if (media && media[1]) return { url: media[1], type: 'image' };
        return null;
    }
}

function extractTag(block, tag) {
    // captura conteudo dentro de <tag>...</tag> ou auto-fechamento
    const openRe = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i');
    const m = openRe.exec(block);
    if (m) return m[1].trim();
    return '';
}

// Limpa URL: remove CDATA, espacos e quebras de linha, decodifica entidades
function cleanUrl(u) {
    return String(u || '')
        .replace(/<!\[CDATA\[/g, '')
        .replace(/\]\]>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, '')
        .trim();
}

// Limpa HTML e decodifica entidades.
// IMPORTANTE: remove CDATA e entidades ANTES das tags HTML.
function cleanHtml(html) {
    return String(html || '')
        .replace(/<!\[CDATA\[/g, '')
        .replace(/\]\]>/g, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#8230;/g, '...')
        .replace(/\s+/g, ' ')
        .trim();
}

function guessCategory(text, fallback) {
    for (const cat in CATEGORY_KEYWORDS) {
        for (let i = 0; i < CATEGORY_KEYWORDS[cat].length; i++) {
            if (text.indexOf(CATEGORY_KEYWORDS[cat][i].toLowerCase()) !== -1) {
                return cat;
            }
        }
    }
    return fallback || 'comunidade';
}

function matchesAny(text, keywords) {
    for (let i = 0; i < keywords.length; i++) {
        if (text.indexOf(keywords[i].toLowerCase()) !== -1) {
            return true;
        }
    }
    return false;
}

// "Há X horas/min" a partir do timestamp (ms)
function formatTime(ts) {
    if (!ts) return 'Agora';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Agora';
    if (diff < 3600) return 'Há ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'Há ' + Math.floor(diff / 3600) + ' h';
    if (diff < 604800) return 'Há ' + Math.floor(diff / 86400) + ' dia(s)';
    return formatDate(ts);
}

function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return (d.getDate()) + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
}
