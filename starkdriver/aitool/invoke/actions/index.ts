import { InvokeAgentAction } from './invoke-agent';

import type { InvokeAction, InvokeActionSchemaAny } from './invoke-action';
import { agents } from '@/aitool/agents';

export function getAllInvokeActions(): InvokeAction<InvokeActionSchemaAny, any>[] {
  return [new InvokeAgentAction(agents)];
}

export const INVOKE_ACTIONS = getAllInvokeActions();

export * from './types';
export * from './invoke-action';
