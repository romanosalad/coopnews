import Link from "next/link";

export default function NewArticlePlaceholder() {
  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-head">
        <div>
          <span className="section-sub">Composer</span>
          <h1>Nova matéria</h1>
          <p className="admin-dashboard-sub">
            O composer humano com sidebar de IA está sendo construído na Fase 2.
          </p>
        </div>
        <Link href="/admin" className="admin-nav-cta">← Voltar ao dashboard</Link>
      </header>
      <section className="admin-section">
        <header className="admin-section-head"><h2>Em construção</h2></header>
        <p className="admin-section-empty">
          Fase 2 entrega: editor markdown com preview, campos de C-MAD, upload de capa, ações
          rápidas de IA (sugerir título, polir lead, gerar capa, checar voz, gerar C-MAD), e os
          botões salvar como rascunho / submeter para revisão.
        </p>
      </section>
    </main>
  );
}
