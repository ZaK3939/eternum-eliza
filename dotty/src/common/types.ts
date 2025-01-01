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

// BuildingContent: ユーザー入力がどのような形式で来るか（例）
export interface BuildingContent extends Content {
  query: string;
  type?: 'all' | 'by_resource' | 'by_capacity';
  resource?: string;
}

// BuildingResponse: アクションが返すレスポンス
export interface BuildingResponse {
  success: boolean;
  data: any[];
  message: string;
}
