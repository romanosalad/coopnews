# 🤖 Arquitetura de Crews — Briefing.Co
**Documento: crews_architecture.md — Master Blueprint V5.1 DEFINITIVO**
**Baseado em: fa.md V3.1 + john_prd_briefingco.md + mary_auditoria_mercado_fa.md**
**Autor: Auditor-Chefe | Data: 02 Mai 2026 | Status: V5.1 — Aprovado para revisão final**

> [!IMPORTANT]
> Este documento não altera código. Define a arquitetura conceitual das Crews de produção autônoma e do Gatekeeper transversal. Serve como blueprint técnico para implementação futura.
> **SKAMA: fora do circuito. n8n: substituído por Supabase + NocoDB + Railway direto.**

---

## 0. Mantra e Linha Editorial

> **"Valor Concreto acima de tudo."**
> Inteligência de Mercado e Subjetividade Cooperativa.

O Briefing.Co opera sob **três lentes editoriais simultâneas**. Nenhum conteúdo é publicado sem passar pelas três:

| Lente | Autor/Framework | Pergunta que guia a análise |
|---|---|---|
| **Subjetividade** | Christian Dunker — *Mal-estar, Sofrimento e Sintoma* | A campanha gera pertencimento real ou reforça exclusão velada? |
| **Consciência** | Eugene Schwartz — *Breakthrough Advertising* | Em qual nível de consciência está o cooperado/gestor? O conteúdo move ele para o próximo? |
| **Hack Estratégico** | Engenharia de Sistemas (lógica de circuito) | Onde está o curto-circuito burocrático? Qual é o bypass mais eficiente? |

---

## 1. Decisões de Infraestrutura — Definitivas

| Componente | Decisão | Racional |
|---|---|---|
| **Orquestrador** | ~~n8n~~ → **Supabase + NocoDB + Railway direto** | n8n removido. Webhooks nativos substituem. |
| **Crew Radar** | Supabase Edge Functions (`index.ts` evoluído) | Leve, serverless, já no stack. |
| **Crew Protocolo** | Supabase Edge Functions (módulo separado) | Intermediário — não precisa de Python. |
| **Crew Dossiê** | Railway + Python/CrewAI (FastAPI, worker persistente) | Carga pesada, RAG, 14k chars. Não cabe em Edge Function. |
| **Human-in-loop** | NocoDB (pauta) → Slack (notificação) → NocoDB checkbox (aprovação) → Supabase webhook (disparo) | Sem n8n: Edge Function recebe o webhook do NocoDB diretamente. |
| **Automação leve** | Supabase Edge Functions (sem Make) | Make desnecessário para volume atual. Webhooks puros são mais baratos e integrados. |
| **Publicação** | NocoDB checkbox aprovado → Supabase Edge Function → `UPDATE contents SET status='published'` | **Vercel não é destino do webhook.** Ela lê o Supabase — o toggle de status é suficiente. |
| **Hospedagem Python** | **Railway** (Fase 1) → migrar para Fly.io quando houver volume | Railway: DX superior, git push, ~R$ 80–120/mês. Fly.io: 30% mais barato, mais configuração. |
| **Knowledge Base** | pgvector no Supabase existente (sem ChromaDB extra) | Evita nova infra. pgvector já suportado no plano Pro do Supabase. |

> [!WARNING]
> **Crítica #1 — O fluxo NocoDB → Vercel não existe:**
> Vercel hospeda o Next.js mas não tem endpoint de publicação. O conteúdo é publicado quando `status = 'published'` no Supabase — ponto. O webhook deve sempre ir para uma **Supabase Edge Function**, nunca para a Vercel diretamente.

---

## 2. As Três Referências Editoriais (Q1 Respondida)

Para além de Dunker e Schwartz, os agentes usam **3 referências de tom de voz**:

### 2.1 Tom do Radar — Axios (Smart Brevity)
**Por quê:** O Radar precisa ser consumido em 90 segundos. Axios desenvolveu a metodologia Smart Brevity especificamente para leitores B2B que não têm tempo mas não abrem mão de profundidade.

