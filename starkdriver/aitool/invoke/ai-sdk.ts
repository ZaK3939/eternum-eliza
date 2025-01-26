import { z } from 'zod';

import { CoreTool, tool } from 'ai';

import { INVOKE_ACTIONS } from './actions';

import type { InvokeAction, InvokeActionResult, InvokeActionSchemaAny } from './actions';

export const invokeTool = <TActionSchema extends InvokeActionSchemaAny, TResultBody>(
  action: InvokeAction<TActionSchema, TResultBody>,
) => {
  if (!action.func) {
    return tool({
      description: action.description,
      parameters: action.argsSchema,
    });
  }
  const func = action.func;
  return tool({
    description: action.description,
    parameters: action.argsSchema,
    execute: async (args) => {
      const result = await (func as (args: z.infer<TActionSchema>) => Promise<InvokeActionResult<TResultBody>>)(args);
      return result;
    },
  });
};

export const invokeTools = () =>
  INVOKE_ACTIONS.reduce(
    (acc, action) => {
      acc[action.name] = invokeTool(action);
      return acc;
    },
    {} as Record<string, CoreTool>,
  );
