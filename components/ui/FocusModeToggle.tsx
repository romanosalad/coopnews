"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "briefing-focus-mode";

export function FocusModeToggle() {
  const [enabled, setEnabled] = useState(false);

  // Sincroniza o estado React com o que o bootstrap inline já aplicou no
  // <html> antes da hidratação. Sem isso, o botão começa "Off" mesmo quando
  // o tema visual está ativo.
  useEffect(() => {
    setEnabled(document.documentElement.classList.contains("focus-mode"));
  }, []);

  // Reading progress (--reading-progress 0..1) + paragraph spotlight: rodam
  // sempre, mas o CSS só consome quando .focus-mode está ativo. Custo mínimo
  // (rAF + IntersectionObserver leves) e zero efeito quando o modo está off.
  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      document.documentElement.style.setProperty("--reading-progress", String(progress));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });

    let activeEl: Element | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        // Pega o parágrafo mais ao centro da janela — referência visual de
        // "onde estou lendo agora". Marca apenas um por vez.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(centerDistance(a)) - Math.abs(centerDistance(b)));
        if (visible.length === 0) return;
        const next = visible[0].target;
        if (next === activeEl) return;
        if (activeEl) activeEl.classList.remove("is-current-paragraph");
        next.classList.add("is-current-paragraph");
        activeEl = next;
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: [0, 0.5, 1] }
    );

    const paragraphs = document.querySelectorAll(".article-body p");
    paragraphs.forEach((p) => observer.observe(p));

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    document.documentElement.classList.toggle("focus-mode", next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, "1");
      else localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      // localStorage indisponível (modo privado) — toggle continua funcional
      // dentro da sessão.
    }
  }

  return (
    <button
      type="button"
      className={`focus-toggle ${enabled ? "is-on" : ""}`}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Desligar Modo Foco" : "Ligar Modo Foco"}
      title={enabled ? "Modo Foco ligado — clique para voltar ao tema normal" : "Modo Foco — leitura confortável para sessões longas"}
    >
      <span className="focus-toggle-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" />
        </svg>
      </span>
      <span className="focus-toggle-label">{enabled ? "Modo Foco" : "Modo Foco"}</span>
      <span className="focus-toggle-state">{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}

function centerDistance(entry: IntersectionObserverEntry) {
  const rect = entry.boundingClientRect;
  return rect.top + rect.height / 2 - window.innerHeight / 2;
}
