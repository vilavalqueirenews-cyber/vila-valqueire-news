/* ============================================
   VILA VALQUEIRE NEWS - Dados de Noticias
   Banco de dados local de noticias
   ============================================ */

const NEWS_DATABASE = {
    featured: {
        id: 1,
        title: "Vila Valqueire recebe novo projeto de iluminacao LED nas ruas principais",
        excerpt: "A Prefeitura do Rio de Janeiro confirmou a instalacao de iluminacao LED nas principais vias do bairro da Vila Valqueire. O projeto visa melhorar a seguranca e reduzir o consumo energetico da regiao, com previsao de conclusao ate dezembro de 2026.",
        content: "A Secretaria Municipal de Urbanismo anunciou que as obras de substituicao da iluminacao publica no bairro da Vila Valqueire comecaram esta semana. O projeto contempla a instalacao de 350 pontos de iluminacao LED nas ruas Marechal Deodoro, Visconde de Niteroi e nas travas laterais. O investimento e de R$ 2,3 milhoes e gerara economia de 60% no consumo de energia. Moradores celebram a iniciativa que vinha sendo reivindicada ha anos.",
        category: "politica",
        categoryLabel: "Politica",
        time: "Ha 2 horas",
        date: "31/08/2026",
        image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=400&fit=crop",
        comments: 47,
        views: 1250
    },
    news: [
        {
            id: 2,
            title: "Posto de saude da Vila Valqueire amplia horario de funcionamento",
            excerpt: "O UBS do bairro agora funciona das 7h as 22h, incluindo fins de semana. Medida atende demanda da comunidade.",
            category: "saude",
            categoryLabel: "Saude",
            time: "Ha 3 horas",
            date: "31/08/2026",
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop",
            comments: 23,
            views: 890
        },
        {
            id: 3,
            title: "Operacao policial prende suspects de roubo na regiao de Jacarepagua",
            excerpt: "Equipe da 16a DP realizou operacao que resultou na prisao de 4 suspects por roubo a residencias no bairro.",
            category: "seguranca",
            categoryLabel: "Seguranca",
            time: "Ha 4 horas",
            date: "31/08/2026",
            image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=300&fit=crop",
            comments: 56,
            views: 2100
        },
        {
            id: 4,
            title: "Escola municipal da Vila Valqueire e reformada com novo laboratorio",
            excerpt: "A EEPF Professor Joao Gomes recebeu reforma completa e novo laboratorio de informatica para 2026.",
            category: "educacao",
            categoryLabel: "Educacao",
            time: "Ha 5 horas",
            date: "31/08/2026",
            image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop",
            comments: 34,
            views: 780
        },
        {
            id: 5,
            title: "Festival Cultural da Vila Valqueire promete atracoes de outubro",
            excerpt: "Programacao inclui shows ao vivo, feira gastronomica e exposicao de artistas locais no Largo da Vila.",
            category: "cultura",
            categoryLabel: "Cultura",
            time: "Ha 6 horas",
            date: "31/08/2026",
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
            comments: 89,
            views: 3200
        },
        {
            id: 6,
            title: "Time da Vila Valqueire conquista titulo do campeonato inter-bairros",
            excerpt: "O Esporte Clube Vila Valqueire venceu na final por 3 a 1 e sagrou-se campeao do torneio de futebol da Zona Oeste.",
            category: "esportes",
            categoryLabel: "Esportes",
            time: "Ha 7 horas",
            date: "31/08/2026",
            image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop",
            comments: 112,
            views: 4500
        },
        {
            id: 7,
            title: "Novo mercado do bairro gera 120 empregos diretos",
            excerpt: "O Magazine Preco Baixo abriu as portas na Rua Marechal Deodoro com 120 vagas de trabalho para moradores.",
            category: "economia",
            categoryLabel: "Economia",
            time: "Ha 8 horas",
            date: "31/08/2026",
            image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
            comments: 28,
            views: 1100
        },
        {
            id: 8,
            title: "Campanha de vacinacao contra gripe atinge 80% da meta na Zona Oeste",
            excerpt: "Secretaria Municipal de Saude informa que ja foram aplicadas mais de 15 mil doses no bairro.",
            category: "saude",
            categoryLabel: "Saude",
            time: "Ha 9 horas",
            date: "31/08/2026",
            image: "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=400&h=300&fit=crop",
            comments: 19,
            views: 670
        },
        {
            id: 9,
            title: "Moradores pedem melhoria do asfalto na Rua Sao Clemente",
            excerpt: "Proprietarios de imoveis e comerciantes entregaram peticao com 500 assinaturas a Vereanca.",
            category: "comunidade",
            categoryLabel: "Comunidade",
            time: "Ha 10 horas",
            date: "31/08/2026",
            image: "https://images.unsplash.com/photo-1569092631726-6b48f9350f46?w=400&h=300&fit=crop",
            comments: 67,
            views: 1800
        },
        {
            id: 10,
            title: "Projeto de mobilidade urbana prevê ciclovias na Barra e Jacarepagua",
            excerpt: "Plano da Prefeitura inclui 15 km de novas ciclovias que ligarao a Vila Valqueire a areas vizinhas.",
            category: "politica",
            categoryLabel: "Politica",
            time: "Ha 11 horas",
            date: "31/08/2026",
            image: "https://images.unsplash.com/photo-1476362174823-3a23f4aa6d77?w=400&h=300&fit=crop",
            comments: 41,
            views: 1350
        },
        {
            id: 11,
            title: "Blitz de transito recolhe 23 veiculos irregulares em Jacarepagua",
            excerpt: "Operacao da CET e policia militar verificou documentos e condiciones dos carros na regiao.",
            category: "seguranca",
            categoryLabel: "Seguranca",
            time: "Ha 12 horas",
            date: "30/08/2026",
            image: "https://images.unsplash.com/photo-1545566159-e0d1f10f267d?w=400&h=300&fit=crop",
            comments: 33,
            views: 920
        },
        {
            id: 12,
            title: "Feira livre da Vila Valqueire amplia espaco com 30 novos barracas",
            excerpt: "A tradicional feira dos sabados ganhou expansao com apoio da Subprefeitura da Barra e Jacarepagua.",
            category: "comunidade",
            categoryLabel: "Comunidade",
            time: "Ha 1 dia",
            date: "30/08/2026",
            image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop",
            comments: 52,
            views: 2800
        },
        {
            id: 13,
            title: "Workshop de programacao gratuito para jovens da comunidade",
            excerpt: "Centro Cultural oferece curso de 3 meses com certificado. Vagas limitadas para jovens de 15 a 25 anos.",
            category: "educacao",
            categoryLabel: "Educacao",
            time: "Ha 1 dia",
            date: "30/08/2026",
            image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
            comments: 45,
            views: 1500
        },
        {
            id: 14,
            title: "Time feminino da Vila Valqueire se classifica para estadual",
            excerpt: "Equipe venceu por 5 a 0 e garantiu vaga na fase final do campeonato feminino do Rio.",
            category: "esportes",
            categoryLabel: "Esportes",
            time: "Ha 1 dia",
            date: "30/08/2026",
            image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
            comments: 78,
            views: 3600
        },
        {
            id: 15,
            title: "Restaurante popular atende 200 pessoas diariamente no bairro",
            excerpt: "O projeto da Prefeitura serve almoco por R$ 1,50 para moradores de baixa renda. Reforco no cardapio.",
            category: "comunidade",
            categoryLabel: "Comunidade",
            time: "Ha 2 dias",
            date: "29/08/2026",
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
            comments: 31,
            views: 980
        },
        {
            id: 16,
            title: "Vereador apresenta projeto para revitalizacao do Largo da Vila",
            excerpt: "Proposta inclui nova pavimentacao, arvores, bancos e iluminacao decorativa na praca central.",
            category: "politica",
            categoryLabel: "Politica",
            time: "Ha 2 dias",
            date: "29/08/2026",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
            comments: 56,
            views: 2100
        }
    ],
    breakingNews: [
        "Vila Valqueire recebe novo projeto de iluminacao LED",
        "Posto de saude amplia horario de funcionamento",
        "Time da Vila conquista titulo do campeonato inter-bairros",
        "Operacao policial prende 4 suspects na regiao",
        "Festival Cultural promete atracoes de outubro"
    ]
};

// Categorias de noticias
// A categoria "politica" e usada pela aba "Rio de Janeiro" (noticias do G1 Rio).
const NEWS_CATEGORIES = {
    todas: "Todas",
    politica: "Rio de Janeiro",
    seguranca: "Seguranca",
    saude: "Saude",
    educacao: "Educacao",
    cultura: "Cultura",
    esportes: "Esportes",
    economia: "Economia",
    comunidade: "Comunidade"
};
