// Curated Unsplash covers used when an article has no real og:image and the
// AI-generated cover hasn't been produced yet. Each editoria gets a small pool
// so neighboring cards on the homepage don't repeat. Selection is
// deterministic from the slug so the same article always renders the same
// fallback cover. Unsplash hotlinks pass without proxy.

const FALLBACK_POOLS: Record<string, string[]> = {
  "editoria-criatividade": [
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1561070791-2526d30994b8?auto=format&fit=crop&w=1200&q=80"
  ],
  "editoria-martech": [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"
  ],
  "editoria-ia": [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
  ],
  "editoria-bem": [
    "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1200&q=80"
  ],
  "editoria-automacao": [
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
  ],
  "editoria-lafora": [
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80"
  ]
};

const DEFAULT_POOL = FALLBACK_POOLS["editoria-criatividade"];

export function getEditorialFallbackImage(eyebrowClass: string | undefined, slug: string): string {
  const pool = (eyebrowClass && FALLBACK_POOLS[eyebrowClass]) || DEFAULT_POOL;
  const seed = slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return pool[seed % pool.length];
}
