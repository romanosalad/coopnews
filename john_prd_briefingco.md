# 📋 PRD — Briefing.Co como Produto
**Product Manager: John | Baseado na Auditoria Mary + fa.md V3.1**
**Data: 02 Mai 2026 | Status: Draft v1.0**

> [!IMPORTANT]
> O intuito principal nunca muda: **"Motor de inteligência que usa a lente da Psicanálise de Mercado para entregar Vantagem Injusta a decisores do cooperativismo."**
> Tudo neste PRD serve a isso. O que não serve, corta.

---

## 0. O Problema que o Produto Resolve

Um CMO de cooperativa de crédito acorda toda segunda-feira com o mesmo problema:

> *"O que está acontecendo no meu mercado que eu ainda não sei — e que meu concorrente pode já saber?"*

O Google entrega releases. O portal da OCB entrega comunicados. O LinkedIn entrega opiniões vagas. **Ninguém entrega inteligência cirúrgica com aplicação prática para o cooperativismo.**

O Briefing.Co resolve esse problema. O fa.md define como o conteúdo é produzido. Este PRD define como o produto chega na mesa do decisor — e como sustenta isso comercialmente.

---

## 1. Arquitetura de Acesso — 3 Camadas

A Mary identificou que o sistema não tem modelo de acesso. Aqui está a solução, inspirada no modelo The Information + Morning Brew, mas adaptada para o intuito cooperativista.

### Diagrama de Camadas

```
┌─────────────────────────────────────────────────────┐
│  🔓 CAMADA 1 — LIVRE (Radar)                        │
│  Hard News. 300w. Acesso público, sem cadastro.      │
│  Objetivo: descoberta orgânica + entrada no funil.  │
├─────────────────────────────────────────────────────┤
│  🔐 CAMADA 2 — DECISOR (Protocolo)                  │
│  Tutoriais de IA + análise estratégica. 800w.        │
│  Requer: cadastro gratuito (email + cargo + tipo     │
│  de cooperativa). Objetivo: qualificar a audiência. │
├─────────────────────────────────────────────────────┤
│  💎 CAMADA 3 — ELITE (Dossiê)                       │
│  Deep analysis. 1.800w. Pago.                        │
│  Público: CMOs, Diretores, Agências de Elite.        │
│  Objetivo: receita direta + sinal de comprometimento│
└─────────────────────────────────────────────────────┘
```

### Por que essa arquitetura?

- **Camada 1 (Livre):** O Radar é o "isca". Conteúdo assertivo e factual que aparece no Google, no LinkedIn, no WhatsApp de grupo de gestores. Não pede nada do leitor — apenas o leva para dentro do produto.
- **Camada 2 (Decisor):** Aqui acontece a qualificação. O cadastro coleta **cargo + tipo de cooperativa** — dados que valem ouro para segmentação e para sponsors. A barreira é baixa o suficiente para não gerar abandono, alta o suficiente para filtrar leitores casuais.
- **Camada 3 (Elite):** O Dossiê é o produto. 1.800 palavras de investigação profunda que o gestor **não encontraria em lugar nenhum**. É aqui que o fa.md brilha. É aqui que o dinheiro entra.

---

## 2. Modelo de Monetização — 3 Pilares

A Mary apontou a ausência total de monetização no fa.md. Aqui está o modelo completo, com benchmarks de mercado embutidos.

### Pilar 1 — Assinatura Direta (Receita Previsível)

| Plano | Público | Preço | O que inclui |
|---|---|---|---|
| **Decisor Mensal** | Gestores individuais | R$ 97/mês | Protocolo ilimitado + 2 Dossiês/mês |
| **Decisor Anual** | Gestores individuais | R$ 797/ano (~R$ 66/mês) | Idem + acesso ao arquivo completo |
| **Equipe Elite** | Agências e cooperativas | R$ 297/mês (até 5 seats) | Tudo + briefing customizado mensal |

> **Referência de mercado:** The Information cobra $399/ano (~R$ 2.400). O Briefing.Co opera num mercado menor mas com menos concorrência — R$ 797/ano é defensável e 3x menor que a referência global.

**Projeção conservadora:**
- 200 assinantes Decisor Anual × R$ 797 = **R$ 159.400/ano**
- 20 planos Equipe Elite × R$ 297/mês = **R$ 71.280/ano**
- **Total Recorrente: ~R$ 230.000/ano** (base mínima para operação sustentável)

---

### Pilar 2 — Sponsorship Estratégico (Receita de Alto Ticket)

**Não é publicidade. É parceria editorial.**

