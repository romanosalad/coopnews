import { CoopWordmark } from "@/components/brand/Wordmark";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <CoopWordmark height={32} dark />
            <p className="footer-tagline">{BRAND.tagline}</p>
          </div>
          <FooterList title="CADERNOS" items={["Radar", "Protocolo", "Dossiê", "CoopTech", "Lá Fora"]} />
          <FooterList title="COMUNIDADE" items={["Fórum", "Colunistas", "Eventos", "Newsletter"]} />
          <FooterList title="SOBRE" items={["Quem faz", "Anuncie", "Imprensa", "Contato"]} />
        </div>
        <div className="footer-bottom">
          <span>
            © {BRAND.copyright_year} {BRAND.name.toUpperCase()} · {BRAND.founder_byline.toUpperCase()}
          </span>
          <span>FEITO COM CAFÉ EM {BRAND.city_byline.toUpperCase()}</span>
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
