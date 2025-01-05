// resources.evaluator.ts
import { Evaluator, IAgentRuntime, Memory } from '@elizaos/core';
import { ResourceContent } from '../../common/types.ts';

export const resourceQueryEvaluator: Evaluator = {
  name: 'VALIDATE_RESOURCE_QUERY',
  description: 'Validates resource query results',
  similes: [
    'GET_RESOURCES',
    'SEARCH_RESOURCES',
    'FIND_RESOURCES',
    'CHECK_RESOURCES',
    'LOOKUP_RESOURCES',
    'CONSULT_RESOURCE_RECORDS',
    'GET_RESOURCE_DETAILS',
    'RESOURCE_INFO',
  ],

  examples: [
    {
      context: 'Validating successful all resources query',
      messages: [
        {
          user: '{{user1}}',
          content: {
            text: 'Show all resources',
            type: 'all',
            action: 'QUERY_ETERNUM_RESOURCES', // アクションを追加
            response: {
              success: true,
              data: [
                { name: 'Wood', tier: 'common', rarity: 1.0 },
                { name: 'Stone', tier: 'common', rarity: 1.27 },
              ],
            },
          } as ResourceContent,
        },
      ],
      outcome: `{"isValid": true, "data": [{"name":"Wood","tier":"common"},{"name":"Stone","tier":"common"}]}`,
    },
    // 新しい例を追加
    {
      context: 'Validating resource details query',
      messages: [
        {
          user: '{{user1}}',
          content: {
            text: 'Tell me about Dragonhide',
            type: 'by_name',
            name: 'Dragonhide',
            action: 'QUERY_ETERNUM_RESOURCES',
            response: {
              success: true,
              data: [
                {
                  name: 'Dragonhide',
                  tier: 'mythic',
                  rarity: 217.92,
                  description: 'Dragons are the hidden guardians of our reality...',
                },
              ],
            },
          } as ResourceContent,
        },
      ],
      outcome: `{"isValid": true, "data": [{"name":"Dragonhide","tier":"mythic","rarity":217.92}]}`,
    },
  ],

  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = message.content as ResourceContent;
    console.log('Validating resource query:', content);
    console.log('Action after validation:', content.action);

    // テキスト内容からタイプとパラメータを推論
    if (!content.type) {
      const text = content.text.toLowerCase();
      if (text.includes('about ')) {
        content.type = 'by_name';
        content.name = text.split('about ')[1].trim();
        content.action = 'QUERY_ETERNUM_RESOURCES';
      } else if (text.includes('all')) {
        content.type = 'all';
        content.action = 'QUERY_ETERNUM_RESOURCES';
      }
    }

    // アクションの検証
    if (!content.action) {
      content.action = 'QUERY_ETERNUM_RESOURCES';
    }

    if (!content.text) return false;

    // レスポンスは初期バリデーション時には存在しない可能性がある
    if (content.response) {
      if (typeof content.response.success !== 'boolean') return false;
      if (!Array.isArray(content.response.data)) return false;

      if (content.response.data.length > 0) {
        const validFields = content.response.data.every(
          (item) => typeof item.name === 'string' && typeof item.tier === 'string',
        );
        if (!validFields) return false;
      }
    }
    console.log('Resource query validation successful');
    console.log('Content:', content);
    return true;
  },

  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const content = message.content as ResourceContent;
    console.log('[eval]Resource query initiated:', content);
    // レスポンスがない場合は初期クエリとして扱う
    if (!content.response) {
      return {
        isValid: true,
        data: [],
        message: 'Initial resource query validation successful',
      };
    }

    if (!content.response.success) {
      return {
        isValid: false,
        error: content.response.message || 'Query failed for unknown reasons',
      };
    }

    if (content.response.data.length === 0) {
      return {
        isValid: true,
        data: [],
        message: content.type === 'by_tier' ? `No resources found in ${content.tier} tier` : 'No resources found',
      };
    }

    return {
      isValid: true,
      data: content.response.data.map((item) => ({
        name: item.name,
        tier: item.tier,
        rarity: item.rarity,
        description: item.description,
      })),
      message: 'Resource data validated successfully',
    };
  },

  alwaysRun: false,
};
