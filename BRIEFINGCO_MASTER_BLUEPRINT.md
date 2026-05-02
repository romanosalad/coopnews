# 🏛️ BRIEFING.CO — MASTER BLUEPRINT
**Versão: 6.0 — DEFINITIVO PARA IMPLEMENTAÇÃO**
**Arquiteto: Winston | Data: 02 Mai 2026**
**Baseado em: fa.md V3.1 · PRD John · Crews Architecture V5.1 · Decisões do Fundador**

---

> [!IMPORTANT]
> **Este documento é a fonte de verdade para o Claude Code.**
> Nenhuma implementação começa sem que o item correspondente esteja neste roadmap.
> Qualquer decisão que contradiga o `fa.md V3.1` é automaticamente rejeitada.

---

## 📌 VEREDITO EXECUTIVO — John (PM)

> *"Trabalhamos durante esta sessão para transformar um motor editorial em um produto. Aqui está o que ficou provado e o que ainda está em aberto."*

### O que está solidificado (não se discute mais)

| Decisão | Status |
|---|---|
| SSOT única: `fa.md V3.1` | ✅ Definitivo |
| 3 Cadernos: Radar / Protocolo / Dossiê | ✅ Definitivo |
| 3 Lentes: Dunker · Schwartz · Hack Estratégico | ✅ Definitivo |
| Gatekeeper anti-jabá com Teste do Orfanato | ✅ Definitivo |
| n8n como orquestrador (servidor instalado) | ✅ Definitivo |
| Supabase como banco + Edge Functions leves | ✅ Definitivo |
| 4 Verticais: Crédito · Agro · Saúde · Consumo | ✅ Definitivo |
| SKAMA fora do circuito do Briefing.Co | ✅ Definitivo |

### O que Romano decidiu AGORA (novas diretrizes desta sessão)

| Diretriz | Impacto |
|---|---|
| n8n instalado no servidor — **orquestrador central** | Muda arquitetura V5.1: n8n é o hub único |
| Acessibilidade neurodivergente | Nova feature obrigatória nos artigos |
| Leitura em voz para cegos (TTS) | Feature planejada — Fase 2 |
| Ecossistema de autores: LinkedIn + Substack auto-publish | Nova camada de distribuição |
| Missão global: **maior hub de marketing cooperativo do planeta** | Posicionamento que guia cada decisão |

### O que ainda está aberto (bloqueia o Dossiê)

> [!CAUTION]
> **Pendência crítica:** Romano ainda não entregou o "Estilo Romano" — qualquer análise sua sobre a comunicação de uma cooperativa. Sem isso, o Knowledge Base do Dossiê funciona tecnicamente mas sem alma psicanalítica. **Resolver antes de ativar a Crew Dossiê.**

---

## 🌎 VISÃO E MISSÃO

### Missão
> **Ser o maior hub de inteligência em marketing, estratégia, automação e IA para o mercado cooperativista do planeta — conduzido por Crews de agentes de IA em Human Loop, entregando Vantagem Injusta para decisores que transformam o cooperativismo brasileiro.**

### Posicionamento
O Briefing.Co não é um portal de notícias. É um **motor de inteligência editorial** sob três lentes simultâneas:

| Lente | Framework | Pergunta que guia |
|---|---|---|
| **Subjetividade** | Christian Dunker — *Lógica do Condomínio* | A campanha gera pertencimento real ou exclusão velada? |
| **Consciência** | Eugene Schwartz — *Breakthrough Advertising* | Em que nível está o cooperado? O texto o move para o próximo? |
| **Hack Estratégico** | Engenharia de Sistemas | Onde está o curto-circuito? Qual é o bypass mais eficiente? |

### Público-Alvo
CMOs, Diretores de Marketing, Agências especializadas e Gestores de tecnologia do cooperativismo — **decisores de alto impacto que não têm tempo para conteúdo raso.**

---

## 🗂️ ARQUITETURA EDITORIAL — OS 3 CADERNOS

