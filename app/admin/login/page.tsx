"use client";

import { useState } from "react";
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
    <main className="admin-login">
      <div className="admin-login-card">
        <span className="section-sub">COOPNEWS · REDAÇÃO</span>
        <h1>Entrar</h1>
        <p>
          Digite seu email cadastrado. Enviamos um link de acesso. Sem senha.
        </p>
        {status === "sent" ? (
          <div className="admin-login-success">
            <strong>Link enviado.</strong>
            <p>Cheque seu email — o link de acesso expira em 1 hora.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-login-form">
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
            {status === "error" ? <span className="admin-login-error">{errorMessage}</span> : null}
          </form>
        )}
      </div>
    </main>
  );
}
