export type StorySlide = {
  kicker: string;
  title: string;
  body: string;
};

export type Content = {
  id: string;
  created_at: string;
  published_at: string | null;
  title: string;
  slug: string;
  body_markdown: string;
  source_url: string | null;
  story_json: StorySlide[];
  image_url: string | null;
  tab_cash: number;
  status: "draft" | "published";
  geo_location: string | null;
  category: string;
  relevance_score: number;
  decision_log: Record<string, unknown>;
  view_count?: number;
  click_count?: number;
  total_engaged_seconds?: number;
  quality_view_count?: number;
  total_scroll_depth?: number;
};