```
┌─────────────────────────────────────────────────────────────────┐
│  📡 RADAR — Hard News                                           │
│  300 palavras · 2.000 chars mín · Tom: Axios Smart Brevity      │
│  Acesso: LIVRE (sem cadastro)                                   │
│  Cadência: Segunda + Quinta · Gatilho: Automático (n8n Cron)    │
├─────────────────────────────────────────────────────────────────┤
│  🔬 PROTOCOLO — Médio/Hack                                      │
│  800 palavras · 6.000 chars mín · Tom: Axios + Engenharia       │
│  Acesso: DECISOR (cadastro gratuito)                            │
│  Cadência: Quarta · Gatilho: Human-in-loop (Romano aprova)      │
├─────────────────────────────────────────────────────────────────┤
│  📚 DOSSIÊ — Deep Analysis                                      │
│  1.800 palavras · 14.000 chars mín · Tom: The Information       │
│  Acesso: ELITE (assinatura paga)                                │
│  Cadência: Sexta · Gatilho: Human-in-loop obrigatório           │
└─────────────────────────────────────────────────────────────────┘
```

### Regras editoriais inegociáveis (fa.md V3.1)

- **Glossário Banido:** "disruptivo", "sinergia", "alavancar", "pensar fora da caixa"
- **C-MAD obrigatório:** Coop Business + Marketing + Arte/Craft + Design/UX — mínimo 60 chars/pilar
- **Anti-Jabá (Teste do Orfanato):** Remove o sponsor — o artigo ainda tem valor? Não → rejeita
- **Vantagem Injusta:** O texto ensina algo que não está no Google? Não → rejeita

---

## 🤖 ARQUITETURA DE CREWS — n8n como Hub Central

> [!NOTE]
> **Decisão definitiva:** n8n instalado no servidor do Romano é o **orquestrador único**.
> Supabase = banco de dados + autenticação. n8n = toda a lógica de fluxo e agentes.

### Diagrama Geral

```
n8n (Orquestrador Central — servidor local)
│
├── CREW RADAR ──────────────────────────────────────────────────
│   Trigger: Schedule (Seg 07h + Qui 07h)
│   ├── Agent Scout → Serper.dev → source_score ≥ 0.75
│   ├── Agent Sintetizador → OpenAI GPT-4o → Axios Smart Brevity PT-BR
│   ├── Agent Gatekeeper → 5 checks
│   └── Aprovado → Supabase INSERT (status='published') → site ao vivo
│
├── CREW PROTOCOLO ──────────────────────────────────────────────
│   Trigger: Schedule (Ter 09h) → Scout sugere pauta → Slack notificação
│   ├── n8n Wait node (Romano aprova via webhook — SLA 24h)
│   ├── Agent Arquiteto → mapeia problema como circuito lógico
│   ├── Agent Redator Técnico → Problema → Diagnóstico → Solução → ROI
│   ├── Agent Validador de Vertical → sem cross-contamination
│   ├── Agent Gatekeeper → 5 checks
│   └── Aprovado → Supabase INSERT (status='published')
│
└── CREW DOSSIÊ ─────────────────────────────────────────────────
    Trigger: Schedule (Qui 09h) → Scout propõe pauta + hipótese psicanalítica
    ├── n8n Wait node (Romano aprova pauta + hipótese — SLA 24h)
    ├── Agent Analista Crítico → Dunker + Schwartz + Knowledge Base (pgvector)
    ├── Agent Estrategista → dados globais + realidade cooperativista BR
    ├── Agent Editor High-Ticket → The Information style · 1.800+ palavras
    ├── Agent Gatekeeper → validação completa
    ├── n8n Wait node (Romano lê preview → aprovação final)
    └── Supabase INSERT (status='published')
```

### O Gatekeeper — 5 Checks (transversal a todas as Crews)

