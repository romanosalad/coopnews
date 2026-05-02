"use client";

import { useState } from "react";
import { BrandCornerMotif } from "@/components/brand/BrandCornerMotif";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { TopBar } from "@/components/layout/TopBar";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) return;

    setStatus("sending");
    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
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
            Digite seu email cadastrado. Enviamos um link de acesso. Sem senha.
          </p>
          {status === "sent" ? (
            <div className="login-success">
              <strong>Link enviado para {email}.</strong>
              <p>Cheque sua caixa de entrada — o link de acesso expira em 1 hora.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@cooperativa.coop.br"
                autoComplete="email"
              />
              <button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Enviando..." : "Receber link de acesso"}
              </button>
              {status === "error" ? <span className="login-error">{errorMessage}</span> : null}
            </form>
          )}
          <p className="login-help">
            Acesso restrito a colunistas e editores cadastrados. Quer fazer parte? Escreva para
            <a href="mailto:central@baiaku.com.br"> central@baiaku.com.br</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
