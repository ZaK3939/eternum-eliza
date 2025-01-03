import { Plugin, Action, Content, ActionExample, Handler, Validator } from '@ai16z/eliza';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score?: number;
  source: 'tavily' | 'exa';
  metadata?: Record<string, unknown>;
}

export interface SearchOptions {
  maxResults?: number;
  searchType?: string;
  filters?: Record<string, unknown>;
}

export interface SearchProvider {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}

export interface SearchPluginConfig {
  apiKey: string;
  maxResults?: number;
  searchType?: string;
  filters?: Record<string, unknown>;
}

export interface SearchAction extends Action {
  name: string;
  description: string;
  examples: ActionExample[][];
  similes: string[];
  handler: Handler;
  validate: Validator;
}

export interface SearchPlugin extends Plugin {
  name: string;
  description: string;
  actions: SearchAction[];
  config: SearchPluginConfig;
}

export interface BuildingContent extends Content {
  text: string;
  query?: string;
  type?: 'all' | 'by_resource' | 'by_capacity';
  resource?: string;
  [key: string]: any; // インデックスシグネチャを追加
}

export interface BuildingData {
  building_name: string;
  category: string;
  population_capacity: number;
  description: string;
  resource_name?: string;
}

export interface BuildingResponse {
  success: boolean;
  data: BuildingData[];
  message: string;
  action: string;
  text: string;
}

// アクション例の型
export interface BuildingActionExample {
  user: string;
  content: BuildingContent;
}

// アクション応答の型
export interface BuildingActionResponse {
  user: string;
  content: {
    text: string;
    action: string;
    data: BuildingData[];
  };
}

export interface ResourceContent extends Content {
  text: string;
  type?: 'all' | 'by_tier' | 'by_name' | 'by_rarity';
  tier?: string;
  name?: string;
  rarity?: number;
  response?: {
    success: boolean;
    data: any[];
    message?: string;
    sqlResult?: {
      rowCount: number;
      rows: any[];
    };
  };
}
