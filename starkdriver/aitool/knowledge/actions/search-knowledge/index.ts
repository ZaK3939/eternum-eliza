import { SEARCH_KNOWLEDGE_NAME } from "./name";
import { SEARCH_KNOWLEDGE_PROMPT } from "./prompt";
import { SearchKnowledgeInputSchema } from "./input-schema";
import { SearchKnowledgeResultBodyType } from "./types";
import { searchKnowledgeFunction } from "./function";

import { KnowledgeAction } from "../knowledge-action";

export class SearchKnowledgeAction implements KnowledgeAction<typeof SearchKnowledgeInputSchema, SearchKnowledgeResultBodyType> {
  public name = SEARCH_KNOWLEDGE_NAME;
  public description = SEARCH_KNOWLEDGE_PROMPT;
  public argsSchema = SearchKnowledgeInputSchema;
  public func = searchKnowledgeFunction;
} 