**Princípios que os agentes aplicam:**
- **"What's New"** em 1 frase. **"Why It Matters"** em 2.
- Parágrafos de no máximo 2 linhas. Lead-ins em negrito como âncoras de leitura.
- Headline < 60 chars. Factual, sem adjetivos.
- Proibido: introduções. O artigo começa no fato.

### 2.2 Tom do Dossiê — The Information
**Por quê:** The Information é a referência mundial de jornalismo investigativo B2B pago. Modelo de negócio idêntico ao que o Briefing.Co quer: assinantes que pagam porque o conteúdo **não existe em lugar nenhum**.

**Princípios que os agentes aplicam:**
- Investigação de "o que acontece por dentro" — não o que a assessoria divulga.
- Cruzamento de fontes primárias (dados) com análise de impacto estratégico.
- Linguagem direta, sofisticada, nunca corporativa. Escreve para executivos que já sabem o básico.
- Cada matéria responde: *"Por que isso importa para quem toma decisões hoje?"*

### 2.3 Tom do Protocolo — Axios + Engenharia de Sistemas
**Por quê:** O Protocolo é técnico mas não acadêmico. A referência é um engenheiro explicando um circuito para um gestor: preciso, direto, com resultado esperado claro.

**Princípios que os agentes aplicam:**
- Estrutura: Problema → Diagnóstico → Solução → ROI esperado.
- Cada seção tem um box **"O gestor faz isso amanhã"** — ação concreta, não teoria.
- Evitar exemplos que não sejam da vertical do artigo (Crédito não usa case de Agro).

---

## 3. Temas Técnicos do Protocolo — Mapa Completo (Q2 Respondida)

Com base em pesquisa de tendências do cooperativismo 2025–2026:

### Eixo 1 — IA e Dados (Core)
| Tema | Aplicação Cooperativista | Urgência |
|---|---|---|
| **IA Generativa aplicada ao CRM** | Personalização de comunicação por momento de vida do cooperado | 🔴 Alta |
| **Automação de backoffice** | Concessão de crédito, cadastro, compliance automatizados | 🔴 Alta |
| **Hiperpersonalização de conteúdo** | Entregar a mensagem certa para o cooperado no momento certo | 🟠 Média-Alta |
| **Ética no algoritmo** | Evitar viés em modelos de crédito e atendimento | 🟠 Média-Alta |

### Eixo 2 — Open Finance e Pagamentos
| Tema | Aplicação Cooperativista | Urgência |
|---|---|---|
| **Open Finance e portabilidade de crédito** | Como a cooperativa retém o cooperado quando ele pode levar seu histórico para qualquer banco | 🔴 Alta |
| **Pix Automático e Pix Recorrente** | Substituição de cartão em cobranças recorrentes — impacto na experiência do cooperado | 🟠 Média |
| **APIs bancárias e integração de sistemas legados** | O principal obstáculo técnico do setor cooperativista | 🔴 Alta |

### Eixo 3 — Martech e Comunicação
| Tema | Aplicação Cooperativista | Urgência |
|---|---|---|
| **WhatsApp como canal de relacionamento** | Não como suporte reativo — como canal de cocriação e vínculo | 🟠 Média |
| **CRM unificado (agência → matriz)** | O maior gap de comunicação interna do sistema cooperativo | 🔴 Alta |
| **Jornada digital do cooperado** | Mapeamento e otimização dos touchpoints de adesão e retenção | 🟠 Média-Alta |

### Eixo 4 — ESG e Governança
| Tema | Aplicação Cooperativista | Urgência |
|---|---|---|
| **ESG mensurável em tempo real** | Indicadores auditáveis além do relatório anual | 🟠 Média |
| **Rastreabilidade na cadeia agro** | Blockchain e identificação digital como diferencial de exportação | 🟡 Baixa-Média |
| **Governança digital participativa** | Assembleias digitais, democracia cooperativa no ambiente online | 🟠 Média |

