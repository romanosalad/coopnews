export type CoopArticle = {
  id?: string;
  slug: string;
  eyebrow: string;
  eyebrowClass: string;
  titleHtml: string;
  dek: string;
  author: string;
  readTime: string;
  placeholder: number;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  bodyMarkdown?: string | null;
  relevanceScore?: number | null;
  decisionLog?: Record<string, unknown> | null;
  viewCount?: number;
  clickCount?: number;
  totalEngagedSeconds?: number;
  qualityViewCount?: number;
  avgScrollDepth?: number;
  completedReadCount?: number;
  shareCount?: number;
  completionRate?: number;
  isAiGenerated?: boolean;
  storyJson?: { kicker: string; title: string; body: string }[];
  section: "hero" | "agora" | "popular" | "editorias" | "lafora";
  body: string[];
  bodyBlocks?: ArticleBodyBlock[];
};

export type ArticleBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "emphasis"; text: string }
  | { type: "quote"; text: string };

export const coopArticles: CoopArticle[] = [
  {
    slug: "campanha-sicredi-criatividade-cooperativista-nao-precisa-ser-careta",
    eyebrow: "CRIATIVIDADE · MANCHETE",
    eyebrowClass: "editoria-criatividade",
    titleHtml: 'A campanha do <em>Sicredi</em> que provou: criatividade cooperativista <span class="highlight">não precisa ser careta</span>',
    dek: "Em 90 dias, três agências brigaram por um briefing improvável — falar de previdência pra quem ainda nem tem conta. O resultado virou case e mexeu com o mercado.",
    author: "Julia Neves",
    readTime: "12 min de leitura",
    placeholder: 1,
    section: "hero",
    body: [
      "A campanha nasceu de uma tensão simples: como falar de previdência sem parecer banco, palestra ou medo do futuro. O caminho escolhido foi tratar o tema como projeto de vida, não como produto financeiro.",
      "A criação colocou cooperados reais, linguagem direta e humor leve no centro da narrativa. O gesto mais forte foi abandonar a solenidade típica do setor e mostrar que planejamento também pode ter desejo, contradição e conversa.",
      "Para o mercado cooperativista, o caso interessa porque resolve uma dúvida recorrente: criatividade não precisa enfraquecer confiança. Quando bem calibrada, ela torna a confiança mais visível.",
      "O resultado é uma peça que parece menos institucional e mais editorial. Essa diferença muda tudo: o público não sente que está sendo empurrado para um produto, mas convidado a enxergar uma decisão de outro jeito."
    ]
  },
  {
    slug: "cooperativas-confundem-crm-com-mailing",
    eyebrow: "MARTECH · 4 MIN",
    eyebrowClass: "editoria-martech",
    titleHtml: "Por que <em>cooperativas</em> ainda confundem CRM com mailing — e como sair dessa",
    dek: "CRM não é lista de disparo. É memória relacional, contexto e decisão sobre o próximo melhor contato.",
    author: "Bruno Salm",
    readTime: "4 min de leitura",
    placeholder: 2,
    section: "hero",
    body: [
      "A confusão começa quando a cooperativa compra ferramenta antes de desenhar relacionamento. O sistema passa a organizar campanhas, mas não organiza intenção, histórico ou aprendizado.",
      "O primeiro passo é separar base de dados de estratégia de contato. Mailing responde quem recebe. CRM precisa responder por que aquela pessoa recebe, quando recebe e o que deveria acontecer depois.",
      "Cooperativas têm uma vantagem estrutural: proximidade. Mas essa vantagem desaparece quando todos os associados recebem a mesma régua, a mesma oferta e o mesmo texto.",
      "Sair dessa armadilha exige menos tecnologia nova e mais disciplina editorial: cada jornada precisa ter hipótese, métrica e um motivo claro para existir."
    ]
  },
  {
    slug: "landing-page-escrita-por-ia-no-coop-brasileiro",
    eyebrow: "IA & CONVERSÃO · 6 MIN",
    eyebrowClass: "editoria-ia",
    titleHtml: "A primeira <em>landing page</em> escrita 100% por IA dentro do coop brasileiro",
    dek: "Um experimento de conversão mostrou onde a IA acelera, onde tropeça e onde ainda precisa de edição humana.",
    author: "Lia Fontoura",
    readTime: "6 min de leitura",
    placeholder: 3,
    section: "hero",
    body: [
      "O teste partiu de um briefing fechado: público, oferta, objeções e tom de voz. A IA gerou a primeira versão da página em minutos, mas o ganho real apareceu na etapa de variação.",
      "Foram testadas chamadas mais institucionais, mais diretas e mais comunitárias. A versão vencedora não foi a mais criativa, e sim a que explicou melhor a utilidade da solução.",
      "A lição é incômoda para times de marketing: a IA escreve rápido, mas só performa bem quando o briefing é preciso. Sem estratégia, ela apenas acelera ruído.",
      "Dentro do coop, o uso mais promissor não é substituir redator. É aumentar repertório de hipóteses e permitir que o time teste linguagem com mais frequência."
    ]
  },
  {
    slug: "campanha-devolve-dignidade-em-vez-de-vender-pacote",
    eyebrow: "COMUNICAÇÃO DO BEM · 3 MIN",
    eyebrowClass: "editoria-bem",
    titleHtml: "Quando a campanha <em>devolve dignidade</em> em vez de vender pacote",
    dek: "Algumas campanhas sociais funcionam porque não tratam pessoas como argumento de venda.",
    author: "Caio Werneck",
    readTime: "3 min de leitura",
    placeholder: 5,
    section: "hero",
    body: [
      "A diferença entre propósito e oportunismo costuma aparecer nos detalhes. Quem protagoniza a história? Quem ganha voz? O que muda depois que a campanha termina?",
      "Neste caso, a cooperativa escolheu mostrar serviço antes de mostrar marca. A narrativa apresenta problema, apoio concreto e consequência prática para a comunidade.",
      "O efeito é menos barulhento, mas mais sólido. A marca não aparece como salvadora. Aparece como infraestrutura de cuidado, crédito e presença.",
      "Comunicação do bem fica forte quando aceita ser menos vaidosa. O resultado é uma campanha que vende menos promessa e entrega mais vínculo."
    ]
  },
  {
    slug: "unimed-bh-jornada-boas-vindas-gatilho-consulta",
    eyebrow: "AUTOMAÇÃO",
    eyebrowClass: "editoria-automacao",
    titleHtml: "<em>Unimed-BH</em> dispara 1ª jornada de boas-vindas com gatilho por consulta",
    dek: "A automação deixa de ser lembrete e vira experiência de entrada quando respeita o momento do beneficiário.",
    author: "Redação Coop News",
    readTime: "5 min de leitura",
    placeholder: 0,
    section: "agora",
    body: [
      "A jornada começa depois da primeira consulta, quando o beneficiário ainda está formando sua percepção sobre o serviço. O gatilho parece simples, mas muda a relevância da mensagem.",
      "Em vez de abrir com orientações genéricas, a comunicação parte do evento real. Isso permite tom mais útil, menor fricção e maior chance de engajamento.",
      "O desafio está em calibrar frequência. Automação boa parece cuidado; automação excessiva parece cobrança.",
      "A experiência mostra que dados operacionais podem virar comunicação de relacionamento quando são tratados como contexto, não como desculpa para disparo."
    ]
  },
  {
    slug: "hubspot-plano-cooperativista-mira-miolo-do-mercado",
    eyebrow: "MARTECH",
    eyebrowClass: "editoria-martech",
    titleHtml: "Hubspot lança plano <em>cooperativista</em> e mira o miolo do mercado",
    dek: "A promessa é reduzir complexidade para times que precisam de CRM, automação e conteúdo no mesmo trilho.",
    author: "Redação Coop News",
    readTime: "4 min de leitura",
    placeholder: 4,
    section: "agora",
    body: [
      "A entrada de um plano voltado ao setor cooperativista sinaliza uma mudança: fornecedores de tecnologia começam a enxergar particularidades do modelo associativo.",
      "A oferta tenta simplificar implantação, criar templates de jornada e diminuir dependência de squads grandes. É uma resposta ao orçamento mais apertado de muitas cooperativas.",
      "Ainda assim, pacote setorial não resolve estratégia. Sem segmentação, governança de dados e clareza de ciclo de vida, a ferramenta vira apenas uma interface mais bonita.",
      "A oportunidade está em usar o plano como ponto de partida, não como substituto de desenho relacional."
    ]
  },
  {
    slug: "treinar-gpt-sem-vazar-dado-de-associado",
    eyebrow: "IA",
    eyebrowClass: "editoria-ia",
    titleHtml: "Como <em>treinar GPT</em> sem vazar dado de associado",
    dek: "A pergunta não é só técnica. É jurídica, cultural e profundamente operacional.",
    author: "Lia Fontoura",
    readTime: "8 min de leitura",
    placeholder: 3,
    section: "agora",
    body: [
      "O primeiro erro é tratar dado de associado como material bruto para prompt. Mesmo quando a intenção é interna, a cooperativa precisa separar contexto útil de informação sensível.",
      "Uma arquitetura segura começa com anonimização, limites de retenção e políticas claras sobre o que pode ou não ser enviado a modelos externos.",
      "Também é preciso treinar pessoas. Vazamento raramente começa na tecnologia; muitas vezes começa em uma planilha colada no chat errado.",
      "O caminho mais maduro combina bases sintéticas, exemplos aprovados e revisão humana em casos de atendimento, crédito ou saúde."
    ]
  },
  {
    slug: "festival-cataratas-abre-inscricoes-coops-trilha-propria",
    eyebrow: "CRIATIVIDADE",
    eyebrowClass: "editoria-criatividade",
    titleHtml: "Festival do <em>Cataratas</em> abre inscrições — coops têm trilha própria",
    dek: "A presença cooperativista em festivais deixa de ser exceção e começa a ganhar régua própria.",
    author: "Redação Coop News",
    readTime: "3 min de leitura",
    placeholder: 1,
    section: "agora",
    body: [
      "A trilha dedicada a cooperativas reconhece algo que o mercado já percebia: campanhas do setor têm objetivos, restrições e métricas diferentes.",
      "Nem sempre o melhor case é o mais barulhento. Muitas vezes é o que transforma comunicação em adesão, educação ou mudança de comportamento.",
      "A abertura de inscrições deve aumentar a visibilidade de agências regionais e times internos que já produzem trabalhos consistentes fora do eixo tradicional.",
      "Para o setor, a régua própria pode ajudar a qualificar briefing, orçamento e ambição criativa."
    ]
  },
  {
    slug: "briefing-sicoob-que-ninguem-quis-pegar",
    eyebrow: "FÓRUM · DEBATIDO",
    eyebrowClass: "editoria-criatividade",
    titleHtml: "O briefing do Sicoob que ninguém quis pegar — e virou a campanha do ano",
    dek: "Uma discussão sobre risco criativo, medo institucional e timing perfeito.",
    author: "Comunidade Coop News",
    readTime: "9 min de leitura",
    placeholder: 1,
    section: "popular",
    body: [
      "O briefing parecia pequeno, mas carregava um problema grande: falar com um público que já tinha ouvido todas as promessas possíveis sobre crédito.",
      "A agência que assumiu o desafio cortou o excesso de institucionalidade e criou uma campanha apoiada em situações de decisão real.",
      "No fórum, a discussão se concentrou menos no filme e mais no processo. Por que tantos times recusaram a pauta? O que parecia arriscado virou justamente o diferencial.",
      "A conclusão provisória: algumas campanhas cooperativas só ficam boas quando alguém aceita abandonar a segurança estética do setor."
    ]
  },
  {
    slug: "jingle-ainda-funciona-em-2026",
    eyebrow: "FÓRUM · ÁUDIO DE MARCA",
    eyebrowClass: "editoria-criatividade",
    titleHtml: "Por que o jingle ainda funciona em 2026 (e por que coop é o último mercado a entender isso)",
    dek: "A memória sonora voltou a ser ativo estratégico, só que agora com distribuição social.",
    author: "Comunidade Coop News",
    readTime: "7 min de leitura",
    placeholder: 2,
    section: "popular",
    body: [
      "O jingle nunca morreu. Ele apenas saiu do centro da conversa enquanto o mercado fingia que toda marca precisava soar como manifesto minimalista.",
      "Cooperativas têm presença regional, repetição de contato e vínculos locais. São condições quase perfeitas para ativos sonoros memoráveis.",
      "A diferença em 2026 está no formato. O som precisa funcionar em rádio, Reels, evento, atendimento e peça curta.",
      "Quando bem feito, o jingle vira infraestrutura de lembrança. Quando mal feito, vira vergonha compartilhável."
    ]
  },
  {
    slug: "ia-generativa-pecas-regulamentadas-framework-risco",
    eyebrow: "FÓRUM · IA",
    eyebrowClass: "editoria-ia",
    titleHtml: "IA generativa em peças regulamentadas: o framework de risco que o Bacen ainda não escreveu",
    dek: "Times de marketing começam a criar sua própria régua antes da regulação ficar clara.",
    author: "Comunidade Coop News",
    readTime: "10 min de leitura",
    placeholder: 3,
    section: "popular",
    body: [
      "A adoção de IA em peças financeiras avança mais rápido que a criação de protocolos internos. O resultado é uma zona cinzenta entre produtividade e risco.",
      "O framework debatido pela comunidade divide usos em baixa, média e alta exposição: variação de título, apoio criativo, simulação de oferta e texto final aprovado.",
      "O ponto mais sensível é rastreabilidade. Se a IA participa de uma peça, alguém precisa conseguir explicar origem, revisão e responsabilidade.",
      "Enquanto a régua oficial não vem, os times mais maduros estão criando governança própria."
    ]
  },
  {
    slug: "cooperativa-demitou-cmo-chief-storytelling-officer",
    eyebrow: "FÓRUM · GESTÃO",
    eyebrowClass: "editoria-martech",
    titleHtml: "A cooperativa de crédito que demitiu o CMO e contratou um chief storytelling officer",
    dek: "Mudança de cargo ou sintoma de uma transformação mais profunda no marketing?",
    author: "Comunidade Coop News",
    readTime: "8 min de leitura",
    placeholder: 4,
    section: "popular",
    body: [
      "O título chama atenção, mas a discussão real é sobre a função do marketing dentro de cooperativas de crédito.",
      "A troca sinaliza uma tentativa de reorganizar comunicação em torno de narrativa, comunidade e consistência editorial.",
      "Críticos argumentam que storytelling sem operação vira verniz. Defensores dizem que a cooperativa precisava justamente de alguém capaz de costurar produto, território e cultura.",
      "O caso mostra que cargos mudam quando a demanda muda. A dúvida é se a estrutura acompanha."
    ]
  },
  {
    slug: "faz-sentido-coop-ter-agencia-interna",
    eyebrow: "FÓRUM · DISCUSSÃO",
    eyebrowClass: "editoria-automacao",
    titleHtml: "Discutindo: faz sentido coop ter agência interna em 2026?",
    dek: "Entre velocidade, custo e qualidade, a resposta depende menos de organograma e mais de maturidade.",
    author: "Comunidade Coop News",
    readTime: "6 min de leitura",
    placeholder: 5,
    section: "popular",
    body: [
      "Agência interna parece solução óbvia para volume, mas pode virar gargalo quando nasce sem método, pauta e critérios criativos.",
      "O modelo funciona melhor quando separa produção recorrente de pensamento estratégico. Nem tudo precisa sair de fora; nem tudo deve ficar dentro.",
      "Cooperativas regionais têm vantagem de proximidade, e isso ajuda muito na produção de conteúdo local.",
      "A pergunta correta talvez não seja se deve ter agência interna. É quais decisões criativas precisam continuar sendo tensionadas por alguém de fora."
    ]
  },
  {
    slug: "conteudo-educativo-mais-converteu-conta-corrente",
    eyebrow: "FÓRUM · CONVERSÃO",
    eyebrowClass: "editoria-bem",
    titleHtml: "O conteúdo educativo que mais converteu em conta-corrente nos últimos 12 meses",
    dek: "A peça vencedora não parecia campanha. Parecia resposta útil no momento certo.",
    author: "Comunidade Coop News",
    readTime: "5 min de leitura",
    placeholder: 0,
    section: "popular",
    body: [
      "O conteúdo de maior conversão foi um guia simples sobre organização financeira para pequenos negócios locais.",
      "Ele funcionou porque não começava vendendo conta. Começava resolvendo uma dúvida concreta de fluxo de caixa.",
      "A abertura de conta aparecia como consequência natural, não como interrupção.",
      "É um lembrete de que educação converte quando respeita o tempo da decisão."
    ]
  },
  {
    slug: "midia-programatica-mudou-setor-cooperativista",
    eyebrow: "FÓRUM · MÍDIA",
    eyebrowClass: "editoria-martech",
    titleHtml: "Não é nicho, é direção: como mídia programática mudou no setor cooperativista",
    dek: "A segmentação deixou de ser luxo e virou condição para campanhas com relevância territorial.",
    author: "Comunidade Coop News",
    readTime: "6 min de leitura",
    placeholder: 1,
    section: "popular",
    body: [
      "A programática entrou no setor com promessa de eficiência, mas seu impacto mais interessante está na leitura de território.",
      "Campanhas cooperativas precisam falar com regiões, perfis produtivos e momentos de vida diferentes. Compra de mídia genérica desperdiça essa riqueza.",
      "O desafio é usar segmentação sem perder o senso comunitário. Dados ajudam, mas não substituem conhecimento local.",
      "Quando os dois se combinam, mídia deixa de ser distribuição e vira inteligência de presença."
    ]
  },
  {
    slug: "cannes-do-interior-campanha-cooperativista",
    eyebrow: "CRIATIVIDADE · 8 MIN",
    eyebrowClass: "editoria-criatividade",
    titleHtml: "O que <em>premia</em> uma campanha cooperativista no Cannes do interior",
    dek: "Cataratas, Wave Festival, ProXXIma — três circuitos, três formas de medir o que vale.",
    author: "Julia Neves",
    readTime: "8 min de leitura",
    placeholder: 1,
    section: "editorias",
    body: [
      "Campanhas cooperativistas competem em um território peculiar. Precisam ser criativas, mas também precisam demonstrar impacto real na comunidade.",
      "Nos circuitos regionais, o melhor trabalho costuma ser aquele que resolve uma tensão local com execução clara e linguagem memorável.",
      "A régua de prêmio muda quando o objetivo não é apenas vender, mas fortalecer relação com cooperados.",
      "O Cannes do interior premia menos espetáculo e mais aderência: ideia certa, no território certo, com consequência visível."
    ]
  },
  {
    slug: "stack-minima-marketing-cooperativa-2026",
    eyebrow: "MARTECH · 5 MIN",
    eyebrowClass: "editoria-martech",
    titleHtml: "A <em>stack</em> mínima viável para um time de marketing de cooperativa em 2026",
    dek: "CRM, automação, CDP, BI: o que vale licença e o que vale uma planilha bem-feita.",
    author: "Bruno Salm",
    readTime: "5 min de leitura",
    placeholder: 2,
    section: "editorias",
    body: [
      "A stack mínima não começa por ferramenta. Começa por três capacidades: conhecer público, orquestrar contato e medir resposta.",
      "Para muitas cooperativas, um CRM bem governado, uma automação simples e um painel confiável resolvem mais do que uma coleção de licenças sofisticadas.",
      "O erro mais comum é comprar CDP antes de ter dados limpos e casos de uso claros.",
      "Em 2026, maturidade tecnológica será menos sobre quantidade de sistemas e mais sobre coerência entre dados, conteúdo e decisão."
    ]
  },
  {
    slug: "prompt-engineering-tom-de-voz-coop",
    eyebrow: "IA · 10 MIN",
    eyebrowClass: "editoria-ia",
    titleHtml: "Prompt engineering com <em>tom de voz</em> coop: o que funcionou (e o que não)",
    dek: "Seis times rodaram o mesmo briefing em LLMs diferentes. Os resultados foram desconfortáveis.",
    author: "Lia Fontoura",
    readTime: "10 min de leitura",
    placeholder: 3,
    section: "editorias",
    body: [
      "Tom cooperativista não é apenas ser simpático. Ele combina clareza, proximidade, responsabilidade e uma certa recusa ao exagero promocional.",
      "Os prompts que funcionaram melhor traziam contexto de público, exemplos reais e limites explícitos sobre promessas financeiras.",
      "Os piores resultados pareciam folders genéricos com palavras como comunidade e propósito espalhadas sem critério.",
      "A conclusão é simples: IA reproduz clichê quando o time não sabe nomear sua própria voz."
    ]
  },
  {
    slug: "proposito-estrategia-ou-letreiro",
    eyebrow: "COMUNICAÇÃO DO BEM · 6 MIN",
    eyebrowClass: "editoria-bem",
    titleHtml: "Quando <em>propósito</em> é estratégia — e quando é só letreiro",
    dek: "O que diferencia ESG performático de ESG operacional na voz da marca.",
    author: "Caio Werneck",
    readTime: "6 min de leitura",
    placeholder: 5,
    section: "editorias",
    body: [
      "Propósito vira estratégia quando muda decisão. Se ele só aparece no manifesto, provavelmente é letreiro.",
      "No contexto cooperativista, a régua deveria ser ainda mais exigente. O modelo de negócio já carrega promessa comunitária; a comunicação precisa provar operação.",
      "A diferença aparece em campanhas que mostram processo, impacto e continuidade.",
      "Quanto mais concreta a entrega, menos a marca precisa se declarar transformadora."
    ]
  },
  {
    slug: "onboarding-que-parou-de-soar-como-cobranca",
    eyebrow: "AUTOMAÇÃO · 4 MIN",
    eyebrowClass: "editoria-automacao",
    titleHtml: "Jornadas de <em>onboarding</em> que pararam de soar como cobrança",
    dek: "Três coops abriram suas trilhas de boas-vindas. Tem coisa boa e tem coisa que não envelheceu bem.",
    author: "Redação Coop News",
    readTime: "4 min de leitura",
    placeholder: 0,
    section: "editorias",
    body: [
      "Boas-vindas ruins começam pedindo ação demais. Boas-vindas boas começam diminuindo ansiedade.",
      "As jornadas analisadas acertam quando explicam o próximo passo, apresentam canais e criam sensação de acompanhamento.",
      "O erro recorrente ainda é transformar onboarding em lista de tarefas.",
      "A melhor experiência foi a que parecia conversa de orientação, não sequência de cobrança."
    ]
  },
  {
    slug: "som-de-marca-entrou-no-orcamento-das-cooperativas",
    eyebrow: "CRIATIVIDADE · 7 MIN",
    eyebrowClass: "editoria-criatividade",
    titleHtml: "Por que <em>som de marca</em> finalmente entrou no orçamento das cooperativas",
    dek: "De jingle de rádio AM ao identidade sonora pra TikTok — uma virada que demorou 20 anos.",
    author: "Julia Neves",
    readTime: "7 min de leitura",
    placeholder: 4,
    section: "editorias",
    body: [
      "O som voltou ao centro porque a distribuição mudou. Marcas precisam ser reconhecidas em vídeos curtos, podcasts, eventos e atendimento.",
      "Cooperativas já tinham tradição sonora, mas quase sempre limitada ao jingle de campanha.",
      "Agora o desafio é criar um sistema: assinatura, textura, vinheta, voz e adaptação por contexto.",
      "Quando bem desenhado, som de marca ajuda a cooperativa a ser lembrada antes mesmo do logotipo aparecer."
    ]
  },
  {
    slug: "duolingo-tom-corporativo-coops",
    eyebrow: "CASE · DUOLINGO",
    eyebrowClass: "editoria-lafora",
    titleHtml: "A coruja que matou o <em>tom corporativo</em> — e o que coops podem aprender com isso",
    dek: "Tradução: como uma marca de educação virou ícone de cultura pop sem perder a função produto.",
    author: "Editor Lá Fora",
    readTime: "9 min de leitura",
    placeholder: 3,
    imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80",
    section: "lafora",
    body: [
      "O Duolingo ensina uma lição difícil: personalidade forte não precisa destruir utilidade. A marca brinca, mas o produto continua claro.",
      "Para cooperativas, o aprendizado não é copiar humor agressivo. É entender que tom de voz precisa ser reconhecível e operacionalizável.",
      "A coruja funciona porque tem consistência, timing e coragem de parecer menos corporativa.",
      "Coops podem roubar a lógica, não a piada: criar uma voz viva, com limites claros e presença frequente."
    ]
  },
  {
    slug: "mercado-livre-frete-gratis-pertencimento",
    eyebrow: "RETAIL · MERCADO LIVRE",
    eyebrowClass: "editoria-lafora",
    titleHtml: "A campanha que transformou <em>frete grátis</em> em narrativa de pertencimento",
    dek: "Um benefício funcional pode virar cultura quando aparece como linguagem compartilhada.",
    author: "Editor Lá Fora",
    readTime: "5 min de leitura",
    placeholder: 2,
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
    section: "lafora",
    body: [
      "Frete grátis é benefício racional, mas o Mercado Livre conseguiu tratá-lo como senha cultural.",
      "A campanha funciona porque transforma uma vantagem funcional em expressão de hábito, pressa e recompensa.",
      "Para cooperativas, a lição é olhar para benefícios cotidianos que parecem pequenos demais para campanha.",
      "Muitas vezes, a narrativa mais forte mora no serviço que o associado já usa sem perceber."
    ]
  },
  {
    slug: "nubank-roxo-virou-commodity",
    eyebrow: "FINTECH · NUBANK",
    eyebrowClass: "editoria-lafora",
    titleHtml: "Como o <em>roxo</em> deixou de ser ousadia e virou commodity",
    dek: "Toda diferenciação visual tem prazo de validade quando o mercado aprende a imitá-la.",
    author: "Editor Lá Fora",
    readTime: "6 min de leitura",
    placeholder: 5,
    imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80",
    section: "lafora",
    body: [
      "O roxo foi ruptura quando o setor financeiro ainda parecia preso a azul, prata e formalidade.",
      "Com o tempo, a cor virou símbolo reconhecível, mas também abriu caminho para imitadores e para a normalização do gesto.",
      "A lição para cooperativas é que identidade visual precisa evoluir sem abandonar memória.",
      "Cor chama atenção no começo. Sistema, voz e experiência sustentam diferenciação depois."
    ]
  }
];

export function getArticleBySlug(slug: string) {
  return coopArticles.find((article) => article.slug === slug) ?? null;
}

export function getArticlesBySection(section: CoopArticle["section"]) {
  return coopArticles.filter((article) => article.section === section);
}
