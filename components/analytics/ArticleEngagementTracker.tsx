"use client";

import { useEffect, useRef } from "react";
import { sendContentEvent } from "@/components/analytics/ArticleLink";

type ArticleEngagementTrackerProps = {
  contentId?: string;
};

export function ArticleEngagementTracker({ contentId }: ArticleEngagementTrackerProps) {
  const engagedSecondsRef = useRef(0);
  const lastInteractionRef = useRef(Date.now());
  const maxScrollRef = useRef(0);

  useEffect(() => {
    if (!contentId) return;

    let disposed = false;
    sendContentEvent(contentId, "view");

    const markInteraction = () => {
      lastInteractionRef.current = Date.now();
      maxScrollRef.current = Math.max(maxScrollRef.current, getScrollDepth());
    };

    const engagementTimer = window.setInterval(() => {
      if (disposed || document.visibilityState !== "visible") return;
      const recentlyActive = Date.now() - lastInteractionRef.current <= 5000;
      if (recentlyActive) {
        engagedSecondsRef.current += 1;
      }
    }, 1000);

    const flushTimer = window.setInterval(() => {
      flush(contentId, engagedSecondsRef.current, maxScrollRef.current);
    }, 15000);

    window.addEventListener("scroll", markInteraction, { passive: true });
    window.addEventListener("mousemove", markInteraction, { passive: true });
    window.addEventListener("keydown", markInteraction);
    window.addEventListener("touchstart", markInteraction, { passive: true });
    window.addEventListener("click", markInteraction);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flush(contentId, engagedSecondsRef.current, maxScrollRef.current);
      }
    });
    window.addEventListener("pagehide", () => flush(contentId, engagedSecondsRef.current, maxScrollRef.current));

    return () => {
      disposed = true;
      flush(contentId, engagedSecondsRef.current, maxScrollRef.current);
      window.clearInterval(engagementTimer);
      window.clearInterval(flushTimer);
    };
  }, [contentId]);

  return null;
}

function flush(contentId: string, engagedSeconds: number, scrollDepth: number) {
  sendContentEvent(contentId, "engagement", {
    engagedSeconds,
    scrollDepth
  });
}

function getScrollDepth() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(100, Math.max(0, Math.round((scrollTop / scrollable) * 100)));
}