> [!NOTE]
> **Para o Agente Validador de Vertical:** cada tema acima tem afinidade diferente por vertical.
> Open Finance → Crédito (🔴) / Pix Automático → Consumo (🟠) / Rastreabilidade → Agro (🔴) / Jornada digital do cooperado-médico → Saúde (🔴)

---

## 4. O Knowledge Base do Dossiê — Estrutura Definitiva (Q3 — A Lacuna Crítica)

> [!CAUTION]
> **Crítica #2 — Q3 ainda não foi respondida. Esta é a questão mais importante.**
> Você não confirmou se possui análises escritas de campanhas cooperativistas.
> Sem isso, o Knowledge Base do Dossiê é uma casca: tem estrutura, não tem alma.

### O que o KB precisa ter (em ordem de impacto):

| Componente | O que é | Quem produz | Status |
|---|---|---|---|
| **Análises "estilo Romano"** | Notas, rascunhos, qualquer texto onde você analisa uma campanha da Sicredi/Unimed/Sicoob com a lente psicanalítica | Romano | ⚠️ **Pendente** |
| **Conceitos operacionalizados de Dunker** | Não o livro — mas 10–15 frases que explicam como a "lógica do condomínio" aparece na comunicação cooperativista | Romano + Auditor | 🟡 A fazer |
| **Escada de Schwartz contextualizada** | Os 5 níveis mapeados para o gestor cooperativista (não para e-commerce) | Auditor | 🟡 A fazer |
| **Casos de branding cooperativista** | Sicredi (campanha "Voa"), Unimed BH (jornada do médico), Sicoob (identidade visual 2024) — análise factual | Scout + Investigador | 🟢 Agentes fazem |
| **Glossário Banido (fa.md)** | Lista de expressões que o Gatekeeper bloqueia automaticamente | fa.md existente | ✅ Existe |
| **Rubrica C-MAD** | Critérios de substância por pilar (mínimo 60 chars por campo) | fa.md existente | ✅ Existe |

> [!WARNING]
> **A IA calibra o "estilo Romano" por analogia, não por teoria.**
> Um rascunho de 500 palavras seu analisando qualquer campanha cooperativista vale mais do que 10 PDFs de Dunker no Knowledge Base. Se você não tem esse material escrito ainda, a alternativa é: você escreve 1 análise de exemplo junto comigo, e ela vira o padrão-zero do KB.

---

## 5. Arquitetura de Crews — V5.1 Definitivo

### Visão Geral

```
GATILHO
├── Cron automático (Radar: Seg/Qui)
└── NocoDB pauta sugerida → Slack notificação → Checkbox aprovação
                                                        │
                                              Supabase Edge Function
                                              recebe webhook do NocoDB
                                                        │
                        ┌───────────────────────────────┤
                        │                               │
                CREW A — RADAR              CREW B — PROTOCOLO
              (Edge Function)               (Edge Function)
                Automático                  Human-gate
                        │                               │
                        └───────────┬───────────────────┘
                                    │
                           CREW C — DOSSIÊ
                          (Railway + Python)
                           Human-gate obrig.
                           Callback assíncrono
                                    │
                         ┌──────────▼──────────┐
                         │   GATEKEEPER         │
                         │   (The Judge)        │
                         │   index.ts evoluído  │
                         └──────────┬──────────┘
                                    │
                       ┌────────────┴────────────┐
                  APROVADO                   REJEITADO
              status='published'         status='draft'
              Supabase auto              feedback → Crew reescreve
                                         (máx. 2 ciclos)
```

---

### 5.1 Crew A — Radar (Execução: Supabase Edge Functions)

**Caderno:** Hard News | **Mínimo:** 2.000 chars | **Cadência:** Seg + Qui | **Gatilho:** Automático com double-gate