O fa.md é explícito: conteúdo de release é descartado. Então como o sponsor entra? Como **contexto**, não como anúncio.

**Formato proposto — "Inteligência Patrocinada":**
> *"Este Dossiê sobre jornada do cooperado foi aprofundado com dados da [Fintech Parceira], plataforma de CRM para cooperativas de crédito."*

A diferença é sutil mas decisiva: o sponsor não compra espaço — compra **associação com autoridade**. Isso é o que marcas como a Salesforce fazem com o HBR.

| Formato | O que entrega | Preço estimado |
|---|---|---|
| **Sponsor de Caderno** | Logo + menção em todos os Protocolos do mês | R$ 3.500/mês |
| **Dossiê Patrocinado** | Um Dossiê aprofundado com dados do sponsor (passa pelo gate C-MAD) | R$ 8.000/peça |
| **Relatório de Setor** | Estudo trimestral exclusivo com metodologia C-MAD | R$ 25.000/relatório |

**Targets de sponsor naturais:** fintechs de crédito cooperativo, plataformas de gestão de cooperativas, consultorias de governança, agências especializadas no setor.

---

### Pilar 3 — Produto Derivado (Receita de Alto Impacto Futuro)

Esses produtos nascem da autoridade construída pelas camadas 1 e 2. Não são prioridade imediata — são o horizonte.

| Produto | Formato | Estimativa |
|---|---|---|
| **C-MAD Licenciada** | Metodologia de auditoria vendida para agências e cooperativas | R$ 15.000–R$ 50.000/licença |
| **Briefing Elite Presencial** | Evento trimestral para 50 decisores | R$ 1.500/ingresso × 50 = R$ 75.000/evento |
| **Consultoria Editorial** | A equipe audita e reestrutura a comunicação de uma cooperativa usando C-MAD | R$ 20.000–R$ 80.000/projeto |

---

## 3. Estratégia de Distribuição — Como o Leitor Chega

O fa.md existe num Next.js. Mas o leitor não acorda pensando "vou acessar o Briefing.Co". Ele precisa ser encontrado onde já está.

### Canais por Camada de Acesso

```
CAMADA 1 — LIVRE (Radar) → Distribuição Ampla
├── SEO orgânico (Google) — Artigos curtos, factual, indexável
├── LinkedIn Artigos — Publicação nativa com link para o site
├── WhatsApp Grupos de Gestores — Compartilhamento humano (viral orgânico)
└── Grupos de Facebook do setor cooperativo

CAMADA 2 — DECISOR (Protocolo) → Distribuição Qualificada
├── Newsletter semanal (via email — Resend ou Beehiiv)
│   └── Cadência: toda terça-feira, 7h da manhã
├── LinkedIn Newsletter (nativa na plataforma)
└── Instagram/Reels com teaser dos Protocolos

CAMADA 3 — ELITE (Dossiê) → Distribuição Restrita
├── Email exclusivo para assinantes
├── WhatsApp VIP (grupo fechado de assinantes Elite)
└── Notificação push no Next.js (PWA)
```

### Cadência Editorial Recomendada

| Dia | Publicação | Caderno | Camada |
|---|---|---|---|
| Segunda | 1 Radar | Hard News | Livre |
| Terça | Newsletter semanal | Mix de Radar + teaser Protocolo | Decisor |
| Quarta | 1 Protocolo | IA/Hack aplicado | Decisor |
| Quinta | 1 Radar | Hard News | Livre |
| Sexta | 1 Dossiê | Deep Analysis | Elite |

**Total semanal:** 3 Radares + 1 Protocolo + 1 Dossiê. Sustentável para o motor de IA atual.

---

## 4. Segmentação de Audiência — Verticals Internas

A Mary identificou que "CEOs/CMOs de cooperativas" é amplo demais para escalar. O John concorda e propõe a segmentação por vertical — que também resolve o problema de personalização no cadastro da Camada 2.

### 4 Verticals Internas

| Vertical | Público específico | Dor principal | Conteúdo prioritário |
|---|---|---|---|
| **🏦 Crédito** | CMOs de Sicredi, Sicoob, Unicred e cooperativas singulares | Competição com fintechs, comunicação de produto financeiro complexo | Protocolos de martech financeiro, Dossiês de jornada do cooperado |
| **🌾 Agro** | Gestores de cooperativas agropecuárias (Coamo, Cocamar, C.Vale) | Sazonalidade, comunicação com produtor rural, ESG | Radares de tendência agro, Protocolos de comunicação rural |
| **🏥 Saúde** | Diretores de Unimed e cooperativas médicas | Retenção de cooperado-médico, comunicação de benefícios | Dossiês de branding institucional, Protocolos de CX |
| **🛒 Consumo** | Gestores de cooperativas de consumo e habitação | Competição com varejo digital, pertencimento | Protocolos de e-commerce cooperativista, Radares de varejo |