| # | Check | Critério | Se falhar |
|---|---|---|---|
| 1 | **Densidade** | Radar ≥ 2k / Protocolo ≥ 6k / Dossiê ≥ 14k chars | Reescreve |
| 2 | **Glossário Banido** | Nenhuma palavra da lista negra do fa.md | Substitui |
| 3 | **C-MAD Substância** | ≥ 60 chars por pilar com análise técnica real | Aprofunda |
| 4 | **Vantagem Injusta** | Algo que o gestor não acha no Google | Adiciona camada |
| 5 | **Anti-Jabá (Teste do Orfanato)** | Remove sponsor: artigo ainda tem valor? | Reescreve ângulo |

> **Ciclos:** 1ª falha → reescreve. 2ª falha → Scout revê hipótese. 3ª falha → `status='blocked'` + alerta Slack para Romano.

---

## ♿ ACESSIBILIDADE — Funcionalidades Obrigatórias

### Modo Neurodivergente (Fase 1 — Obrigatório)

> Ser o único portal de cooperativismo com acessibilidade neurodivergente é um diferencial de posicionamento. ~15–20% da população tem TDAH, dislexia ou TEA.

**O que implementar:**
- **Toggle "Modo Foco"** no header de cada artigo:
  - Fonte 18px → 22px, espaçamento de linha 2.0
  - Remove sidebars e distrações visuais
  - Destaca o parágrafo atual com fundo suave
  - Barra de progresso de leitura proeminente
- **Modo Chunks:** divide artigo em seções numeradas com botão "próxima seção"
- **TL;DR automático** no topo de Protocolo e Dossiê (gerado pela Crew)
- **Tempo estimado de leitura** exibido antes do conteúdo

**Stack:** CSS custom properties + JavaScript puro. Estado em localStorage. **Sem bibliotecas externas.**

### Leitura para Deficientes Visuais (Fase 2 — Planejado)

- **Text-to-Speech** via Web Speech API (nativo, gratuito, sem backend)
- Player flutuante: Play/Pause · velocidade 0.75x/1x/1.25x/1.5x · destaque word-by-word
- ARIA labels completos em todos os componentes
- Contraste AA/AAA verificado nas cores dos badges de caderno
- `alt` text gerado automaticamente pela Crew para imagens

---

## ✍️ ECOSSISTEMA DE AUTORES — LinkedIn + Substack

### Perfil de Autor

Cada autor cadastrado tem:
- Perfil público com bio, vertical de especialidade e artigos publicados
- Conexão OAuth com LinkedIn (LinkedIn API)
- Conexão com Substack (API ou RSS)

### Fluxo de Auto-Publicação

```
Romano (ou autor convidado) aprova artigo no Briefing.Co
          ↓
n8n detecta status='published' no Supabase (webhook trigger)
          ↓
┌─────────────────────────────────────────┐
│  LinkedIn: POST via LinkedIn API        │
│  - Versão resumida (300 palavras)       │
│  - Link canônico para o artigo original │
│  - Hashtags geradas automaticamente     │
└─────────────────────────────────────────┘
          +
┌─────────────────────────────────────────┐
│  Substack: POST via API/RSS             │
│  - Radar: artigo completo               │
│  - Protocolo/Dossiê: teaser + link      │
│  - UTM tracking para medir conversão    │
└─────────────────────────────────────────┘
```

### Configuração no Perfil
- Toggle: "Publicar automaticamente no LinkedIn ao publicar"
- Toggle: "Publicar automaticamente no Substack ao publicar"
- Seleção: "Publicar conteúdo completo ou apenas teaser"
- Campo: "Texto de introdução customizado para redes"

---

## 💰 MODELO DE MONETIZAÇÃO

### 3 Camadas de Acesso

| Camada | Conteúdo | Acesso | Objetivo |
|---|---|---|---|
| **Livre** | Radar | Público, sem cadastro | Descoberta + SEO + distribuição viral |
| **Decisor** | Protocolo | Cadastro gratuito | Qualificar audiência + dados para sponsors |
| **Elite** | Dossiê | Assinatura paga | Receita direta + sinal de comprometimento |

### Planos de Assinatura

