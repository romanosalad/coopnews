import Link from "next/link";
import { notFound } from "next/navigation";
import { VoteButton } from "@/app/VoteButton";
import { markdownToHtml } from "@/lib/markdown";
import { getContentBySlug } from "@/lib/supabase";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  if (!content) notFound();

  const decisionReasons = Array.isArray(content.decision_log.reasons) ? content.decision_log.reasons : [];

  return (
    <main className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-2xl font-black">
            NewsCoop
          </Link>
          <VoteButton contentId={content.id} initialTabCash={content.tab_cash} />
        </div>
      </header>

      <article>
        <section className="border-b border-ink/10">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
              {content.image_url ? (
                <img src={content.image_url} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="aspect-[4/3] bg-ink" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-sm font-black uppercase tracking-normal text-coop">{content.category}</p>
              <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">{content.title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-ink/60">
                <span>{content.geo_location ?? "BR"}</span>
                <span>{new Date(content.published_at ?? content.created_at).toLocaleDateString("pt-BR")}</span>
                <span>{Math.round(content.relevance_score * 100)}% relevancia IA</span>
                {content.source_url ? (
                  <a href={content.source_url} target="_blank" rel="noreferrer" className="text-coop">
                    Fonte original
                  </a>
                ) : null}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/stories/${content.slug}`} className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white">
                  Ver em Story
                </Link>
                <Link href="/" className="rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-black text-ink">
                  Voltar ao feed
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_320px]">
          <div
            className="prose prose-lg max-w-none prose-p:text-[19px] prose-p:leading-9"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content.body_markdown) }}
          />

          <aside className="space-y-4">
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-normal text-coop">Log de decisao</p>
              <h2 className="mt-2 text-xl font-black">Por que entrou no feed</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-ink/70">
                {decisionReasons.length > 0 ? (
                  decisionReasons.map((reason, index) => <p key={`${reason}-${index}`}>{String(reason)}</p>)
                ) : (
                  <p>Conteudo aprovado pela curadoria automatica.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-ink/10 bg-ink p-5 text-white shadow-sm">
              <p className="text-xs font-black uppercase tracking-normal text-white/60">Story pronto</p>
              <h2 className="mt-2 text-xl font-black">5 slides gerados para distribuicao mobile.</h2>
              <Link href={`/stories/${content.slug}`} className="mt-5 inline-block rounded-full bg-white px-4 py-3 text-sm font-black text-ink">
                Abrir Web Story
              </Link>
            </div>
          </aside>
        </section>
      </article>
    </main>
  );
}
