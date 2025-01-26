import { KNOWLEDGE_AGENT_CAPABILITIES } from './capabilities';
import { KNOWLEDGE_AGENT_DESCRIPTION } from './description';
import { KNOWLEDGE_AGENT_NAME } from './name';
import { KNOWLEDGE_TOOLS } from './tools';

import type { Agent } from '@/aitool/agent';

export const knowledgeAgent: Agent = {
  name: KNOWLEDGE_AGENT_NAME,
  slug: 'knowledge',
  systemPrompt: KNOWLEDGE_AGENT_DESCRIPTION,
  capabilities: KNOWLEDGE_AGENT_CAPABILITIES,
  tools: KNOWLEDGE_TOOLS,
};
