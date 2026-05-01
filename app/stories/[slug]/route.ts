import { getContentBySlug } from "@/lib/supabase";

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Context) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  if (!content) {
    return new Response("Story not found", { status: 404 });
  }

  const cover = content.image_url ?? "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop";
  const slides = content.story_json.slice(0, 5);
  const articleUrl = `/contents/${content.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: content.title,
    image: [cover],
    datePublished: content.published_at ?? content.created_at,
    dateModified: content.published_at ?? content.created_at,
    mainEntityOfPage: articleUrl,
    publisher: {
      "@type": "Organization",
      name: "NewsCoop"
    }
  };

  return new Response(renderAmpStory({ title: content.title, cover, slides, articleUrl, geo: content.geo_location, jsonLd }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300"
    }
  });
}

function renderAmpStory({
  title,
  cover,
  slides,
  articleUrl,
  geo,
  jsonLd
}: {
  title: string;
  cover: string;
  slides: Array<{ kicker: string; title: string; body: string }>;
  articleUrl: string;
  geo: string | null;
  jsonLd: Record<string, unknown>;
}) {
  const safeTitle = escapeHtml(title);
  const pages = slides
    .map(
      (slide, index) => `
        <amp-story-page id="slide-${index + 1}">
          <amp-story-grid-layer template="fill">
            <amp-img src="${escapeAttribute(cover)}" width="720" height="1280" layout="responsive" object-fit="cover"></amp-img>
          </amp-story-grid-layer>
          <amp-story-grid-layer template="fill">
            <div class="story-backdrop"></div>
          </amp-story-grid-layer>
          <amp-story-grid-layer template="vertical" class="story-copy">
            <div class="story-panel">
              <p>${escapeHtml(slide.kicker)}</p>
              <h1>${escapeHtml(slide.title)}</h1>
              <h2>${escapeHtml(slide.body)}</h2>
            </div>
            ${
              index === slides.length - 1
                ? `<a class="story-cta" href="${escapeAttribute(articleUrl)}">Ler analise completa</a>`
                : ""
            }
          </amp-story-grid-layer>
        </amp-story-page>`
    )
    .join("");

  return `<!doctype html>
<html amp lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <title>${safeTitle} | NewsCoop Story</title>
    <link rel="canonical" href="${escapeAttribute(articleUrl)}">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <meta name="geo.region" content="${escapeAttribute(geo ?? "BR")}">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
    <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <style amp-custom>
      body { margin: 0; font-family: Inter, Arial, sans-serif; background: #111316; }
      amp-story { font-family: Inter, Arial, sans-serif; color: white; }
      .story-backdrop {
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, rgba(17,19,22,0.05) 0%, rgba(17,19,22,0.55) 42%, rgba(17,19,22,0.92) 100%);
        backdrop-filter: blur(18px);
      }
      .story-copy { align-content: end; padding: 32px; }
      .story-panel {
        border: 1px solid rgba(255,255,255,0.22);
        border-radius: 8px;
        background: rgba(17,19,22,0.54);
        padding: 24px;
      }
      .story-panel p {
        margin: 0 0 12px;
        color: #9ee0c3;
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
      }
      .story-panel h1 {
        margin: 0;
        font-size: 34px;
        line-height: 1.02;
        letter-spacing: 0;
      }
      .story-panel h2 {
        margin: 16px 0 0;
        font-size: 18px;
        font-weight: 500;
        line-height: 1.45;
      }
      .story-cta {
        display: inline-block;
        margin-top: 16px;
        border-radius: 999px;
        background: #ffffff;
        color: #111316;
        padding: 14px 18px;
        font-size: 14px;
        font-weight: 800;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <amp-story standalone title="${escapeAttribute(title)}" publisher="NewsCoop" publisher-logo-src="/publisher-logo.png" poster-portrait-src="${escapeAttribute(cover)}">
      ${pages}
    </amp-story>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
