import { Action, Memory, IAgentRuntime } from '@elizaos/core';
import ResourceQueryProvider, { ResourceQueryResult } from '../provider/resourceQueryProvider.ts';

/**
 * resourceQueryAction:
 * DBで resources を検索し、結果をメッセージに格納。
 */
export const resourceQueryAction: Action = {
  name: 'RESOURCE_QUERY',
  description: 'Query resources from DB with ResourceQueryProvider',
  similes: ['SEARCH_RESOURCES', 'GET_RESOURCE'],
  examples: [
    [
      {
        user: '{{user1}}',
        content: {
          text: 'Tell me about Dragonhide',
          action: 'RESOURCE_QUERY',
          type: 'by_name',
          name: 'dragonhide',
        },
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'Dragonhide is a mythic resource ...',
        },
      },
    ],
  ],

  // 1) validate
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    return message.content.action === 'RESOURCE_QUERY';
  },

  // 2) handler
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    console.log('[resourceQueryAction] Handler invoked with content=', message.content);

    // ResourceQueryProvider の get を呼ぶ
    let results: any[] = [];
    try {
      results = await ResourceQueryProvider.get(runtime, message);
    } catch (err) {
      console.error('Resource query error:', err);
      message.content.text = 'Error fetching resources: ' + err.message;
      return;
    }

    if (!results || results.length === 0) {
      message.content.text = 'No resources found.';
      return;
    }

    // message.content.text = formatResource(first, results.length > 1);
    // convert to string
    const jsonString = JSON.stringify(results);
    message.content.text = jsonString;
  },
};

function formatResource(res: ResourceQueryResult, multiple: boolean): string {
  // 複数ヒットなら「他にもあるよ」表示するなど
  const prefix = multiple ? '(Multiple results found, showing first)\n' : '';
  return (
    prefix +
    `Name: ${res.name}
Tier: ${res.tier}
Rarity: ${res.rarity}
Value: ${res.value}
Description: ${res.description}
Ticker: ${res.ticker}
Colour: ${res.colour}
`
  );
}
