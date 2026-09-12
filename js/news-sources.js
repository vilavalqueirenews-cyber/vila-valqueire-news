/* ============================================
   VILA VALQUEIRE NEWS - Fontes de Noticias Reais
   Busca noticias atualizadas de fontes confiaveis
   via feeds RSS (G1, UOL, etc.)
   ============================================ */

// Conversor RSS -> JSON (resolve problemas de CORS)
// Servico gratuito com limite, usado como proxy
const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Feeds RSS de fontes reais e confiaveis
// O G1 usa o formato dynamo (rss2.xml). As URLs antigas (*.ghtml feed)
// voltam HTML e nao funcionam mais.
// Notas: fontes de politica nacional foram removidas a pedido do cliente.
// O foco e nas noticias do Rio de Janeiro (G1 Rio vem primeiro).
const NEWS_SOURCES = [
    {
        name: 'G1 Rio de Janeiro',
        shortName: 'G1',
        url: 'https://g1.globo.com/dynamo/rj/rio-de-janeiro/rss2.xml',
        categoryGuess: 'comunidade',
        regionTags: ['rio de janeiro', 'bairro', 'vila valqueire', 'rj', 'zona oeste']
    },
    {
        name: 'G1 Política',
        shortName: 'G1',
        url: 'https://g1.globo.com/dynamo/politica/rss2.xml',
        categoryGuess: 'politica',
        isNational: true,
        regionTags: []
    },
    {
        name: 'G1 Mundo',
        shortName: 'G1',
        url: 'https://g1.globo.com/dynamo/mundo/rss2.xml',
        categoryGuess: 'politica',
        isNational: true,
        regionTags: []
    },
    {
        name: 'G1 Economia',
        shortName: 'G1',
        url: 'https://g1.globo.com/dynamo/economia/rss2.xml',
        categoryGuess: 'economia',
        forceCategory: 'economia',
        regionTags: []
    },
    {
        name: 'G1 Saúde',
        shortName: 'G1',
        url: 'https://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml',
        categoryGuess: 'saude',
        forceCategory: 'saude',
        regionTags: []
    },
    {
        name: 'G1 Cultura',
        shortName: 'G1',
        url: 'https://g1.globo.com/dynamo/pop-arte/rss2.xml',
        categoryGuess: 'cultura',
        forceCategory: 'cultura',
        regionTags: []
    },
    {
        name: 'G1 Educação',
        shortName: 'G1',
        url: 'https://g1.globo.com/dynamo/educacao/rss2.xml',
        categoryGuess: 'educacao',
        forceCategory: 'educacao',
        regionTags: []
    },
    {
        name: 'UOL Esporte',
        shortName: 'UOL',
        url: 'https://rss.uol.com.br/feed/esporte.xml',
        categoryGuess: 'esportes',
        forceCategory: 'esportes',
        regionTags: []
    }
];

// Palavras-chave que indicam que a noticia e do Rio de Janeiro
const RIO_KEYWORDS = [
    'rio de janeiro', 'rio', 'RJ', 'cidade do rio', 'fluminense',
    'flamengo', 'vasco', 'botafogo', 'zona oeste', 'zona norte',
    'zona sul', 'jacarepagua', 'cascadura', 'madureira', 'campo grande',
    'bangu', 'realengo', 'padre miguel', 'vila valqueire', 'bento ribeiro'
];

// Palavras-chave do bairro especificamente (prioridade maxima)
const BAIRRO_KEYWORDS = [
    'vila valqueire', 'mistura valqueire', 'largo da vila'
];

// Palavras-chave para detectar categoria da noticia
const CATEGORY_KEYWORDS = {
    politica: ['prefeitura', 'vereador', 'camara', 'governo', 'secretaria', 'politico', 'eleicoes', 'lula', 'prefeito'],
    seguranca: ['polícia', 'policia', 'prisao', 'preso', 'roubo', 'ladrao', 'milico', 'delegacia', 'crime', 'seguranca', 'violencia'],
    saude: ['saude', 'hospital', 'posto de saude', 'ubs', 'vacina', 'dengue', 'covid', 'sus', 'medicos', 'medico'],
    educacao: ['escola', 'educacao', 'aluno', 'professor', 'universidade', 'colégio', 'colegio', 'enem', 'faculdade'],
    cultura: ['cultura', 'show', 'arte', 'museu', 'cinema', 'teatro', 'livro', 'festa', 'festival', 'exposicao'],
    esportes: ['futebol', 'time', 'campeonato', 'jogo', 'gol', 'clube', 'jogador', 'esporte', 'partida', 'final'],
    economia: ['economia', 'emprego', 'mercado', 'empresa', 'dinheiro', 'preco', 'inflacao', 'negocio', 'loja'],
    comunidade: ['comunidade', 'moradores', 'obra', 'rua', 'transito', 'asfalto', 'luz', 'iluminacao']
};
