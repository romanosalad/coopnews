import Link from "next/link";
import { redirect } from "next/navigation";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // /admin/login is public; everything else needs an editor record.
  // Middleware already guards the URL, so by the time we reach a non-login
  // page in this layout we expect a session.
  let editorRow: { display_name: string | null; role: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("editors")
      .select("display_name, role")
      .eq("user_id", user.id)
      .maybeSingle();
    editorRow = data;

    // No editors row means the user signed in but isn't authorized. Sign out
    // and bounce back to login so we don't render the dashboard for randoms.
    if (!editorRow) {
      await supabase.auth.signOut();
      redirect("/admin/login?redirectTo=/admin&error=not_authorized");
    }
  }

  // When unauthenticated (only /admin/login can render here), let the page
  // own its layout so it can use the public TopBar instead of the dark admin
  // header. Avoids stacking two headers on the login screen.
  if (!user) {
    return <>{children}</>;
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
