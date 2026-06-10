export interface CatalogComponent {
  id: string;
  label: string;
  category: string;
  platform: string;
  description: string;
  /** @deprecated use icon_key */
  icon?: string;
  icon_key: string;
  color: string;
  best_practices: string[];
}

export interface PlatformTechnique {
  id: string;
  name: string;
  category: string;
  description: string;
  when_to_use: string;
  best_practices: string[];
  related_components: string[];
  added_in_version: string;
  doc_url?: string;
}

export interface PlatformTemplate {
  id: string;
  name: string;
  description: string;
  platform: string;
  components: string[];
  techniques?: string[];
}

export interface PlatformUpdate {
  version: string;
  date: string;
  summary: string;
  additions: string[];
}

export interface PlatformKnowledge {
  platform: string;
  display_name: string;
  version: string;
  last_updated: string;
  doc_sources: string[];
  components: CatalogComponent[];
  techniques: PlatformTechnique[];
  templates: PlatformTemplate[];
  review_dimensions: string[];
  generation_hints: string[];
  changelog: PlatformUpdate[];
}
