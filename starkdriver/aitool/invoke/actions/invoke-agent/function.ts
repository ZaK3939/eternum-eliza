import type { InvokeAgentArgumentsType, InvokeAgentResultType } from "./types";

export const invokeAgentFunction = async (args: InvokeAgentArgumentsType): Promise<InvokeAgentResultType> => {
    return {
        message: `Invoking agent ${args.agent}`,
        body: {
            message: args.message,
        },
    };
};