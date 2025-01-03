import { Evaluator, IAgentRuntime, Memory } from '@ai16z/eliza';

// BuildingQueryContent: ユーザーまたはアクション実行後のメッセージ構造
interface BuildingQueryContent {
  text: string;
  [key: string]: any;
  response?: {
    success: boolean;
    data: any[];
    message?: string;
  };
  type?: 'all' | 'by_resource' | 'by_capacity';
  resource?: string;
}

export const buildingQueryEvaluator: Evaluator = {
  name: 'VALIDATE_BUILDING_QUERY',
  description: 'Validates building query results',
  similes: ['CHECK_BUILDING_DATA', 'VERIFY_BUILDING_QUERY'],

  examples: [
    {
      context: 'Validating successful all buildings query',
      messages: [
        {
          user: '{{user1}}',
          content: {
            text: 'Show all buildings',
            type: 'all',
            response: {
              success: true,
              data: [
                { name: 'Farm', category: 'production', population_capacity: 1 },
                { name: 'Worker Hut', category: 'basic_infrastructure', population_capacity: 5 },
              ],
              message: 'Query executed successfully',
            },
          } as BuildingQueryContent,
        },
      ],
      outcome: `{"isValid": true, "data": [{"name":"Farm","category":"production"},{"name":"Worker Hut","category":"basic_infrastructure"}]}`,
    },
    {
      context: 'Validating successful resource-specific query',
      messages: [
        {
          user: '{{user1}}',
          content: {
            text: 'Which buildings produce Wheat?',
            type: 'by_resource',
            resource: 'Wheat',
            response: {
              success: true,
              data: [{ name: 'Farm', category: 'production', resource: 'Wheat' }],
              message: 'Query executed successfully',
            },
          } as BuildingQueryContent,
        },
      ],
      outcome: `{"isValid": true, "data": [{"name":"Farm","category":"production","resource":"Wheat"}]}`,
    },
    {
      context: 'Validating failed query',
      messages: [
        {
          user: '{{user1}}',
          content: {
            text: 'Show buildings',
            response: {
              success: false,
              data: [],
              message: 'Database connection error',
            },
          } as BuildingQueryContent,
        },
      ],
      outcome: `{"isValid": false, "error": "Database connection error"}`,
    },
  ],

  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = message.content as BuildingQueryContent;

    // Basic validation
    if (!content.response) return false;
    if (typeof content.response.success !== 'boolean') return false;
    if (!Array.isArray(content.response.data)) return false;

    // Additional type-specific validation
    if (content.type === 'by_resource' && !content.resource) return false;

    // Data structure validation
    if (content.response.data.length > 0) {
      const validFields = content.response.data.every(
        (item) => typeof item.name === 'string' && typeof item.category === 'string',
      );
      if (!validFields) return false;
    }

    return true;
  },

  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const content = message.content as BuildingQueryContent;

    // Query failure handling
    if (!content.response?.success) {
      return {
        isValid: false,
        error: content.response?.message || 'Query failed for unknown reasons',
      };
    }

    // Empty results handling
    if (content.response.data.length === 0) {
      return {
        isValid: true,
        data: [],
        message:
          content.type === 'by_resource' ? `No buildings found that produce ${content.resource}` : 'No buildings found',
      };
    }

    // Success case
    return {
      isValid: true,
      data: content.response.data,
      message: 'Building data validated successfully',
    };
  },

  alwaysRun: false,
};

export default buildingQueryEvaluator;
