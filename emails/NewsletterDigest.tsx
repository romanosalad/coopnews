import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text
} from "@react-email/components";

export type NewsletterArticle = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  caderno: "RADAR" | "PROTOCOLO" | "DOSSIÊ";
  category: string;
  read_time?: string | null;
  image_url?: string | null;
};

export type NewsletterDigestProps = {
  recipientName: string;
  vertical: string;
  edition_label: string;
  articles: NewsletterArticle[];
  unsubscribe_url: string;
  site_url: string;
};

const CADERNO_COLORS: Record<NewsletterArticle["caderno"], { bg: string; fg: string }> = {
  RADAR: { bg: "#1E3A8A", fg: "#FAFAF7" },
  PROTOCOLO: { bg: "#B45309", fg: "#FAFAF7" },
  DOSSIÊ: { bg: "#3730A3", fg: "#FAFAF7" }
};

export default function NewsletterDigest({
  recipientName = "decisor",
  vertical = "credito",
  edition_label = "Edição da semana",
  articles = [],
  unsubscribe_url = "https://coopnews-9gbm.vercel.app/api/newsletter/unsubscribe",
  site_url = "https://coopnews-9gbm.vercel.app"
}: NewsletterDigestProps) {
  const previewText =
    articles[0]?.title ?? "Briefing semanal de marketing cooperativista — Briefing.Co";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brandTag}>BRIEFING.CO · {edition_label.toUpperCase()}</Text>
            <Heading as="h1" style={styles.headline}>
              Olá, {recipientName}.
            </Heading>
            <Text style={styles.subheadline}>
              O essencial da semana em marketing, IA e estratégia para a vertical de {vertical}.
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {articles.map((article) => {
            const palette = CADERNO_COLORS[article.caderno] ?? CADERNO_COLORS.RADAR;
            const articleUrl = `${site_url}/materias/${article.slug}?utm_source=newsletter&utm_medium=email&utm_campaign=briefing-co`;
            return (
              <Section key={article.id} style={styles.articleSection}>
                {article.image_url ? (
                  <Img
                    src={article.image_url}
                    alt={article.title}
                    width="540"
                    style={styles.articleImage}
                  />
                ) : null}
                <Text style={{ ...styles.cadernoBadge, backgroundColor: palette.bg, color: palette.fg }}>
                  {article.caderno} · {article.read_time?.toUpperCase() ?? ""}
                </Text>
                <Link href={articleUrl} style={styles.articleTitleLink}>
                  <Heading as="h2" style={styles.articleTitle}>
                    {article.title}
                  </Heading>
                </Link>
                <Text style={styles.articleDek}>{article.dek}</Text>
                <Link href={articleUrl} style={styles.articleCta}>
                  Ler matéria completa →
                </Link>
              </Section>
            );
          })}

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Você está recebendo o Briefing.Co porque se cadastrou como Decisor.
              Sem boletim. Sem spam. Apenas Hard News, Hacks e Análises com Vantagem Injusta.
            </Text>
            <Text style={styles.footerText}>
              <Link href={unsubscribe_url} style={styles.footerLink}>
                Cancelar inscrição
              </Link>
              {" · "}
              <Link href={site_url} style={styles.footerLink}>
                Briefing.Co
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#FAFAF7",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: 0,
    padding: 0
  },
  container: {
    margin: "0 auto",
    padding: "32px 24px 56px",
    maxWidth: "600px"
  },
  header: {
    paddingBottom: "12px"
  },
  brandTag: {
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    color: "#5C5C58",
    margin: "0 0 16px"
  },
  headline: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "32px",
    lineHeight: "1.1",
    fontWeight: 700,
    color: "#0A0A0A",
    margin: "0 0 12px"
  },
  subheadline: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic" as const,
    fontSize: "17px",
    lineHeight: "1.45",
    color: "#5C5C58",
    margin: 0
  },
  hr: {
    border: "none",
    borderTop: "1px solid rgba(0,0,0,0.08)",
    margin: "32px 0"
  },
  articleSection: {
    paddingBottom: "32px"
  },
  articleImage: {
    width: "100%",
    height: "auto",
    display: "block",
    marginBottom: "16px",
    border: "1px solid rgba(0,0,0,0.06)"
  },
  cadernoBadge: {
    display: "inline-block",
    padding: "5px 10px",
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.18em",
    margin: "0 0 14px"
  },
  articleTitleLink: {
    color: "#0A0A0A",
    textDecoration: "none"
  },
  articleTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "24px",
    lineHeight: "1.18",
    fontWeight: 700,
    color: "#0A0A0A",
    margin: "0 0 10px"
  },
  articleDek: {
    fontFamily: "Inter, -apple-system, sans-serif",
    fontSize: "15px",
    lineHeight: "1.55",
    color: "#3A3A38",
    margin: "0 0 12px"
  },
  articleCta: {
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "#0A0A0A",
    borderBottom: "2px solid #C7F542",
    paddingBottom: "2px",
    textDecoration: "none"
  },
  footer: {
    paddingTop: "8px"
  },
  footerText: {
    fontFamily: "Inter, -apple-system, sans-serif",
    fontSize: "12px",
    lineHeight: "1.55",
    color: "#5C5C58",
    margin: "0 0 10px"
  },
  footerLink: {
    color: "#0A0A0A",
    textDecoration: "underline"
  }
};
