import { Action, Memory, IAgentRuntime } from '@ai16z/eliza';
import { BuildingContent, BuildingResponse } from '../../common/types.ts';
import PostgresDatabaseAdapter from '@ai16z/adapter-postgres';

export const buildingAction: Action = {
  name: 'QUERY_ETERNUM_BUILDINGS',
  description: 'Queries building information from Eternum database',
  similes: [
    'GET_BUILDINGS',
    'SEARCH_BUILDINGS',
    'FIND_BUILDINGS',
    'QUERY_BUILDINGS',
    'CHECK_BUILDINGS',
    'LOOKUP_BUILDINGS',
    'CONSULT_BUILDING_RECORDS',
    'SEARCH_BUILDING_DATABASE',
  ],
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
          text: 'Here are all the buildings in our records:',
          action: 'QUERY_ETERNUM_BUILDINGS',
          data: [
            {
              building_name: 'Farm',
              category: 'production',
              population_capacity: 1,
              description: 'Produces Wheat',
            },
            {
              building_name: 'Worker Hut',
              category: 'basic_infrastructure',
              population_capacity: 5,
              description: 'Basic population housing',
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
          text: 'The Farm is our primary facility for Wheat production.',
          action: 'QUERY_ETERNUM_BUILDINGS',
          data: [
            {
              building_name: 'Farm',
              category: 'production',
              population_capacity: 1,
              description: 'Produces Wheat',
              resource_name: 'Wheat',
            },
          ],
        },
      },
    ],
    [
      {
        user: '{{user1}}',
        content: {
          query: 'Tell me about Fish production',
          type: 'by_resource',
          resource: 'Fish',
        } as BuildingContent,
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'The Fishing Village is where we produce Fish.',
          action: 'QUERY_ETERNUM_BUILDINGS',
          data: [
            {
              building_name: 'Fishing Village',
              category: 'production',
              population_capacity: 1,
              description: 'Produces Fish',
              resource_name: 'Fish',
            },
          ],
        },
      },
    ],
  ],
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const normalizedAction = normalizeAction(message);
    if (!normalizedAction) return false;

    const content = message.content as BuildingContent;

    // 基本的な内容の検証
    if (!content.text) return false;

    // クエリタイプの検証
    if (content.type && !['all', 'by_resource', 'by_capacity'].includes(content.type)) {
      return false;
    }

    // リソース指定の検証
    if (content.type === 'by_resource' && !content.resource) {
      return false;
    }

    return true;
  },

  handler: async (runtime: IAgentRuntime, message: Memory): Promise<void> => {
    try {
      console.log('Processing building query:', message);

      const content = message.content as BuildingContent;
      let queryType = content.type;
      let resource = content.resource;

      // テキストからクエリタイプとリソースを推測
      if (!queryType) {
        const text = content.text.toLowerCase();
        const resourceKeywords = ['wheat', 'fish', 'wood', 'stone', 'coal', 'donkeys'];
        const foundResource = resourceKeywords.find((r) => text.includes(r.toLowerCase()));

        if (foundResource) {
          queryType = 'by_resource';
          resource = foundResource;
        } else {
          queryType = 'all';
        }
      }

      // データベースクエリの実行
      const dbAdapter = runtime.databaseAdapter as PostgresDatabaseAdapter;
      let sqlResult;

      if (queryType === 'by_resource' && resource) {
        console.log('Executing resource-specific query for:', resource);
        sqlResult = await dbAdapter.query(
          `SELECT DISTINCT 
            b.name as building_name,
            b.category,
            b.population_capacity,
            b.description,
            r.name as resource_name
           FROM buildings b
           JOIN building_productions bp ON b.id = bp.building_id
           JOIN resources r ON bp.resource_id = r.id
           WHERE LOWER(r.name) = LOWER($1)`,
          [resource],
        );
        console.log('SQL result:', sqlResult);
      } else {
        console.log('Executing general buildings query');
        sqlResult = await dbAdapter.query(
          `SELECT 
            name as building_name,
            category,
            population_capacity,
            description
           FROM buildings`,
        );
      }

      // SQL結果からレスポンステキストを生成
      const responseText = generateDetailedResponse(sqlResult.rows, resource);

      // actionResponseの設定
      message.content.actionResponse = {
        success: true,
        data: sqlResult.rows,
        message: `Found ${sqlResult.rows.length} buildings related to ${resource || 'your query'}`,
        action: 'QUERY_ETERNUM_BUILDINGS',
        text: responseText,
        sqlResult: {
          rowCount: sqlResult.rowCount,
          rows: sqlResult.rows,
        },
      };
    } catch (error) {
      console.error('Building query error:', error);
      message.content.actionResponse = {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Query failed',
        action: 'QUERY_ETERNUM_BUILDINGS',
        text: "I apologize, but I'm having trouble accessing the building records at the moment.",
        sqlResult: null,
      };
    }
  },
};

function generateDetailedResponse(buildings: any[], resource?: string): string {
  if (!buildings || buildings.length === 0) {
    return resource
      ? `I apologize, but I couldn't find any buildings that produce ${resource}.`
      : `I apologize, but I couldn't find any matching buildings.`;
  }

  const building = buildings[0];
  let response = '';

  if (resource) {
    response =
      `The ${building.building_name} is our primary facility for ${building.resource_name} production. ` +
      `It requires ${building.population_capacity} worker${building.population_capacity > 1 ? 's' : ''} ` +
      `and ${building.description.toLowerCase()}. `;

    // 追加の建物情報がある場合
    if (buildings.length > 1) {
      response += `\n\nThere are also ${buildings.length - 1} other building(s) related to ${resource} production. `;
    }
  } else {
    response =
      `We have ${buildings.length} different types of buildings in our records. ` +
      `The ${building.building_name} is one example, requiring ${building.population_capacity} worker(s). `;
  }

  response += `\nWould you like to know more specific details about the building requirements or production capabilities?`;

  return response;
}

const normalizeAction = (message: Memory): string | null => {
  const content = message.content as BuildingContent;
  const text = content.text.toLowerCase();

  // リソース生産に関するキーワード
  const productionKeywords = ['produce', 'production', 'creates', 'generates', 'makes'];

  // 建物に関するキーワード
  const buildingKeywords = ['building', 'structure', 'facility', 'construction'];

  // リソースキーワード
  const resourceKeywords = ['wheat', 'fish', 'wood', 'stone', 'coal', 'donkeys'];

  // クエリタイプの判定
  if (content.type === 'by_resource' && content.resource) {
    return 'QUERY_ETERNUM_BUILDINGS';
  }

  // テキストベースの判定
  const hasProductionKeyword = productionKeywords.some((keyword) => text.includes(keyword));
  const hasBuildingKeyword = buildingKeywords.some((keyword) => text.includes(keyword));
  const hasResourceKeyword = resourceKeywords.some((keyword) => text.includes(keyword));

  if ((hasProductionKeyword || hasBuildingKeyword) && hasResourceKeyword) {
    return 'QUERY_ETERNUM_BUILDINGS';
  }

  return null;
};

export default buildingAction;