**Pipeline:**
```
[SCOUT]
  → busca Serper.dev com termos mapeados por vertical
  → calcula source_score (relevância + frescor + pertencimento cooperativista)
  → source_score ≥ 0.75? Não → descarta. Sim → continua
  → detecta vertical automaticamente (palavras-chave + fonte)
         ↓
[SINTETIZADOR — Axios Smart Brevity]
  → reescreve em PT-BR cooperativista, 300–400 palavras
  → estrutura: "O que aconteceu" → "Por que importa para o gestor"
  → Título < 60 chars | Lead < 2 frases
  → Proibido: introduções, adjetivos corporativos, opinião sem dado
         ↓
[GATEKEEPER]
  → output_score ≥ 0.80? Não → fila revisão manual. Sim → publica
```

**Agentes:**

| Agente | Missão | Fonte da Verdade | Restrição |
|---|---|---|---|
| **Scout** | Monitora fontes por vertical, calcula source_score | Serper.dev + lista de fontes por vertical (seção 3) | Proibido ingerir releases de assessoria (detectado por domínio da fonte) |
| **Sintetizador** | Reescreve aplicando Smart Brevity cooperativista | Axios style guide + fa.md V3.1 | Proibido: mais de 2 linhas por parágrafo. Proibido: repetir o lead no corpo. |

---

### 5.2 Crew B — Protocolo (Execução: Supabase Edge Functions)

**Caderno:** Médio/Hack | **Mínimo:** 6.000 chars | **Cadência:** Quarta | **Gatilho:** Human-in-loop (NocoDB → Slack → aprovação → webhook)

**Pipeline:**
```
[SCOUT ESTRATÉGICO]
  → sugere pauta + tema técnico do Eixo 1/2/3/4 (seção 3)
  → detecta vertical + registra no NocoDB
  → notifica Slack: "Nova pauta Protocolo sugerida. [Tema] [Vertical] [Urgência]"
         ↓ Romano aprova (SLA: 24h. Sem resposta = agenda próxima semana)
[ARQUITETO DE SISTEMAS]
  → mapeia o problema como circuito lógico
  → pergunta-guia: "Onde está o curto? Qual é o bypass mais econômico?"
  → define o fluxo da solução em etapas numeradas
         ↓
[REDATOR TÉCNICO — Axios + Engenharia]
  → traduz para linguagem do gestor: Problema → Diagnóstico → Solução → ROI
  → insere box "O gestor faz isso amanhã" em cada seção
  → 800–1.200 palavras | H2 a cada 300 palavras
         ↓
[VALIDADOR DE VERTICAL]
  → verifica que todos os exemplos e dados pertencem à vertical aprovada
  → Crédito ≠ Agro ≠ Saúde ≠ Consumo. Sem exceções.
         ↓
[GATEKEEPER]
```

---

### 5.3 Crew C — Dossiê (Execução: Railway + Python/CrewAI — Assíncrono)

**Caderno:** Deep Analysis | **Mínimo:** 14.000 chars | **Cadência:** Sexta | **Gatilho:** Human-in-loop obrigatório

> [!NOTE]
> **Padrão assíncrono obrigatório** (crítica técnica anterior validada):
> Railway recebe `202 Accepted` + `correlation_id` do webhook do NocoDB.
> Ao finalizar, a Crew faz POST de volta para Supabase Edge Function com resultado + correlation_id.
> Tempo estimado de processamento: 20–45 minutos.
> Custo estimado por peça: R$ 6–12 em tokens.

