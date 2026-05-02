"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";

  // Temporary dev pre-fill while magic-link redirect URL isn't configured.
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
  );
}
