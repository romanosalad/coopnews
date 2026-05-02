import Link from "next/link";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // No session: let the page render its own header (only /admin/login is
  // reachable in this state thanks to middleware).
  if (!user) {
    return <>{children}</>;
  }

  let editorRow: { display_name: string | null; role: string } | null = null;
  const { data } = await supabase
    .from("editors")
    .select("display_name, role")
    .eq("user_id", user.id)
    .maybeSingle();
  editorRow = data;

  // Logged in but no editors row. Render a contained error screen with a
  // Sair button instead of looping with auto sign-out + redirect.
  if (!editorRow) {
    return (
      <div className="admin-shell">
        <header className="admin-topbar">
          <Link href="/admin" className="admin-brand">
            <CoopWordmark height={20} dark />
            <span className="admin-brand-tag">REDAÇÃO</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="admin-nav-signout">Sair</button>
          </form>
        </header>
        <div className="admin-main">
          <div className="admin-unauthorized">
            <span className="section-sub">Acesso restrito</span>
            <h1>Sua conta não tem perfil de editor</h1>
            <p>
              Você logou com <strong>{user.email}</strong>, mas esse email ainda não está
              cadastrado como editor. Peça acesso ao chief_editor da redação ou clique em
              Sair para tentar com outra conta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link href="/admin" className="admin-brand">
          <CoopWordmark height={20} dark />
          <span className="admin-brand-tag">REDAÇÃO</span>
        </Link>
        <nav className="admin-nav">
          <Link href="/admin">Dashboard</Link>
          {(editorRow?.role === "chief_editor" || editorRow?.role === "admin") ? (
            <Link href="/admin/newsletter">Newsletter</Link>
          ) : null}
          <Link href="/admin/articles/new" className="admin-nav-cta">+ Nova matéria</Link>
          <span className="admin-nav-user">
            {editorRow?.display_name ?? user.email} · <em>{editorRow?.role}</em>
          </span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="admin-nav-signout">Sair</button>
          </form>
        </nav>
      </header>
      <div className="admin-main">{children}</div>
    </div>
  );
}
