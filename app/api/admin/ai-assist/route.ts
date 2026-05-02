import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

const OPENAI_MODEL = "gpt-4o-mini";

const SYSTEM_VOICE = `Voce e o Editor-Chefe do CoopNews. Voz: fusao de Meio & Mensagem (precisao factual, atribuicao de fonte, dado especifico, nome de marca, agencia, executivo), B9 (irreverencia, ironia leve, frases curtas, conversacional), Mundo do Marketing (analise estrategica entre fato e consequencia).

Regras duras:
- Nunca abrir com 'No cenario atual', 'Em um mundo cada vez mais', 'Surge como', 'Uma nova', 'A crescente demanda', 'A inovacao nao se limita', 'Em meio a transformacoes'.
- Nunca usar 'visa democratizar', 'busca posicionar', 'tem como objetivo', 'se propoe a', 'esta comprometida com', 'reforca seu compromisso', 'alavancar', 'potencializar', 'abordagem disruptiva', 'solucao inovadora'.
- Maximo 3 frases por paragrafo. Evite voz passiva quando tiver agente.
- Cite marca, agencia, valor, share quando o material trouxer.
- Sempre que possivel referencie a leitura para o mercado cooperativista (associado, cooperativa, credit union).

Responda APENAS com JSON valido no schema solicitado.`;

