import { Action, Memory, IAgentRuntime } from '@ai16z/eliza';
import { BuildingContent, BuildingResponse } from '../../common/types';

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
              building_name: 'Worker Hut',
              category: 'basic_infrastructure',
              population_capacity: 5,
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

  // validate: アクションを実行する前に最低限のパラメータをチェック
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = message.content as BuildingContent;
    // "query" は string、"type" が指定されていれば 'all' | 'by_resource' | 'by_capacity' のいずれか
    if (typeof content.query !== 'string') return false;
    if (content.type && !['all', 'by_resource', 'by_capacity'].includes(content.type)) return false;
    return true;
  },

  // handler: 実際に DB をクエリして結果を返す部分
  handler: async (runtime: IAgentRuntime, message: Memory): Promise<BuildingResponse> => {
    try {
      // ユーザー入力を取得
      const content = message.content as BuildingContent;
      const { query, type, resource } = content;

      // Eliza の DB アダプタを取得
      // ここでは .query(...) が呼べると仮定 (PostgresDatabaseAdapter / SqliteDatabaseAdapter)
      const dbAdapter = runtime.databaseAdapter as any;

      let sqlResult;
      if (type === 'by_resource' && resource) {
        // 例: building_productions テーブルなどで「どの建物が指定リソースを生産するか」を検索
        sqlResult = await dbAdapter.query(
          `SELECT b.name AS building_name,
                  b.category,
                  b.population_capacity,
                  b.description
           FROM buildings b
           JOIN building_productions bp ON b.id = bp.building_id
           JOIN resources r ON bp.resource_id = r.id
           WHERE r.name = $1`,
          [resource],
        );
      } else if (type === 'by_capacity') {
        // 例: population_capacity が高い順に並べる
        sqlResult = await dbAdapter.query(
          `SELECT name AS building_name,
                  category,
                  population_capacity,
                  description
           FROM buildings
           ORDER BY population_capacity DESC`,
        );
      } else {
        // 例: 全建物を取得
        sqlResult = await dbAdapter.query(
          `SELECT name AS building_name,
                  category,
                  population_capacity,
                  description
           FROM buildings`,
        );
      }

      // クエリ結果 rows
      return {
        success: true,
        data: sqlResult.rows,
        message: 'Query executed successfully',
      };
    } catch (error) {
      // エラー時は success=false, data=[] で返す
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Query failed',
      };
    }
  },
};
