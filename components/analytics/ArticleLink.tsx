"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";

type ArticleLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  contentId?: string;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function ArticleLink({ contentId, children, onClick, ...props }: ArticleLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (contentId) {
      sendContentEvent(contentId, "click");
    }
    onClick?.(event);
  }

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}

export function sendContentEvent(contentId: string, eventType: "click" | "view" | "engagement", payload: Record<string, unknown> = {}) {
  const body = JSON.stringify({
    contentId,
    eventType,
    sessionId: getSessionId(),
    ...payload
  });

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/content-events", blob);
    return;
  }

  void fetch("/api/content-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  });
}

function getSessionId() {
  const key = "coopnews_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;

  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
}