### Impacto no Produto

1. **Cadastro da Camada 2** coleta: cargo + vertical + tamanho da cooperativa
2. **Newsletter segmentada:** cada vertical recebe curadoria relevante para sua dor
3. **Sponsor targeting:** fintech de crédito patrocina apenas newsletters da vertical Crédito
4. **C-MAD adaptada:** o campo "Coop Business" tem benchmarks diferentes para cada vertical

---

## 5. Feedback Loop de Engajamento — O Sistema que Aprende

A Mary apontou que o `relevance_score` não evolui após a publicação. Aqui está o modelo de feedback loop que corrige isso.

### Sinais de Engajamento a Capturar (via Supabase)

| Sinal | Peso | Como capturar |
|---|---|---|
| Tempo na página > 3 min | Alto | Analytics via Next.js |
| Artigo compartilhado (clique no botão) | Alto | Event tracking |
| Artigo salvo/favoritado | Médio | Feature a construir |
| Newsletter aberta | Médio | Open tracking via email |
| Clique em link interno (indicativo de interesse) | Médio | Link tracking |
| Comentário ou reply na newsletter | Muito alto | Webhook do email |

### Score Dinâmico Proposto

```
engagement_score = (
  (tempo_leitura_score × 0.35) +
  (compartilhamentos × 0.25) +
  (saves × 0.20) +
  (email_opens × 0.10) +
  (comentarios × 0.10)
)

relevance_score_final = (relevance_score_publicacao × 0.6) +
                        (engagement_score × 0.4)
```

### Para que serve esse score dinâmico?

1. **Calibrar o agente:** artigos com alto `engagement_score` retroalimentam os termos de busca do Serper — o sistema descobre o que a audiência quer antes dela pedir
2. **Orientar o editorial:** o time vê quais cadernos performam melhor por vertical
3. **Vender para sponsors:** dados de engajamento por vertical valem muito mais que pageviews gerais

---

## 6. Fluxo do Leitor — Jobs-to-be-Done

Aplicando a lente JTBD: qual é o "trabalho" que o CMO contrata o Briefing.Co para fazer?

> **Job principal:** *"Quando estou tomando decisões de marketing para minha cooperativa, me ajude a entender o que os melhores players do mercado estão fazendo — e como eu aplico isso aqui."*

### Jornada do Leitor Ideal (CMO de Cooperativa de Crédito)

```
DIA 1 — DESCOBERTA
└── Encontra um Radar no Google sobre "campanha Sicredi 2026"
    → Lê. É denso. É diferente do que encontra no OCB.
    → Clica em "Ver mais análises"

DIA 2 — QUALIFICAÇÃO
└── Vê que Protocolo exige cadastro
    → Cadastra: "CMO | Cooperativa de Crédito Singular | 50k cooperados"
    → Recebe email de confirmação + link para 1 Protocolo desbloqueado

SEMANA 1 — HÁBITO
└── Terça-feira chega a newsletter com 1 Radar + teaser do Protocolo
    → Abre. Lê em 4 minutos no caminho para o trabalho.
    → Salva o teaser do Protocolo para ler depois

MÊS 1 — CONVERSÃO
└── Dossiê sobre "Jornada do Cooperado de Crédito: o que os bancos digitais
    estão fazendo que as cooperativas ainda ignoram" aparece bloqueado
    → Tenta ler. Topa o paywall.
    → "R$ 797/ano. Menos que um almoço com o consultor."
    → Assina.

MÊS 3 — DEFESA
└── Compartilha o Dossiê no grupo de WhatsApp de gestores do sistema
    → 3 colegas assinam por indicação.
```

---

## 7. Telas Prioritárias — O que Precisa Existir no Produto

Com base no fluxo do leitor, estas são as telas que o Next.js atual precisa ter ou evoluir:

### Tela 1 — Home (já existe, verificar aderência ao modelo)
**Job:** Comunicar que isso não é um portal de notícias comum.
- Manchete principal do Dossiê mais recente (Elite, com CTA de assinar)
- Feed de Radares (livre, sem barreira)
- Seção "Por que isso não é um release" — explicando a metodologia
- CTA para cadastro Decisor bem visível