| Plano | Preço | Inclui |
|---|---|---|
| Decisor Mensal | R$ 97/mês | Protocolo ilimitado + 2 Dossiês/mês |
| Decisor Anual | R$ 797/ano | Idem + arquivo histórico completo |
| Equipe Elite | R$ 297/mês (5 seats) | Tudo + briefing customizado mensal |

### Sponsorship Estratégico (não é publicidade)

| Formato | Entrega | Preço |
|---|---|---|
| Sponsor de Caderno | Logo + menção em todos os Protocolos do mês | R$ 3.500/mês |
| Dossiê Patrocinado | Dossiê com dados do sponsor (passa pelo Gate C-MAD) | R$ 8.000/peça |
| Relatório de Setor | Estudo trimestral com metodologia C-MAD | R$ 25.000/relatório |

### Projeção Conservadora — Fase 3

- 500 assinantes Elite × R$ 797/ano = **R$ 398.500/ano**
- 20 planos Equipe × R$ 297/mês × 12 = **R$ 71.280/ano**
- 2 sponsors × R$ 3.500/mês × 12 = **R$ 84.000/ano**
- **Total: ~R$ 550.000/ano em regime de cruzeiro**

---

## 🗺️ ROADMAP — 3 FASES

### FASE 1 — Fundação (0–90 dias)
> **Meta:** Pipeline n8n funcional + primeiros 30 assinantes pagos

#### Bloco A — Editorial Engine (n8n)
- [ ] Configurar credenciais n8n: OpenAI · Serper.dev · Supabase · Slack
- [ ] Crew Radar: Schedule → Scout → Sintetizador → Gatekeeper → Supabase publish
- [ ] Crew Protocolo: Scout → Slack → Wait node → Arquiteto → Redator → Validador → Gatekeeper
- [ ] Crew Dossiê: Scout → Wait node pauta → Analista → Estrategista → Editor → Wait node aprovação
- [ ] Gatekeeper: evoluir `passesEditorialVoiceCheck` existente com os 5 checks
- [ ] Knowledge Base: ativar pgvector no Supabase + seed com fa.md V3.1

#### Bloco B — Produto (Next.js)
- [ ] Indicador de caderno nos artigos: `RADAR · 3 min · Hard News`
- [ ] TL;DR automático no topo de Protocolo e Dossiê
- [ ] **Modo Neurodivergente:** toggle Foco + Modo Chunks + progresso + tempo estimado
- [ ] Sistema de cadastro Camada 2: nome + email + cargo + vertical
- [ ] Paywall Camada 3 (Stripe — PIX + cartão)
- [ ] Botão compartilhar com UTM tracking (WhatsApp · LinkedIn · Copy)

#### Bloco C — Distribuição
- [ ] Newsletter semanal (Resend): template de marca + segmentação por vertical
- [ ] Integração LinkedIn API (auto-publish ao aprovar artigo)
- [ ] Integração Substack (API ou RSS push)

#### Bloco D — Pendência Crítica
- [ ] Romano escreve/dita análise "Estilo Romano" (1 campanha cooperativista)
- [ ] Winston estrutura e insere no KB como padrão-zero do Dossiê

**Critério de conclusão:** Crew Radar autônoma (2x/semana) + 500 cadastros Decisor + 30 assinantes Elite.

---

### FASE 2 — Tração (90–180 dias)
> **Meta:** R$ 15.000/mês MRR + primeiro sponsor

- [ ] Dashboard do assinante com feed personalizado por vertical
- [ ] Feedback loop: engagement_score retroalimenta relevance_score das Crews
- [ ] **TTS (Fase 2):** Web Speech API + player flutuante + highlight word-by-word + ARIA
- [ ] Fechar primeiro Sponsor de Caderno (target: fintech cooperativista)
- [ ] LinkedIn Newsletter automatizada via n8n (curadoria semanal)
- [ ] Sub-newsletters segmentadas por vertical (Crédito / Agro / Saúde / Consumo)
- [ ] Perfil público de autor com artigos publicados e configurações de auto-publish