**Pipeline:**
```
[SCOUT ESTRATÉGICO]
  → propõe pauta com HIPÓTESE PSICANALÍTICA obrigatória
  → formato da proposta no NocoDB:
    - Tema: [ex: "Campanha Sicredi 2026"]
    - Hipótese: [ex: "A campanha vende pertencimento mas pratica segregação
                      velada pela linguagem financeira excludente"]
    - Vertical: [Crédito]
    - Schwartz Level do público-alvo: [Nível 2 — Problem Aware]
         ↓ Romano aprova pauta + hipótese (SLA: 24h)
[ANALISTA CRÍTICO — Dunker + Schwartz]
  → investiga o "não-dito" na comunicação da cooperativa analisada
  → aplica Lógica do Condomínio: "A campanha inclui ou exclui? Quem fica do lado de fora?"
  → identifica o Nível de Consciência do cooperado e como o texto deve movê-lo
  → Knowledge Base: análises "estilo Romano" + conceitos Dunker operacionalizados
         ↓
[ESTRATEGISTA DE MERCADO — Investigador]
  → cruza dados globais (WOCCU, The Information, Axios Pro Markets)
    com realidade brasileira (OCB, inova.coop.br, mundocoop.com.br)
  → regra de ouro: todo dado = fonte verificável citada
  → sem fonte = INSUFFICIENT_CONTEXT → não inventa. Registra a lacuna.
         ↓
[EDITOR HIGH-TICKET — The Information style]
  → monta o artigo de 1.800+ palavras (14.000+ chars)
  → estrutura obrigatória:
    ① Lead psicanalítico (a "falta" em 1 parágrafo)
    ② Contexto de mercado com dados verificados
    ③ Análise da comunicação sob as 3 lentes
    ④ Implicações práticas para o gestor (Schwartz → CTA implícito)
    ⑤ C-MAD completo (≥ 60 chars/pilar)
    ⑥ Box "Vantagem Injusta": o que o gestor leva que não acha no Google
  → H2 a cada 300 palavras | Tom: The Information — sofisticado, direto, sem verniz
         ↓
[GATEKEEPER] → validação completa (ver seção 6)
         ↓ Aprovado → Supabase status='review'
Romano faz leitura final → publica manualmente (única ação 100% humana)
```

---

## 6. O Gatekeeper — The Judge (Evoluído do `passesEditorialVoiceCheck`)

**Runtime:** Supabase Edge Function (refatoração do existente — sem nova infra)
**Ativado por:** Output de qualquer Crew, antes de qualquer mudança de status

### Os 5 Checks — Em Ordem de Execução

| # | Check | Critério | Ação se falhar |
|---|---|---|---|
| 1 | **Densidade** | Radar ≥ 2k chars / Protocolo ≥ 6k / Dossiê ≥ 14k | `status='draft'` → reescrever |
| 2 | **Glossário Banido** | Nenhuma expressão da lista negra do fa.md | `status='draft'` → substituir termos |
| 3 | **C-MAD Substância** | Cada pilar (Negócio, Marketing, Arte, UX) com ≥ 60 chars de análise técnica | `status='draft'` → aprofundar pilar fraco |
| 4 | **Vantagem Injusta** | O texto ensina algo não encontrável no portal da OCB ou Google genérico? | `status='draft'` → "adicione a camada de profundidade" |
| 5 | **Anti-Jabá (Teste do Orfanato)** | Texto existe e entrega valor sem o sponsor? | `status='draft'` → "encontre o ângulo independente" |

### O Teste do Orfanato — Critério Anti-Jabá

```
PERGUNTA INTERNA DO GATEKEEPER:

"Se eu remover TODAS as menções a [marca/patrocinador] deste artigo,
ele ainda entrega inteligência estratégica real ao gestor cooperativista?"

→ SIM: A marca é contexto. Passa.
→ NÃO: É jabá. Status = 'draft'.
        decision_log registra: "Jabá detectado. Texto depende da marca
        para existir. Reescrever com ângulo investigativo independente."
```

### Ciclos de Reescrita

```
1ª rejeição → Crew recebe feedback específico do Gatekeeper → reescreve
2ª rejeição → Crew reescreve + Scout revisa hipótese inicial
3ª rejeição → status = 'blocked'
              Slack: "⚠️ Artigo [slug] falhou 3x no Gatekeeper.
                      Decisão editorial manual necessária."
```

---

## 7. Mapeamento de Fontes por Vertical (Scout Reference)