### Tela 2 — Artigo Radar (já existe)
**Job:** Entregar valor imediato, criar hábito, levar para cadastro.
- Conteúdo completo, sem paywall
- Ao final: "Esse foi o Radar. O Protocolo vai mais fundo →" (CTA de cadastro)
- Botão de compartilhar proeminente (distribuição orgânica)
- Indicador visual de caderno: `RADAR · Hard News · 3 min de leitura`

### Tela 3 — Artigo Protocolo (requer cadastro)
**Job:** Recompensar o cadastro, criar dependência da profundidade.
- Primeiras 200 palavras abertas (preview da qualidade)
- Formulário de cadastro leve: nome + email + cargo + vertical
- Conteúdo completo desbloqueado após confirmação de email
- Box "Aplicação Prática" — a seção que o gestor vai usar na segunda-feira

### Tela 4 — Artigo Dossiê (requer assinatura)
**Job:** Justificar o pagamento com profundidade imbatível.
- Preview: título + lead + 1 parágrafo + índice do artigo
- Paywall mid-content com opções de plano
- Para assinantes: leitura completa + estimativa de tempo + save/favorito
- C-MAD summary no final: "O que este Dossiê revelou nos 4 pilares"

### Tela 5 — Dashboard do Assinante (a construir)
**Job:** Fazer o assinante se sentir membro de um clube de elite.
- Feed personalizado por vertical selecionada
- Arquivo completo de Dossiês (busca por tema)
- Indicador "Novidades da sua vertical esta semana"
- Badge de tempo de assinatura ("Membro há 6 meses")

---

## 8. Roadmap — 3 Fases

### Fase 1 — Fundação (0–90 dias)
> *Objetivo: produto funcionando com as 3 camadas e primeiros assinantes pagos*

- [ ] Implementar sistema de cadastro na Camada 2 (nome + email + cargo + vertical)
- [ ] Criar paywall na Camada 3 (integrar Stripe ou Pagar.me)
- [ ] Configurar newsletter semanal (Resend + template de marca)
- [ ] Adicionar indicador de caderno nos artigos (RADAR / PROTOCOLO / DOSSIÊ)
- [ ] Implementar botão de compartilhamento com UTM tracking
- [ ] Meta: 500 cadastros Decisor + 30 assinantes Elite

### Fase 2 — Tração (90–180 dias)
> *Objetivo: receita recorrente + primeiro sponsor*

- [ ] Dashboard do assinante com feed personalizado por vertical
- [ ] Implementar feedback loop de engajamento (tempo de leitura + saves)
- [ ] Fechar primeiro Sponsor de Caderno (target: fintech ou consultoria cooperativista)
- [ ] Lançar LinkedIn Newsletter com curadoria semanal
- [ ] Meta: 150 assinantes Elite + R$ 15.000/mês MRR

### Fase 3 — Escala (180–365 dias)
> *Objetivo: autoridade consolidada + produto derivado*

- [ ] Lançar primeiro Relatório de Setor patrocinado (ex: "Marketing Cooperativista 2027")
- [ ] Abrir inscrições para Briefing Elite Presencial (evento trimestral)
- [ ] Iniciar posicionamento da C-MAD como metodologia licenciável
- [ ] Explorar verticais: criar sub-newsletters específicas por vertical
- [ ] Meta: 500 assinantes Elite + R$ 45.000/mês MRR

---

## 9. O que Este PRD Não É

> [!WARNING]
> Este PRD não muda o fa.md. A qualidade editorial, a voz psicanalítica, o C-MAD e o gatekeeper autônomo são inegociáveis — são o produto. Este documento apenas define **como esse produto chega no leitor e como sustenta-se comercialmente**.
>
> Qualquer feature proposta aqui que entre em conflito com o fa.md deve ser rejeitada. O Auditor-Chefe tem a palavra final.

---

## 10. Próximos Passos (Para Romano Decidir)

| Decisão | Opção A | Opção B |
|---|---|---|
| **Plataforma de email** | Resend (já no stack Next.js, mais técnico) | Beehiiv (mais fácil, menos controle) |
| **Paywall** | Stripe (global, simples) | Pagar.me (BR-first, PIX nativo) |
| **Fase 1 começa por** | Implementar cadastro Decisor primeiro | Implementar paywall Elite primeiro |
| **Primeiro sponsor** | Buscar fintech cooperativista ativa | Buscar consultoria/agência do setor |

---

*PRD produzido por John (Product Manager). Baseado na auditoria de mercado da Mary (mai/2026) e no fa.md V3.1. Nenhuma alteração feita no fa.md.*
