// ArticleTldr — bloco "Em Resumo" no estilo Axios Smart Brevity.
// fa.md V3.1: obrigatório em TODOS os cadernos (Radar / Protocolo / Dossiê).
// Renderiza somente quando `tldr` tem conteúdo. n8n Crews preenchem o campo
// na publicação; legados vazios não exibem o bloco.

type ArticleTldrProps = {
  tldr?: string | null;
};

export function ArticleTldr({ tldr }: ArticleTldrProps) {
  const text = (tldr ?? "").trim();
  if (!text) return null;

  const bullets = parseBullets(text);

  return (
    <aside className="article-tldr" role="complementary" aria-label="Em Resumo">
      <span className="article-tldr-label">EM RESUMO</span>
      {bullets.length > 0 ? (
        <ul className="article-tldr-list">
          {bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      ) : (
        <p className="article-tldr-paragraph">{text}</p>
      )}
    </aside>
  );
}

// Detecta marcadores comuns ("- ", "* ", "• ", "— ") OR linhas separadas por \n.
// Sem marcador e sem quebra → trata como parágrafo único.
function parseBullets(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const stripped = lines.map((line) => line.replace(/^[-*•—]\s+/, "").trim()).filter(Boolean);
  return stripped.length >= 2 ? stripped : [];
}
