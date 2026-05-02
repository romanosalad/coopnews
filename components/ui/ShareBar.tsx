"use client";

import { useEffect, useRef, useState } from "react";

type ShareBarProps = {
  title: string;
  slug: string;
};

type Channel = "copy_link" | "whatsapp_share" | "linkedin_share";

export function ShareBar({ title, slug }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function buildShareUrl(channel: Channel): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://coopnews-9gbm.vercel.app";
    const url = new URL(`${origin}/materias/${slug}`);
    url.searchParams.set("utm_source", "share");
    url.searchParams.set("utm_medium", channel);
    url.searchParams.set("utm_campaign", "briefing-co");
    return url.toString();
  }

  async function handleCopy() {
    const url = buildShareUrl("copy_link");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback para contextos sem Clipboard API: textarea oculto +
        // execCommand. Sem prompt nativo, sem modal.
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Falha silenciosa — sem alert nativo. UX premium primeiro.
    }
  }

  function openWhatsApp() {
    const url = buildShareUrl("whatsapp_share");
    const text = `${title} — ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  function openLinkedIn() {
    const url = buildShareUrl("linkedin_share");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="share-bar" role="group" aria-label="Compartilhar matéria">
      <span className="share-bar-label">Compartilhar</span>
      <div className="share-bar-buttons">
        <button
          type="button"
          className={`share-bar-btn ${copied ? "is-copied" : ""}`}
          onClick={handleCopy}
          aria-live="polite"
        >
          <span className="share-bar-btn-icon" aria-hidden="true">
            {copied ? <CheckIcon /> : <LinkIcon />}
          </span>
          <span className="share-bar-btn-label">{copied ? "Copiado" : "Copiar link"}</span>
        </button>
        <button
          type="button"
          className="share-bar-btn share-bar-btn--whatsapp"
          onClick={openWhatsApp}
          aria-label="Compartilhar no WhatsApp"
        >
          <span className="share-bar-btn-icon" aria-hidden="true"><WhatsAppIcon /></span>
          <span className="share-bar-btn-label">WhatsApp</span>
        </button>
        <button
          type="button"
          className="share-bar-btn share-bar-btn--linkedin"
          onClick={openLinkedIn}
          aria-label="Compartilhar no LinkedIn"
        >
          <span className="share-bar-btn-icon" aria-hidden="true"><LinkedInIcon /></span>
          <span className="share-bar-btn-label">LinkedIn</span>
        </button>
      </div>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L20 7" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.94.55 3.74 1.5 5.27L2 22l4.95-1.6a9.93 9.93 0 0 0 5.09 1.4c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.36 14.07c-.23.65-1.13 1.21-1.84 1.36-.5.1-1.15.18-3.34-.72-2.81-1.16-4.62-3.99-4.76-4.18-.13-.18-1.13-1.5-1.13-2.86 0-1.36.71-2.03.96-2.31.25-.28.55-.35.74-.35.18 0 .37 0 .53.01.17 0 .4-.06.62.47.23.55.78 1.91.85 2.05.07.14.12.3.02.49-.1.18-.15.3-.29.46-.14.16-.3.36-.43.49-.14.13-.29.28-.13.55.16.27.7 1.16 1.5 1.87 1.04.92 1.91 1.21 2.18 1.34.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.13.45.2.52.31.07.11.07.66-.16 1.31z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}
