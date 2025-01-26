import { Agent } from '@/aitool/agent';

export const INVOKE_AGENT_PROMPT = (agents: Agent[]) =>
  `Invoke another agent that can handle a task that the current agent cannot.

You will provide the message to send to the other agent, which will inform the other agent what it should do.

The agents available are: ${agents.map((agent) => `${agent.name} - ${agent.capabilities}`).join(', ')}.`;
