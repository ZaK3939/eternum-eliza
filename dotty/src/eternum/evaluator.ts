import { Evaluator, IAgentRuntime, Memory } from '@ai16z/eliza';
import { BuildingQueryContent } from '../common/types';

export const buildingQueryEvaluator: Evaluator = {
  name: 'VALIDATE_BUILDING_QUERY',
  description: 'Validates building query results',
  similes: ['CHECK_BUILDING_DATA', 'VERIFY_BUILDING_QUERY'],

  examples: [
    {
      context: 'Validating building query',
      messages: [
        {
          user: '{{user1}}',
          content: {
            text: 'Show all buildings',
            response: {
              success: true,
              data: [{ name: 'Farm', category: 'production' }],
            },
          } as BuildingQueryContent,
        },
      ],
      outcome: `{"isValid": true}`,
    },
  ],

  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = message.content as BuildingQueryContent;
    return content.response !== undefined && Array.isArray(content.response.data);
  },

  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const content = message.content as BuildingQueryContent;
    if (!content.response?.success) {
      return { isValid: false };
    }
    return {
      isValid: true,
      data: content.response.data,
    };
  },

  alwaysRun: false,
};
