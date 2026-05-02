export function CtaBand() {
  return (
    <section className="cta-band">
      <div className="shell">
        <div className="cta-inner">
          <h2 className="cta-headline">
            A <em>newsletter</em> que cooperativas leem antes do café.
          </h2>
          <form className="cta-form">
            <label htmlFor="newsletter-email" className="sr-only">Email para receber a newsletter</label>
            <input id="newsletter-email" type="email" placeholder="seu@email.com" />
            <button type="submit">ASSINAR</button>
          </form>
        </div>
      </div>
    </section>
  );
}

