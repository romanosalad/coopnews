import { Suspense } from "react";
import { BrandCornerMotif } from "@/components/brand/BrandCornerMotif";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/app/admin/login/LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="login-page">
      <BrandCornerMotif />
      <div style={{ position: "absolute", top: 18, left: 32, zIndex: 60 }}>
        <CoopWordmark height={26} dark />
      </div>
      <TopBar />

      <section className="login-section">
        <div className="login-card">
          <span className="section-sub">REDAÇÃO COOPNEWS</span>
          <h1>Login</h1>
          <p className="login-tag">
            Acesso restrito a colunistas e editores cadastrados.
          </p>
          <Suspense fallback={<div className="login-form-fallback">Carregando…</div>}>
            <LoginForm />
          </Suspense>
          <p className="login-help">
            Quer fazer parte da redação? Escreva para
            <a href="mailto:central@baiaku.com.br"> central@baiaku.com.br</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
