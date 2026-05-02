import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server";
import { NewsletterDispatcher } from "@/app/admin/newsletter/NewsletterDispatcher";

export const dynamic = "force-dynamic";

type RecentArticle = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  published_at: string | null;
  image_url: string | null;
};

type LeadAggregate = {
  vertical: string;
  count: number;
};

const VERTICALS = ["credito", "agro", "saude", "consumo", "outro"] as const;

export default async function NewsletterAdminPage() {
  const supabase = await getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?redirectTo=/admin/newsletter");

  const { data: editor } = await supabase
    .from("editors")
    .select("role, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = editor?.role ?? "editor";
  if (role !== "chief_editor" && role !== "admin") {
    return (
      <main className="admin-dashboard">
        <header className="admin-dashboard-head">
          <div>
            <span className="section-sub">Newsletter</span>
            <h1>Acesso restrito</h1>
            <p className="admin-dashboard-sub">
              Apenas chief_editor ou admin pode disparar a newsletter.
            </p>
          </div>
        </header>
      </main>
    );
  }

  // Últimos 30 dias publicados — dão a base de seleção do digest semanal.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: contents } = await supabase
    .from("contents")
    .select("id, slug, title, category, published_at, image_url")
    .eq("status", "published")
    .gte("published_at", thirtyDaysAgo)
    .order("published_at", { ascending: false })
    .limit(30);

  // Agrega leads ativos por vertical pra UI mostrar tamanho da audiência.
  const { data: leads } = await supabase
    .from("leads")
    .select("vertical")
    .eq("subscribed_newsletter", true);

  const leadAggregates: LeadAggregate[] = aggregateByVertical(leads ?? []);
  const totalActiveLeads = (leads ?? []).length;

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-head">
        <div>
          <span className="section-sub">Newsletter · Disparo manual</span>
          <h1>Newsletter Briefing.Co</h1>
          <p className="admin-dashboard-sub">
            Selecione as matérias da semana, escolha a vertical, valide com Dry Run e dispare.
            O n8n assume essa rotina nas próximas semanas.
          </p>
        </div>
      </header>

      <section className="admin-section">
        <header className="admin-section-head">
          <h2>Audiência ativa</h2>
          <span>opt-in válido</span>
          <span className="admin-section-count">{totalActiveLeads}</span>
        </header>
        <div className="newsletter-aggregates">
          {VERTICALS.map((vertical) => {
            const found = leadAggregates.find((l) => l.vertical === vertical);
            return (
              <div key={vertical} className="newsletter-aggregate">
                <span className="newsletter-aggregate-label">{vertical.toUpperCase()}</span>
                <strong className="newsletter-aggregate-count">{found?.count ?? 0}</strong>
              </div>
            );
          })}
        </div>
      </section>

      <NewsletterDispatcher
        articles={(contents ?? []) as RecentArticle[]}
        verticalsWithCount={[
          { value: "all", label: "Todas as verticais", count: totalActiveLeads },
          ...VERTICALS.map((v) => ({
            value: v,
            label: capitalize(v),
            count: leadAggregates.find((l) => l.vertical === v)?.count ?? 0
          }))
        ]}
      />
    </main>
  );
}

function aggregateByVertical(rows: { vertical: string }[]): LeadAggregate[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.vertical, (map.get(row.vertical) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([vertical, count]) => ({ vertical, count }));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
