import { INVOKE_AGENT_NAME } from './name';
import { INVOKE_AGENT_PROMPT } from './prompt';
import { InvokeAgentInputSchema } from './input-schema';
import { InvokeAgentResultBodyType, InvokeAgentSchemaType } from './types';
import { invokeAgentFunction } from './function';

import { InvokeAction } from '../invoke-action';
import { Agent } from '@/aitool/agent';

export class InvokeAgentAction implements InvokeAction<InvokeAgentSchemaType, InvokeAgentResultBodyType> {
  public name = INVOKE_AGENT_NAME;
  public description: string;
  public argsSchema: InvokeAgentSchemaType;
  public func = invokeAgentFunction;

  constructor(agents: Agent[]) {
    this.argsSchema = InvokeAgentInputSchema(agents);
    this.description = INVOKE_AGENT_PROMPT(agents);
  }
}
