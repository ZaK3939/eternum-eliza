import { Action, Content, IAgentRuntime, Memory } from '@ai16z/eliza';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface BuildingContent extends Content {
  query: string;
  type?: 'all' | 'by_resource' | 'by_capacity';
  resource?: string;
}

interface BuildingResponse {
  success: boolean;
  data: any[];
  message: string;
}

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
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = message.content as BuildingContent;
    return (
      typeof content.query === 'string' &&
      (!content.type || ['all', 'by_resource', 'by_capacity'].includes(content.type))
    );
  },
  handler: async (runtime: IAgentRuntime, message: Memory): Promise<BuildingResponse> => {
    try {
      const content = message.content as BuildingContent;
      let result;

      switch (content.type) {
        case 'by_resource':
          result = await pool.query('SELECT building_name FROM building_details WHERE $1 = ANY(produces)', [
            content.resource,
          ]);
          break;
        case 'by_capacity':
          result = await pool.query(
            'SELECT name, population_capacity FROM buildings ORDER BY population_capacity DESC',
          );
          break;
        default:
          result = await pool.query('SELECT * FROM building_details');
      }

      return {
        success: true,
        data: result.rows,
        message: 'Query executed successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Query failed',
      };
    }
  },
};
