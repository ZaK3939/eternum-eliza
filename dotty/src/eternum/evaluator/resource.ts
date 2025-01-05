import { Evaluator, IAgentRuntime, Memory } from '@elizaos/core';
import { ResourceQueryParams } from '../provider/resourceQueryProvider.ts';

/**
 * resourceQueryEvaluator:
 * ユーザーが「Tell me about X」「Show me all resources」「tier: common」などと言ったとき、
 * message.content に type/name/tier/rarity をセットし、 action='RESOURCE_QUERY' を仕込む
 */
export const resourceQueryEvaluator: Evaluator = {
  name: 'RESOURCE_QUERY_EVALUATOR',
  description: 'Parse user messages to set resource query params, sets action=RESOURCE_QUERY',
  similes: ['GET_RESOURCES', 'LOOKUP_RESOURCE', 'SEARCH_RESOURCE', 'FIND_RESOURCE', 'RESOURCE_QUERY'],
  examples: [
    {
      context: 'User asks about a resource by name',
      messages: [
        {
          user: '{{user1}}',
          content: { text: 'Tell me about Dragonhide' },
        },
      ],
      outcome: "action=RESOURCE_QUERY, type=by_name, name='dragonhide'",
    },
  ],

  // 1) validate
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content.text || '').toLowerCase();
    // 例: "about" や "show me all" "tier" などのキーワードで判定
    if (!text) return false;
    return text.includes('about') || text.includes('all') || text.includes('tier') || text.includes('rarity');
  },

  // 2) handler
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    // 例: 簡単に "about X" / "all" / "tier X" / "rarity X" を解析
    const text = message.content.text.toLowerCase();

    const params: ResourceQueryParams = {
      text,
      type: 'all',
    };

    if (text.includes('about ')) {
      params.type = 'by_name';
      params.name = text.split('about ')[1]?.trim();
    } else if (text.includes('all')) {
      params.type = 'all';
    } else if (text.includes('tier ')) {
      params.type = 'by_tier';
      params.tier = text.split('tier ')[1]?.trim();
    } else if (text.includes('rarity ')) {
      params.type = 'by_rarity';
      const valStr = text.split('rarity ')[1]?.trim();
      if (valStr) {
        const val = parseFloat(valStr);
        if (!isNaN(val)) params.rarity = val;
      }
    }

    // Evaluator で set
    message.content.action = 'RESOURCE_QUERY';
    Object.assign(message.content, params);

    console.log('[resourceQueryEvaluator] set action=RESOURCE_QUERY, params=', params);
  },

  // optional
  alwaysRun: false,
};
