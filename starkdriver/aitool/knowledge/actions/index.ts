import { SearchKnowledgeAction } from "./search-knowledge";

import type { KnowledgeAction, KnowledgeActionSchemaAny } from "./knowledge-action";

export function getAllKnowledgeActions(): KnowledgeAction<KnowledgeActionSchemaAny, any>[] {
  return [
    new SearchKnowledgeAction()
  ];
}

export const KNOWLEDGE_ACTIONS = getAllKnowledgeActions();

export * from './types';
export * from './knowledge-action';