import { Placeholder } from "@/components/ui/Placeholder";

type ArticleVisualProps = {
  alt: string;
  imageUrl?: string | null;
  placeholder: number;
};

export function ArticleVisual({ alt, imageUrl, placeholder }: ArticleVisualProps) {
  if (imageUrl) {
    return <img src={imageUrl} alt={alt} loading="lazy" referrerPolicy="no-referrer" />;
  }

  return <Placeholder idx={placeholder} />;
}