**Critério de conclusão:** 150 assinantes Elite + R$ 15.000/mês MRR + 1 sponsor ativo.

---

### FASE 3 — Autoridade Global (180–365 dias)
> **Meta:** Referência #1 em marketing cooperativo no planeta

- [ ] Relatório de Setor patrocinado: "Marketing Cooperativista 2027" (R$ 25.000)
- [ ] Briefing Elite Presencial: evento trimestral para 50 decisores (R$ 75.000/evento)
- [ ] C-MAD como metodologia licenciável para agências (R$ 15.000–50.000/licença)
- [ ] Versão em inglês do Radar para audiência WOCCU/global
- [ ] API pública: relevance_score + engagement_score por tema cooperativista
- [ ] Expansão de verticais: Habitação + Infraestrutura + Educação

**Critério de conclusão:** 500 assinantes Elite + R$ 45.000/mês MRR + 1 parceiro internacional.

---

## 🏗️ STACK TÉCNICO DEFINITIVO

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + Vanilla CSS | Portal, artigos, paywall, dashboard |
| **Banco** | Supabase (PostgreSQL + pgvector) | Artigos, usuários, leads, KB, scores |
| **Auth** | Supabase Auth | Login, sessões, controle de camadas |
| **Orquestrador** | **n8n (servidor Romano)** | Todas as Crews, human-in-loop, schedules |
| **LLM** | OpenAI GPT-4o (via n8n HTTP node) | Geração por agente |
| **Busca** | Serper.dev (via n8n) | Scout do Radar e Protocolo |
| **Knowledge Base** | pgvector no Supabase | RAG para Crew Dossiê |
| **Email** | Resend | Newsletter + transacionais |
| **Pagamento** | Stripe | Assinaturas + PIX |
| **Notificações** | Slack (via n8n Slack node) | Alertas de pauta + rejeições |
| **LinkedIn** | LinkedIn API (via n8n) | Auto-publish por autor |
| **Substack** | Substack API/RSS (via n8n) | Auto-publish por autor |
| **Hospedagem** | Vercel | Frontend + API Routes |
| **TTS** | Web Speech API (nativo) | Leitura para cegos — Fase 2 |

---

## 📐 ESPECIFICAÇÃO DE TELAS (Para Claude Code)

### Tela 1 — Home
- Manchete principal: Dossiê mais recente com CTA de assinar
- Feed de Radares (livre, sem barreira)
- Seção "Por que isso não é um release" (metodologia visível)
- CTA de cadastro Decisor proeminente
- Badges: `RADAR` (azul) · `PROTOCOLO` (âmbar) · `DOSSIÊ` (índigo)

### Tela 2 — Artigo Radar
- Conteúdo completo, sem paywall
- TL;DR automático no topo (2–3 bullets gerados pela Crew)
- Toggle Modo Neurodivergente no header
- Tempo estimado de leitura
- Barra de compartilhamento (WhatsApp · LinkedIn · Copy)
- CTA no final: "Esse foi o Radar. O Protocolo vai mais fundo →"

### Tela 3 — Artigo Protocolo (requer cadastro)
- Preview: primeiras 200 palavras abertas
- Formulário: nome + email + cargo + vertical
- Conteúdo completo após confirmação de email
- Box "O gestor faz isso amanhã" em cada seção
- Toggle Modo Neurodivergente + TL;DR no topo

### Tela 4 — Artigo Dossiê (requer assinatura)
- Preview: título + lead + 1 parágrafo + índice
- Paywall mid-content com planos
- Para assinantes: leitura completa + save/favorito + TTS player (Fase 2)
- C-MAD summary no rodapé

### Tela 5 — Dashboard do Assinante (Fase 2)
- Feed personalizado por vertical
- Arquivo completo de Dossiês com busca
- Configurações de auto-publish (LinkedIn + Substack)
- Badge "Membro há X meses"

---

## 🔑 INSTRUÇÕES PARA O CLAUDE CODE

> [!IMPORTANT]
> **Leia isso antes de escrever qualquer linha.**

