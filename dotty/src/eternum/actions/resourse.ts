// resources.action.ts
import { Action, Memory, IAgentRuntime, HandlerCallback, Content } from '@ai16z/eliza';
import PostgresDatabaseAdapter from '@ai16z/adapter-postgres';
import { ResourceContent } from '../../common/types.ts';
import resourceQueryProvider from '../provider/resourse.ts';

export const resourcesAction: Action = {
  name: 'QUERY_ETERNUM_RESOURCES',
  description: 'Queries resource information from Eternum database',
  similes: [
    'GET_RESOURCES',
    'SEARCH_RESOURCES',
    'FIND_RESOURCES',
    'CHECK_RESOURCES',
    'LOOKUP_RESOURCES',
    'CONSULT_RESOURCE_RECORDS',
    'GET_RESOURCE_DETAILS', // 追加
    'RESOURCE_INFO', // 追加
  ],

  examples: [
    [
      {
        user: '{{user1}}',
        content: {
          text: 'Show me all resources',
          type: 'all',
          action: 'QUERY_ETERNUM_RESOURCES',
        } as ResourceContent,
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'Here are all the resources in our records:',
          action: 'QUERY_ETERNUM_RESOURCES',
          response: {
            success: true,
            data: [
              {
                name: 'Wood',
                tier: 'common',
                rarity: 1.0,
                description: 'Wood is the backbone of civilization.',
              },
            ],
          },
        } as ResourceContent,
      },
    ],
  ],

  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = message.content as ResourceContent;

    if (!content.text) return false;

    if (content.type && !['all', 'by_tier', 'by_name', 'by_rarity'].includes(content.type)) {
      return false;
    }

    if (content.type === 'by_tier' && !content.tier) {
      return false;
    }

    if (content.type === 'by_name' && !content.name) {
      return false;
    }

    return true;
  },

  handler: async (runtime: IAgentRuntime, message: Memory): Promise<void> => {
    console.log('Resource query initiated:', message.content);

    try {
      // Providerを使用してデータを取得
      const resources = await resourceQueryProvider.get(runtime, message);

      // レスポンステキストの生成
      const responseText = generateResourceResponse(
        resources,
        message.content.type as string,
        message.content.tier as string,
      );

      await runtime.processActions(message, [], undefined, (response: Content) => {
        const updatedMemory: Memory = {
          userId: message.userId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: responseText,
            action: 'QUERY_ETERNUM_RESOURCES',
            actionResponse: {
              success: true,
              data: resources,
              message: `Found ${resources.length} resources`,
            },
          },
        };
        return Promise.resolve([updatedMemory]);
      });
    } catch (error) {
      console.error('Resource action error:', error);
      await runtime.processActions(message, [], undefined, (response: Content) => {
        const errorMemory: Memory = {
          userId: message.userId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: "I apologize, but I'm having trouble accessing the resource records at the moment.",
            action: 'QUERY_ETERNUM_RESOURCES',
            actionResponse: {
              success: false,
              data: [],
              message: error instanceof Error ? error.message : 'Query failed',
            },
          },
        };
        return Promise.resolve([errorMemory]);
      });
    }
  },
};

function generateResourceResponse(resources: any[], type?: string, tier?: string): string {
  if (!resources || resources.length === 0) {
    return tier
      ? `I apologize, but I couldn't find any ${tier} tier resources.`
      : `I apologize, but I couldn't find any matching resources.`;
  }

  let response = '';

  switch (type) {
    case 'by_tier':
      response = `Here are the ${tier} tier resources in our records:\n`;
      resources.forEach((resource) => {
        response += `\n${resource.name} (${resource.ticker}): ${resource.description} Rarity: ${resource.rarity}`;
      });
      break;

    case 'by_name':
      const resource = resources[0];
      response = `${resource.name} (${resource.ticker}) is a ${resource.tier} tier resource.\n`;
      response += `${resource.description}\n`;
      response += `Rarity: ${resource.rarity}`;
      break;

    default:
      response = `I found ${resources.length} resources in our records. Here are some notable ones:\n`;
      resources.slice(0, 3).forEach((resource) => {
        response += `\n${resource.name} (${resource.tier} tier): ${resource.description}`;
      });
  }

  return response;
}
