import {
  Evaluator,
  generateMessageResponse,
  generateText,
  IAgentRuntime,
  Memory,
  messageCompletionFooter,
  ModelClass,
} from '@elizaos/core';
import { ResourceQueryParams } from '../provider/resourceQueryProvider.ts';

/**
 * resourceQueryEvaluator:
 * 1) 軽量モデルでユーザ発話→JSONパースを試み
 * 2) 失敗した場合は従来の includes-based fallback
 * 3) 最終的に action='RESOURCE_QUERY' + type/name/tier/rarity を set
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

  // 1) validate: このEvaluatorを動かすかどうか
  validate: async (runtime, message): Promise<boolean> => {
    const text = (message.content.text || '').toLowerCase();
    if (!text) return false;

    // “about”, “all”, “tier”, “rarity” のいずれかが入っていれば判定
    return text.includes('about') || text.includes('all') || text.includes('tier') || text.includes('rarity');
  },

  // 2) handler: 軽量モデルで JSONパース → fallback
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    console.log('[resourceQueryEvaluator] Handler invoked with content=', message.content);
    const text = (message.content.text || '').toLowerCase();

    // プロンプト: undefined ではなく null を使うように指示
    const parseTemplate = `
You are a small model that extracts resource query parameters from user text.

User's text: "${text}"
Do NOT include any keys except exactly:
 {
   "type": "by_name" | "by_tier" | "by_rarity" | "all",
   "name": string | null,
   "tier": string | null,
   "rarity": number | null
 }
 Do NOT include extra keys like user or text or action.
 Return only the keys "type","name","tier","rarity" at top-level.
 If a field is missing, use null.
 If user says "Tell me about X", set "type":"by_name", "name":X, others null.
 If user says "all", set "type":"all", ...
 If cannot parse, set "type":"all", "name":null,"tier":null,"rarity":null.`;

    let parsedParams: Partial<ResourceQueryParams> = {};

    try {
      // 軽量モデルにリクエスト (generateMessageResponse)
      const responseStr = await generateText({
        runtime,
        context: parseTemplate,
        modelClass: ModelClass.SMALL,
      });
      console.log('[resourceQueryEvaluator] parseResponse:', responseStr);

      // JSONパース
      parsedParams = JSON.parse(responseStr || '{}');

      // type が無い場合は fallback
      if (!parsedParams.type) {
        parsedParams.type = 'all';
      }
    } catch (err) {
      console.warn('JSON parse error from small model, fallback to includes-based logic.', err);
      parsedParams = {};
    }

    // fallback: includes-based logic
    if (!parsedParams.type) {
      const fallbackParams: ResourceQueryParams = {
        text,
        type: 'all',
      };
      if (text.includes('about ')) {
        fallbackParams.type = 'by_name';
        fallbackParams.name = text.split('about ')[1]?.trim();
      } else if (text.includes('all')) {
        fallbackParams.type = 'all';
      } else if (text.includes('tier ')) {
        fallbackParams.type = 'by_tier';
        fallbackParams.tier = text.split('tier ')[1]?.trim();
      } else if (text.includes('rarity ')) {
        fallbackParams.type = 'by_rarity';
        const valStr = text.split('rarity ')[1]?.trim();
        if (valStr) {
          const val = parseFloat(valStr);
          if (!isNaN(val)) fallbackParams.rarity = val;
        }
      }
      parsedParams = fallbackParams;
      console.log('[resourceQueryEvaluator] fallback includes-based parse:', fallbackParams);
    }

    // 最終的に action='RESOURCE_QUERY' などをセット
    message.content.action = 'RESOURCE_QUERY';
    message.content.type = parsedParams.type || 'all';

    if (parsedParams.name) message.content.name = parsedParams.name;
    if (parsedParams.tier) message.content.tier = parsedParams.tier;
    if (parsedParams.rarity !== undefined && parsedParams.rarity !== null) {
      message.content.rarity = parsedParams.rarity;
    }

    console.log('[resourceQueryEvaluator] Final ResourceQueryParams:', {
      type: message.content.type,
      name: message.content.name,
      tier: message.content.tier,
      rarity: message.content.rarity,
    });
  },

  // alwaysRun=true で常に動くようにする
  alwaysRun: true,
};
