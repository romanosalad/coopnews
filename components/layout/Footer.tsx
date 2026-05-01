import { CoopWordmark } from "@/components/brand/Wordmark";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <CoopWordmark height={32} dark />
            <p className="footer-tagline">
              O jornal de marketing, criatividade e tecnologia do mundo cooperativista brasileiro.
            </p>
          </div>
          <FooterList title="EDITORIAS" items={["Criatividade", "Martech", "IA & Conversão", "Comunicação do Bem", "Lá Fora"]} />
          <FooterList title="COMUNIDADE" items={["Fórum", "Colunistas", "Eventos", "Newsletter"]} />
          <FooterList title="SOBRE" items={["Quem faz", "Anuncie", "Imprensa", "Contato"]} />
        </div>
        <div className="footer-bottom">
          <span>© 2026 COOP NEWS · UM PROJETO BAIAKU</span>
          <span>FEITO COM CAFÉ EM PORTO ALEGRE / SP</span>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <a href="#">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
