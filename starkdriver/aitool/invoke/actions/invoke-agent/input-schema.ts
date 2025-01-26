import { Agent } from '@/aitool/agent';
import { z } from 'zod';

export const InvokeAgentInputSchema = (agents: Agent[]) =>
  z.object({
    agent: z
      .enum(agents.map((agent) => agent.name) as [string, ...string[]])
      .describe('The name of the agent to invoke.'),
    message: z.string().describe('The message to send to the other agent.'),
  });
