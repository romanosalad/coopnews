"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandCornerMotif } from "@/components/brand/BrandCornerMotif";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { TopBar } from "@/components/layout/TopBar";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";

  // Temporary dev pre-fill while magic-link redirect URL isn't configured.
  // Swap back to magic link / strong password before production.
  const [email, setEmail] = useState("romano@baiaku.com.br");
  const [password, setPassword] = useState("1234");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

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
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Entrando..." : "Entrar"}
            </button>
            {status === "error" ? <span className="login-error">{errorMessage}</span> : null}
          </form>
          <p className="login-help">
            Quer fazer parte da redação? Escreva para
            <a href="mailto:central@baiaku.com.br"> central@baiaku.com.br</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
