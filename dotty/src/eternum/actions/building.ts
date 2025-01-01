import { Action, Memory, IAgentRuntime } from '@ai16z/eliza';
import { BuildingContent, BuildingResponse } from '../../common/types.ts';

export const buildingAction: Action = {
  name: 'QUERY_ETERNUM_BUILDINGS',
  description: 'Queries building information from Eternum database',
  similes: ['GET_BUILDINGS', 'SEARCH_BUILDINGS', 'FIND_BUILDINGS'],
  examples: [
    [
      {
        user: '{{user1}}',
        content: {
          query: 'Show me all buildings',
          type: 'all',
        } as BuildingContent,
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'Here are all the buildings in the database',
          action: 'QUERY_ETERNUM_BUILDINGS',
          data: [
            {
              building_name: 'Farm',
              category: 'production',
              description: 'Produces Wheat',
            },
          ],
        },
      },
    ],
    [
      {
        user: '{{user1}}',
        content: {
          query: 'Which buildings produce Wheat?',
          type: 'by_resource',
          resource: 'Wheat',
        } as BuildingContent,
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'These buildings produce Wheat:',
          action: 'QUERY_ETERNUM_BUILDINGS',
          data: [{ building_name: 'Farm' }],
        },
      },
    ],
  ],

  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = message.content as BuildingContent;
    if (typeof content.query !== 'string') return false;
    if (content.type && !['all', 'by_resource'].includes(content.type)) return false;
    return true;
  },

  handler: async (runtime: IAgentRuntime, message: Memory): Promise<BuildingResponse> => {
    try {
      const content = message.content as BuildingContent;
      const { type, resource } = content;
      const dbAdapter = runtime.databaseAdapter as any;

      let sqlResult;
      if (type === 'by_resource' && resource) {
        // リソースによる検索（building_costsテーブルを使用）
        sqlResult = await dbAdapter.query(
          `SELECT DISTINCT 
              b.name as building_name,
              b.category,
              b.description
           FROM buildings b
           JOIN building_costs bc ON b.id = bc.building_id
           JOIN resources r ON bc.resource_id = r.id
           WHERE r.name = $1`,
          [resource],
        );
      } else {
        // すべての建物を取得
        sqlResult = await dbAdapter.query(
          `SELECT 
              name as building_name,
              category,
              description
           FROM buildings`,
        );
      }

      return {
        success: true,
        data: sqlResult.rows,
        message: 'Query executed successfully',
      };
    } catch (error) {
      console.error('Building query error:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Query failed',
      };
    }
  },
};
