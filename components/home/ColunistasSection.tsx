const colunistas = [
  {
    name: "Renata Aprigio",
    tag: "CRIATIVIDADE · QUINTAS",
    text: "Por que toda boa campanha coop começa com uma pergunta que ninguém quer responder.",
    color: "#C7F542"
  },
  {
    name: "Bruno Salm",
    tag: "MARTECH · TERÇAS",
    text: "A obsessão por dado limpo virou desculpa pra não fazer marketing.",
    color: "#FF5A36"
  },
  {
    name: "Lia Fontoura",
    tag: "IA · SEXTAS",
    text: "Treinar IA com tom cooperativista é mais fácil do que parece. Difícil é manter.",
    color: "#1A1A1A"
  },
  {
    name: "Caio Werneck",
    tag: "COMUNICAÇÃO · QUARTAS",
    text: "Existe uma diferença entre fazer o bem e comunicar o bem. Coop confunde direto.",
    color: "#9AD13E"
  }
];

export function ColunistasSection() {
  return (
    <section className="colunistas" id="colunistas">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-sub">VOZES · OPINIÃO</span>
            <h2 className="section-title" style={{ marginTop: 8 }}>
              Os <em className="em-italic">colunistas</em>
            </h2>
          </div>
          <a href="/todos" className="link-arrow">TODOS →</a>
        </div>
        <div className="colunistas-strip">
          {colunistas.map((colunista) => (
            <article className="colunista" key={colunista.name}>
              <div className="colunista-head">
                <div className="colunista-avatar" style={{ background: colunista.color }} />
                <div>
                  <div className="colunista-name">{colunista.name}</div>
                  <div className="colunista-tag">{colunista.tag}</div>
                </div>
              </div>
              <p className="colunista-text">"{colunista.text}"</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
