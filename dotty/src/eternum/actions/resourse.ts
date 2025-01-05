// resources.action.ts
import {
  Action,
  Memory,
  IAgentRuntime,
  HandlerCallback,
  Content,
  composeContext,
  generateMessageResponse,
  ModelClass,
} from '@elizaos/core';
import { ResourceContent } from '../../common/types.ts';
import resourceQueryProvider from '../provider/resourse.ts';
import { messageHandlerTemplate } from '@elizaos/client-direct';

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
      console.log('Retrieved resources:', resources);

      // テキストを更新
      const resource = resources[0];
      message.content.text =
        `Resource Name: ${resource.name} (${resource.ticker})\n` +
        `Tier: ${resource.tier}\n` +
        `Description: ${resource.description}\n` +
        `Rarity: ${resource.rarity}, Value: ${resource.value}\n` +
        `Color: ${resource.colour}\n`;

      message.content.actionResponse = {
        success: true,
        data: resources,
        message: `Found ${resources.length} resources.`,
      };

      console.log('Updated text:', message.content.text);

      // 再度 `generateMessageResponse` を実行
      const state = await runtime.composeState(message, {
        agentName: runtime.character.name,
      });
      const context = composeContext({
        state,
        template: messageHandlerTemplate,
      });

      const response = await generateMessageResponse({
        runtime,
        context,
        modelClass: ModelClass.LARGE,
      });

      // 生成されたレスポンスを保存
      const responseMessage = {
        ...message,
        userId: runtime.agentId,
        content: response,
      };
      console.log('Updated Response Message:', responseMessage);

      await runtime.messageManager.createMemory(responseMessage);
    } catch (error) {
      console.error('Resource action error:', error);

      // エラー発生時のテキスト
      message.content.text = "I apologize, but I'm having trouble accessing the resource records at the moment.";
      message.content.actionResponse = {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Query failed',
      };

      await runtime.messageManager.createMemory(message);
    }
  },
};

function generateResourceResponse(resources: any[], type?: string, tier?: string): string {
  if (!resources || resources.length === 0) {
    return tier ? `I couldn't find any ${tier} tier resources.` : `No resources found.`;
  }

  let response = '';

  switch (type) {
    case 'by_name': {
      const resource = resources[0];
      response = `Resource Name: ${resource.name} (${resource.ticker})\n`;
      response += `Tier: ${resource.tier}\n`;
      response += `Description: ${resource.description}\n`;
      response += `Rarity: ${resource.rarity}, Value: ${resource.value}\n`;
      response += `Color: ${resource.colour}\n`;
      break;
    }
    case 'by_tier': {
      response = `Here are the ${tier} tier resources:\n`;
      resources.forEach((resource) => {
        response += `\n- ${resource.name} (${resource.ticker}): ${resource.description}`;
        response += `\n  Rarity: ${resource.rarity}, Value: ${resource.value}`;
      });
      break;
    }
    default: {
      response = `I found ${resources.length} resources. Here are some notable ones:\n`;
      resources.slice(0, 3).forEach((resource) => {
        response += `\n- ${resource.name} (${resource.tier}): ${resource.description}`;
      });
    }
  }

  return response;
}
