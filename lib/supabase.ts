import { createClient } from "@supabase/supabase-js";
import type { Content } from "@/lib/types";

const FALLBACK_SUPABASE_URL = "https://vgjbkoxjphgpovtxdvlu.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnamJrb3hqcGhncG92dHhkdmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMyMzksImV4cCI6MjA5MzIzOTIzOX0.I_jSIPwUnCenvgi-RQWTfstNany_mwFDcwXn7V18Rl4";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export function hasSupabaseBrowserConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
}

export async function getRankedContents(): Promise<Content[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return demoContents;

  const { data, error } = await supabase.rpc("ranked_contents");
  if (error) {
    console.error(error);
    return demoContents;
  }

  return data as Content[];
}

export async function getPublishedContentsFromSupabase(): Promise<Content[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("ranked_contents");
  if (error) {
    console.error(error);
    return [];
  }

  return data as Content[];
}

export async function getContentBySlug(slug: string): Promise<Content | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return demoContents.find((content) => content.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as Content;
}

const demoContents: Content[] = [
  createDemoContent({
    id: "00000000-0000-4000-8000-000000000001",
    title: "Cooperativa transforma campanha local em plataforma de relacionamento",
    slug: "cooperativa-campanha-local-plataforma-relacionamento",
    category: "Publicidade Cooperativa",
    geo_location: "BR-SP",
    image_url: "/assets/campaign-platform.svg",
    tab_cash: 84,
    relevance_score: 0.91,
    body_markdown:
      "Uma cooperativa regional reposicionou sua campanha de varejo como uma plataforma de relacionamento com cooperados.\n\nA estrategia combinou conteudo educativo, presenca local e pecas digitais para mostrar valor concreto no dia a dia.\n\nO impacto principal foi a criacao de uma narrativa mensuravel: cada acao precisava explicar beneficio, canal e aprendizado para proximas ondas.",
    story_json: [
      { kicker: "Insight", title: "Valor antes de alcance", body: "A campanha colocou utilidade para o cooperado antes da pressa por visibilidade." },
      { kicker: "Estrategia", title: "Presenca local como midia", body: "Agencias, redes sociais e comunidade operaram como um unico funil de relacionamento." },
      { kicker: "Agencia", title: "Criacao com prova", body: "As pecas destacaram situacoes reais em vez de promessas abstratas." },
      { kicker: "Impacto", title: "CoopCash narrativo", body: "Cada interacao virou sinal de relevancia para decidir o que merecia nova rodada." },
      { kicker: "Analise", title: "O caso aponta um caminho", body: "Campanhas cooperativas vencem quando transformam pauta institucional em decisao pratica." }
    ]
  }),
  createDemoContent({
    id: "00000000-0000-4000-8000-000000000002",
    title: "Sicredi testa narrativa de educacao financeira com linguagem de comunidade",
    slug: "sicredi-testa-narrativa-educacao-financeira-comunidade",
    category: "Estrategia",
    geo_location: "BR-RS",
    image_url: "/assets/finance-community.svg",
    tab_cash: 61,
    relevance_score: 0.86,
    body_markdown:
      "A campanha simula uma virada importante: sair do conteudo bancario generico e aproximar a educacao financeira de rituais locais.\n\nO formato mistura video curto, materiais para agencias e pequenas historias de cooperados. O ganho de marca aparece quando a conversa financeira deixa de parecer aula e passa a parecer orientacao pratica.\n\nPara o NewsCoop, o caso e forte porque mostra como cooperativas podem ocupar o tema de dinheiro com mais confianca do que bancos tradicionais.",
    story_json: [
      { kicker: "Insight", title: "Educacao precisa de contexto", body: "O tema financeiro ganha tracao quando aparece dentro de situacoes reais." },
      { kicker: "Estrategia", title: "Comunidade como canal", body: "A campanha usa agencias e redes locais como pontos de conversa recorrente." },
      { kicker: "Criacao", title: "Menos palestra, mais vida", body: "A linguagem troca termos tecnicos por cenas de decisao cotidiana." },
      { kicker: "Impacto", title: "Confiança mensuravel", body: "O resultado esperado e aumentar recorrencia, nao apenas alcance." },
      { kicker: "Leitura", title: "Boa pauta para cooperativas", body: "Educacao financeira vira ativo quando ajuda alguem a agir melhor hoje." }
    ]
  }),
  createDemoContent({
    id: "00000000-0000-4000-8000-000000000003",
    title: "Agencia independente cria campanha de safra com dados de cooperados",
    slug: "agencia-independente-campanha-safra-dados-cooperados",
    category: "Agencias",
    geo_location: "BR-PR",
    image_url: "/assets/agro-data.svg",
    tab_cash: 37,
    relevance_score: 0.8,
    body_markdown:
      "Uma agencia independente desenhou uma campanha de safra baseada em dados anonimizados de cooperados, combinando previsao de demanda, conteudo de servico e criativos por regiao.\n\nA novidade nao esta apenas na segmentacao. O ponto interessante e a forma como a estrategia devolve valor para o cooperado: melhores informacoes, ofertas mais relevantes e comunicacao menos invasiva.\n\nEsse tipo de campanha aponta para um futuro em que CRM cooperativo deixa de ser disparo e vira inteligencia editorial.",
    story_json: [
      { kicker: "Insight", title: "Dado precisa virar servico", body: "A campanha usa informacao para orientar, nao apenas segmentar." },
      { kicker: "Estrategia", title: "Safra por territorio", body: "Criativos mudam conforme as necessidades de cada regiao." },
      { kicker: "Agencia", title: "Planejamento mais perto do campo", body: "A criacao parte de padroes reais de cooperados." },
      { kicker: "Impacto", title: "CRM com reputacao", body: "A comunicacao fica mais util e menos interruptiva." },
      { kicker: "Analise", title: "Um salto de maturidade", body: "A vantagem aparece quando dados melhoram a vida de quem recebe." }
    ]
  }),
  createDemoContent({
    id: "00000000-0000-4000-8000-000000000004",
    title: "Campanha de cooperativismo jovem aposta em creator local e eventos pequenos",
    slug: "campanha-cooperativismo-jovem-creator-local-eventos-pequenos",
    category: "Creators",
    geo_location: "BR-MG",
    image_url: "/assets/young-coop.svg",
    tab_cash: 29,
    relevance_score: 0.74,
    body_markdown:
      "A iniciativa aposta em creators locais, rodas pequenas e conteudo seriado para explicar cooperativismo sem cara institucional.\n\nO acerto esta em entender que publico jovem raramente entra por manifesto. Ele entra por pertencimento, oportunidade e prova social.\n\nA campanha ainda precisa de indicadores mais claros, mas tem um territorio criativo promissor: transformar cooperativa em rede de possibilidades proximas.",
    story_json: [
      { kicker: "Insight", title: "Pertencimento antes de manifesto", body: "O jovem se aproxima quando ve oportunidade concreta no seu circulo." },
      { kicker: "Estrategia", title: "Creator como ponte", body: "Vozes locais reduzem distancia entre marca e comunidade." },
      { kicker: "Formato", title: "Eventos pequenos funcionam", body: "Rodas menores criam conversa, repertorio e sinal para novos conteudos." },
      { kicker: "Risco", title: "Metrica ainda importa", body: "Sem indicadores, a campanha pode virar apenas presenca simpatica." },
      { kicker: "Potencial", title: "Rede de possibilidades", body: "A narrativa fica forte quando mostra caminhos reais de participacao." }
    ]
  })
];

function createDemoContent(input: Omit<Content, "created_at" | "published_at" | "source_url" | "status" | "decision_log">): Content {
  return {
    ...input,
    created_at: "2026-05-01T12:00:00.000Z",
    published_at: "2026-05-01T12:00:00.000Z",
    source_url: "https://example.com/newscoop-demo",
    status: "published",
    decision_log: {
      verdict: "publish",
      reasons: ["Demo local para visualizar o portal antes da conexao com Supabase"]
    }
  };
}
