import { WALLET_AGENT_CAPABILITIES } from './capabilities';
import { WALLET_AGENT_DESCRIPTION } from './description';
import { WALLET_AGENT_NAME } from './name';
import { WALLET_TOOLS } from './tools';

import type { Agent } from '@/aitool/agent';

export const walletAgent: Agent = {
  name: WALLET_AGENT_NAME,
  slug: 'wallet',
  systemPrompt: WALLET_AGENT_DESCRIPTION,
  capabilities: WALLET_AGENT_CAPABILITIES,
  tools: WALLET_TOOLS,
};
