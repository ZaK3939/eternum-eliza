import { SEARCH_KNOWLEDGE_NAME } from '@/aitool/action-names';
import { knowledgeTool } from '@/aitool/knowledge';
import { SearchKnowledgeAction } from '@/aitool/knowledge/actions/search-knowledge';

export const KNOWLEDGE_TOOLS = {
  [`knowledge-${SEARCH_KNOWLEDGE_NAME}`]: knowledgeTool(new SearchKnowledgeAction()),
};
