const navItems = [
  { label: "Manchetes", href: "/", active: true },
  { label: "CoopTech", href: "#cooptech" },
  { label: "Lá Fora", href: "#la-fora" },
  { label: "Fórum", href: "#mais-populares" },
  { label: "Colunistas", href: "#colunistas" }
];

export function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <nav className="topnav" aria-label="Editorias">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className={item.active ? "is-active" : ""}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="topbar-actions">
          <button className="iconbtn" aria-label="Buscar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <button className="btn-enter">ENTRAR</button>
          <button className="btn-subscribe">ASSINAR</button>
        </div>
      </div>
    </div>
  );
}
