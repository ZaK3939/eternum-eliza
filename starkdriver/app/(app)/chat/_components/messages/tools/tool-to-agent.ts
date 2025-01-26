import { KNOWLEDGE_AGENT_NAME, WALLET_AGENT_NAME } from '@/aitool/agents/names';
import { IconName } from '@/types';

import { ToolInvocation } from 'ai';

export const toolToAgent = {
  wallet: WALLET_AGENT_NAME,
  knowledge: KNOWLEDGE_AGENT_NAME,
};

export const getAgentName = (tool: ToolInvocation) => {
  const toolParts = tool.toolName.split('-');
  const agentName = toolParts[0];
  return toolToAgent[agentName as keyof typeof toolToAgent] || 'Unknown Agent';
};

export const getAgentIcon = (agentName: string): IconName => {
  switch (agentName) {
    case WALLET_AGENT_NAME:
      return 'Wallet';
    case KNOWLEDGE_AGENT_NAME:
      return 'Brain';
    default:
      return 'Brain';
  }
};
