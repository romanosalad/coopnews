import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text
} from "@react-email/components";

export type WelcomeDecisorProps = {
  email: string;
  source_slug?: string | null;
  source_caderno?: string | null;
  site_url: string;
  unsubscribe_url: string;
  complete_profile_url: string;
};

export default function WelcomeDecisor({
  email = "decisor@cooperativa.coop.br",
  source_slug = null,
  source_caderno = "Protocolo",
  site_url = "https://coopnews-9gbm.vercel.app",
  unsubscribe_url = "https://coopnews-9gbm.vercel.app/api/newsletter/unsubscribe",
  complete_profile_url = "https://coopnews-9gbm.vercel.app/admin/login"
}: WelcomeDecisorProps) {
  const sourceArticleUrl = source_slug ? `${site_url}/materias/${source_slug}` : site_url;

  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Briefing.Co — seu acesso ao Protocolo está liberado.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brandTag}>BRIEFING.CO · ACESSO LIBERADO</Text>
            <Heading as="h1" style={styles.headline}>
              Pronto. Seu Protocolo já está aberto.
            </Heading>
            <Text style={styles.subheadline}>
              {email} agora tem acesso direto ao caderno {source_caderno ?? "Protocolo"}
              {" "}e recebe nosso briefing semanal toda terça e quinta às 7h.
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.cardSection}>
            <Heading as="h2" style={styles.cardTitle}>
              O que vem por aí
            </Heading>
            <Text style={styles.cardText}>
              <strong>Toda terça e quinta às 7h</strong>, você recebe o digest da semana com
              o que está acontecendo em marketing cooperativista, IA aplicada ao setor e
              casos de marca que valem leitura.
            </Text>
            <Text style={styles.cardText}>
              Sem boletim. Sem release. Apenas Hard News, Hacks Estratégicos e Análises
              com Vantagem Injusta.
            </Text>
          </Section>

          <Section style={styles.cardSection}>
            <Heading as="h2" style={styles.cardTitle}>
              Conta de leitor (opcional)
            </Heading>
            <Text style={styles.cardText}>
              Quando quiser, complete seu perfil pra que a gente personalize o briefing
              pela sua vertical (Crédito · Agro · Saúde · Consumo) e desbloqueie o
              dashboard de leitor.
            </Text>
            <Link href={complete_profile_url} style={styles.cta}>
              Criar conta de leitor →
            </Link>
          </Section>

          {source_slug ? (
            <Section style={styles.cardSection}>
              <Heading as="h2" style={styles.cardTitle}>
                Continue de onde parou
              </Heading>
              <Link href={sourceArticleUrl} style={styles.cta}>
                Voltar para a matéria →
              </Link>
            </Section>
          ) : null}

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Você está recebendo este email porque liberou o acesso ao Protocolo no
              Briefing.Co. Não vendemos nem compartilhamos seu email.
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
    maxWidth: "560px"
  },
  header: { paddingBottom: "8px" },
  brandTag: {
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#5C5C58",
    margin: "0 0 16px"
  },
  headline: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "30px",
    lineHeight: "1.12",
    fontWeight: 700,
    color: "#0A0A0A",
    margin: "0 0 14px",
    letterSpacing: "-0.005em"
  },
  subheadline: {
    fontFamily: "Inter, -apple-system, sans-serif",
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#3A3A38",
    margin: 0
  },
  hr: { border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", margin: "28px 0" },
  cardSection: { paddingBottom: "20px" },
  cardTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "20px",
    lineHeight: "1.2",
    fontWeight: 700,
    color: "#0A0A0A",
    margin: "0 0 10px"
  },
  cardText: {
    fontFamily: "Inter, -apple-system, sans-serif",
    fontSize: "15px",
    lineHeight: "1.55",
    color: "#3A3A38",
    margin: "0 0 12px"
  },
  cta: {
    display: "inline-block",
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#0A0A0A",
    borderBottom: "2px solid #C7F542",
    paddingBottom: "2px",
    textDecoration: "none",
    marginTop: "4px"
  },
  footer: { paddingTop: "8px" },
  footerText: {
    fontFamily: "Inter, -apple-system, sans-serif",
    fontSize: "12px",
    lineHeight: "1.55",
    color: "#5C5C58",
    margin: "0 0 10px"
  },
  footerLink: { color: "#0A0A0A", textDecoration: "underline" }
};