type ActionType = "titles" | "polish_dek" | "voice_check" | "cmad" | "cover_brief";

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "missing OPENAI_API_KEY env var on the Next.js host" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const action: ActionType = body.action;
  const draft = (body.draft ?? {}) as Record<string, string>;

  if (!action) return NextResponse.json({ error: "missing action" }, { status: 400 });

  try {
    switch (action) {
      case "voice_check":
        return NextResponse.json(voiceCheck(draft.body_markdown ?? ""));
      case "titles":
        return NextResponse.json(await suggestTitles(apiKey, draft));
      case "polish_dek":
        return NextResponse.json(await polishDek(apiKey, draft));
      case "cmad":
        return NextResponse.json(await draftCmad(apiKey, draft));
      case "cover_brief":
        return NextResponse.json(await composeCoverBrief(apiKey, draft));
      default:
        return NextResponse.json({ error: `unknown action ${action}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}

const BANNED_OPENERS = [
  "no cenario atual",
  "no cenário atual",
  "em um mundo cada vez mais",
  "surge como uma",
  "surge como o",
  "uma nova alternativa",
  "a crescente demanda",
  "a inovacao nao se limita",
  "a inovação não se limita",
  "em meio a transformacoes",
  "em meio a transformações",
  "no contexto atual"
];

const BANNED_PHRASES = [
  "visa democratizar",
  "busca posicionar",
  "tem como objetivo",
  "se propoe a",
  "se propõe a",
  "esta comprometida com",
  "está comprometida com",
  "reforca seu compromisso",
  "reforça seu compromisso",
  "alavancar resultados",
  "potencializar resultados",
  "abordagem disruptiva",
  "solucao inovadora",
  "solução inovadora"
];

function voiceCheck(markdown: string) {
  const normalized = markdown
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

  const issues: { kind: "opener" | "phrase" | "jumbao" | "no_h2" | "passive"; detail: string }[] = [];

  const firstParagraph = normalized.split(/\n{2,}/)[0] ?? "";
  for (const phrase of BANNED_OPENERS) {
    if (firstParagraph.startsWith(phrase)) {
      issues.push({ kind: "opener", detail: `Abertura banida: "${phrase}"` });
      break;
    }
  }

  for (const phrase of BANNED_PHRASES) {
    if (normalized.includes(phrase)) {
      issues.push({ kind: "phrase", detail: `Expressão de release: "${phrase}"` });
    }
  }

  const paragraphs = markdown.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  paragraphs.forEach((p, index) => {
    const sentenceCount = (p.match(/[.!?]+(\s|$)/g) ?? []).length;
    if (sentenceCount >= 5) {
      issues.push({ kind: "jumbao", detail: `Parágrafo ${index + 1}: ${sentenceCount} frases (máx 3 recomendado).` });
    }
  });

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const headingCount = (markdown.match(/^#{1,3}\s+/gm) ?? []).length;
  if (wordCount > 600 && headingCount < 2) {
    issues.push({ kind: "no_h2", detail: `Texto longo (${wordCount} palavras) com apenas ${headingCount} H2. Recomendado ≥2.` });
  }

  return { issues, score: Math.max(0, 100 - issues.length * 12) };
}

async function suggestTitles(apiKey: string, draft: Record<string, string>) {
  const response = await callOpenAI(apiKey, [
    {
      role: "system",
      content: SYSTEM_VOICE
    },
    {
      role: "user",
      content: `Gere 5 sugestoes de TITULO editorial em portugues do Brasil para a materia abaixo. Cada titulo MAX 75 caracteres. Use 5 formulas distintas (uma por sugestao):
1. Pergunta provocativa
2. Tese forte
3. Contraste
4. Numero + insight
5. Cena curta

Retorne JSON: {"titles": ["...", "...", "...", "...", "..."]}.

Pre-resumo atual: ${draft.dek}
Corpo:
${(draft.body_markdown ?? "").slice(0, 4000)}`
    }
  ]);
  return response;
}

async function polishDek(apiKey: string, draft: Record<string, string>) {
  const response = await callOpenAI(apiKey, [
    { role: "system", content: SYSTEM_VOICE },
    {
      role: "user",
      content: `Reescreva o pre-resumo abaixo em UMA sentenca editorial autonoma de no MAXIMO 160 caracteres. Anuncie a TENSAO ou a LICAO. Nao copie a primeira frase do corpo. Mencione cooperativa/coop/associado quando der.

Pre-resumo atual: ${draft.dek}
Titulo: ${draft.title}
Primeiras palavras do corpo: ${(draft.body_markdown ?? "").slice(0, 800)}

Retorne JSON: {"dek": "..."}.`
    }
  ]);
  return response;
}

async function draftCmad(apiKey: string, draft: Record<string, string>) {
  const response = await callOpenAI(apiKey, [
    { role: "system", content: SYSTEM_VOICE },
    {
      role: "user",
      content: `Preencha a matriz C-MAD para a materia abaixo. Cada campo deve ser UMA sentenca com sujeito + verbo + consequencia. Os campos coop_business e marketing OBRIGATORIO mencionar cooperativa/coop/cooperado/associado.

Titulo: ${draft.title}
Lead: ${draft.dek}
Corpo:
${(draft.body_markdown ?? "").slice(0, 4500)}

Retorne JSON: {"cmad": {"coop_business": "...", "marketing": "...", "art_craft": "...", "design_ux": "..."}}.`
    }
  ]);
  return response;
}

async function composeCoverBrief(apiKey: string, draft: Record<string, string>) {
  const response = await callOpenAI(apiKey, [
    { role: "system", content: SYSTEM_VOICE },
    {
      role: "user",
      content: `Componha um BRIEF de art direction para gerar a capa editorial via gpt-image-1. Restricoes obrigatorias: SEM TEXTO/LOGOS, paleta off-white #FAFAF7 ou ink #0A0A0A com lime #C7F542 e coral #FF5A36 como accent, 16:9, estilo The Atlantic / Bloomberg Businessweek / B9. Sujeito derivado da materia. Composicao: centralizada, magazine-cover.

Titulo: ${draft.title}
Lead: ${draft.dek}
Categoria: ${draft.category}
Trecho: ${(draft.body_markdown ?? "").slice(0, 1200)}

Retorne JSON: {"brief": "...", "image_url": null}. (image_url fica nulo nesta versao; geracao real fica para a Fase 5.)`
    }
  ]);
  return response;
}

async function callOpenAI(apiKey: string, messages: { role: string; content: string }[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages
    })
  });
  if (!response.ok) throw new Error(`openai_${response.status}`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}
