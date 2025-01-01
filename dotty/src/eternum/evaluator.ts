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
      context: 'Validating building query',
      messages: [
        {
          user: '{{user1}}',
          content: {
            text: 'Show all buildings',
            response: {
              success: true,
              data: [{ name: 'Farm', category: 'production' }],
              message: 'Query executed successfully',
            },
          } as BuildingQueryContent,
        },
      ],
      // outcome: JSON string representing validation result
      outcome: `{"isValid": true}`,
    },
  ],

  /**
   * validate: アクション後のメッセージに "success" や "data" がちゃんとあるかチェック
   */
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = message.content as BuildingQueryContent;
    // responseオブジェクトが存在し、かつ data が配列かどうか
    if (!content.response) return false;
    if (typeof content.response.success !== 'boolean') return false;
    if (!Array.isArray(content.response.data)) return false;
    return true;
  },

  /**
   * handler: 検証結果をもとに必要な処理を行う
   */
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const content = message.content as BuildingQueryContent;
    // response が success = true かどうか
    if (!content.response?.success) {
      // 失敗時の処理
      return {
        isValid: false,
        error: content.response?.message || 'Query failed for unknown reasons',
      };
    }
    // 成功時
    return {
      isValid: true,
      data: content.response.data,
    };
  },

  alwaysRun: false,
};