| Vertical | Fontes Primárias Confiáveis | Fontes a Evitar |
|---|---|---|
| 🏦 **Crédito** | bancoob.com.br, sicredi.com.br, sicoob.com.br, celcoin.com.br, WOCCU | Assessorias de imprensa, notas da OCB genéricas |
| 🌾 **Agro** | coamo.com.br, cocamar.com.br, gs1br.org (rastreabilidade), MAPA | Releases de PR sem dado verificável |
| 🏥 **Saúde** | unimed.com.br, ANS dados, CFM, cooperativas médicas regionais | Marketplaces de saúde sem relação com cooperativismo |
| 🛒 **Consumo** | OCB dados de consumo, empresasecooperativas.com.br, cooperativas de habitação | Varejo genérico sem conexão cooperativista |
| 🌍 **Global** | WOCCU, The Information, Axios Pro Markets, inova.coop.br | Portais generalistas de marketing digital |

---

## 8. O que Ainda Falta — Decisões Abertas Finais

> [!CAUTION]
> **Uma única questão bloqueia a Crew Dossiê de funcionar com identidade:**

### Q3 — O "Estilo Romano" no Knowledge Base

A pergunta foi feita 3 vezes. Ainda não foi respondida com material concreto.

**O que é necessário:**
Qualquer texto de sua autoria (mesmo rascunho, nota de voz transcrita, análise informal) onde você aplica uma visão crítica sobre a comunicação de uma cooperativa. Pode ser:
- Uma análise de 5 minutos da campanha da Sicredi
- Uma observação sobre o que a Unimed erra na comunicação com o médico cooperado
- Uma crítica ao posicionamento digital do Sicoob

**Formato não importa.** Importa que seja **seu olhar**, não um template genérico de análise.

**Alternativa se não houver material:**
Numa próxima sessão, você descreve oralmente como analisaria uma campanha, eu transcrevo e estruturo. Esse texto se torna o "padrão-zero" do Knowledge Base e o agente aprende por analogia.

> [!NOTE]
> **Enquanto Q3 não for respondida:** A Crew Dossiê produz análises tecnicamente corretas, estruturalmente sólidas e factualmente verificadas — mas sem o tom psicanalítico específico do Briefing.Co. O risco é soar como The Information sem a alma de Dunker. Funciona, mas não é o produto definitivo.

---

## 9. Custo de Operação Estimado — Fase 1 (Mensal)

| Componente | Custo Estimado |
|---|---|
| Railway (worker Dossiê — always-on, 512MB RAM) | R$ 80–120/mês |
| Tokens OpenAI (4 Dossiês + 8 Protocolos + 8 Radares/mês) | R$ 40–80/mês |
| Supabase Pro (pgvector + Edge Functions) | ~R$ 140/mês (já no stack) |
| NocoDB (self-hosted ou cloud free tier) | R$ 0–30/mês |
| **Total incremental (apenas o que é novo)** | **R$ 120–230/mês** |

> Comparação: 3 assinantes Elite (R$ 97/mês cada) cobrem 100% do custo operacional das Crews.

---

## 10. O que Este Documento Não Faz

> [!IMPORTANT]
> Nenhuma linha de código foi alterada para produzir este documento.
> O fa.md V3.1 permanece intocado e é a SSOT incontestável.
> Qualquer implementação futura das Crews deve ser aprovada pelo Auditor-Chefe antes de alterar o `index.ts`.

---

*Blueprint produzido com base em: fa.md V3.1, john_prd_briefingco.md, mary_auditoria_mercado_fa.md, crítica editorial V5.1 (mai/2026).*
*Referências de pesquisa: CrewAI Docs, Railway vs Fly.io benchmark, Axios Smart Brevity Style Guide, The Information editorial model, Christian Dunker "Mal-estar, Sofrimento e Sintoma" (2015), Eugene Schwartz "Breakthrough Advertising" (1966/2004), OCB/inova.coop.br dados cooperativismo BR 2026.*