### Regras absolutas
1. **Não altere o `fa.md`** — é a SSOT sagrada. Nunca toque.
2. **Nenhum `status='published'` direto** — sempre passa pelo Gatekeeper.
3. **Cada Crew é um workflow n8n separado** — não colapse em um único fluxo.
4. **Modo Neurodivergente é CSS puro + JS puro** — sem bibliotecas externas.
5. **UTM tracking em todos os links de compartilhamento** — sem exceção.
6. **Stripe como plataforma de pagamento** — PIX via Stripe (suportado nativo).
7. **pgvector no Supabase existente** — não crie nova instância de banco.

### Ordem de implementação recomendada
```
1. n8n: Crew Radar (mais simples — testa toda a pipeline end-to-end)
2. Next.js: indicador de caderno + TL;DR nos artigos existentes
3. Next.js: Modo Neurodivergente (toggle + CSS custom properties)
4. Next.js: sistema de cadastro Camada 2 + tabela leads no Supabase
5. n8n: Crew Protocolo (Wait node + Slack notification)
6. Stripe: paywall Camada 3 + tabela subscriptions
7. n8n: Crew Dossiê (requer KB populado com "Estilo Romano")
8. n8n: auto-publish LinkedIn + Substack (pós-aprovação)
9. Resend: newsletter semanal automatizada por vertical
10. Fase 2: TTS + dashboard do assinante + feedback loop
```

### Variáveis de ambiente necessárias
```env
# Já existentes (verificar)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Novas — Fase 1
OPENAI_API_KEY=           # n8n HTTP node → OpenAI
SERPER_API_KEY=           # Scout (busca de notícias)
STRIPE_SECRET_KEY=        # Paywall Camada 3
STRIPE_WEBHOOK_SECRET=    # Confirmação de pagamento
RESEND_API_KEY=           # Newsletter
SLACK_WEBHOOK_URL=        # Alertas do Gatekeeper

# Novas — Fase 1 (distribuição)
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
SUBSTACK_API_KEY=         # Verificar disponibilidade; fallback: RSS
```

---

## ✅ CHECKLIST DE VALIDAÇÃO — Romano aprova antes de implementar

- [ ] **Verticals corretas?** Crédito · Agro · Saúde · Consumo
- [ ] **Cadência aprovada?** Seg/Qui Radar · Qua Protocolo · Sex Dossiê
- [ ] **Preços validados?** R$ 97/mês · R$ 797/ano · R$ 297/mês equipe
- [ ] **n8n URL confirmada** para integração Supabase + OpenAI + Slack
- [ ] **Stripe confirmado** como plataforma de pagamento
- [ ] **Knowledge Base:** Romano entrega análise "Estilo Romano" (desbloqueia Dossiê)
- [ ] **LinkedIn OAuth:** Romano autoriza app developer para auto-publish
- [ ] **Substack:** confirmar API disponível ou usar RSS como fallback

---

## 📊 MÉTRICAS DE SUCESSO POR FASE

| Fase | Métrica | Meta |
|---|---|---|
| Fase 1 | Cadastros Decisor | 500 |
| Fase 1 | Assinantes Elite | 30 |
| Fase 1 | Crew Radar autônoma | 2x/semana sem falha |
| Fase 2 | MRR | R$ 15.000/mês |
| Fase 2 | Taxa abertura newsletter | ≥ 40% |
| Fase 2 | Sponsors ativos | 1 |
| Fase 3 | Assinantes Elite | 500 |
| Fase 3 | MRR | R$ 45.000/mês |
| Fase 3 | Presença internacional | 1 parceiro WOCCU |

---

*Blueprint produzido por Winston (Chief Architect) · Briefing.Co · Mai 2026*
*Baseado em: fa.md V3.1 · john_prd_briefingco.md · crews_architecture.md V5.1 · mary_auditoria_mercado_fa.md · Decisões do fundador Romano (sessão 02 Mai 2026)*
*Este documento substitui todas as versões anteriores como guia de implementação para o Claude Code.*
