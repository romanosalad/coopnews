import Link from "next/link";
import { getArticlesBySection } from "@/lib/coop-news-data";
import { Placeholder } from "@/components/ui/Placeholder";

const metas = [
  "2.4K LEITORES · 312 COMENTÁRIOS · 2H",
  "1.9K LEITORES · 198 COMENTÁRIOS · 5H",
  "1.6K LEITORES · 144 COMENTÁRIOS · 8H",
  "1.3K LEITORES · 87 COMENTÁRIOS · 12H",
  "1.1K LEITORES · 211 COMENTÁRIOS · 1D",
  "870 LEITORES · 56 COMENTÁRIOS · 1D",
  "720 LEITORES · 42 COMENTÁRIOS · 2D"
];

export function PopularSection() {
  const items = getArticlesBySection("popular");

  return (
    <section className="popular">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-sub">FÓRUM · DEBATIDO ESTA SEMANA</span>
            <h2 className="section-title" style={{ marginTop: 8 }}>
              Mais <em className="em-italic" style={{ color: "var(--accent)" }}>populares</em>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button className="period-button">SEMANA</button>
            <button className="period-button active">MÊS</button>
            <button className="period-button">ANO</button>
          </div>
        </div>
        <div className="popular-list">
          {items.map((article, index) => (
            <Link href={`/materias/${article.slug}`} className="popular-item" key={article.slug}>
              <div className="popular-rank">{String(index + 1).padStart(2, "0")}<span className="dot">.</span></div>
              <div className="popular-thumb"><Placeholder idx={article.placeholder} /></div>
              <h3 className="popular-title" dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
              <div className="popular-meta">{metas[index]}</div>
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <a href="#" className="solid-cta">VER FÓRUM COMPLETO →</a>
        </div>
      </div>
    </section>
  );
}
