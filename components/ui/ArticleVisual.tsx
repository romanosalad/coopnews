"use client";

import { useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";

type ArticleVisualProps = {
  alt: string;
  imageUrl?: string | null;
  placeholder: number;
};

export function ArticleVisual({ alt, imageUrl, placeholder }: ArticleVisualProps) {
  const [stage, setStage] = useState<"direct" | "proxy" | "failed">(getInitialStage(imageUrl));

  if (!imageUrl || stage === "failed") {
    return <Placeholder idx={placeholder} />;
  }

  const src =
    stage === "proxy" || isExternalUrl(imageUrl) ? `/api/image-proxy?url=${encodeURIComponent(imageUrl)}` : imageUrl;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setStage(stage === "direct" ? "proxy" : "failed")}
    />
  );
}

function getInitialStage(url: string | null | undefined): "direct" | "proxy" | "failed" {
  if (!url) return "failed";
  return isExternalUrl(url) ? "proxy" : "direct";
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}
