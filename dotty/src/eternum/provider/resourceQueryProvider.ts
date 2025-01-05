// resourceQueryProvider.ts
import { Provider, IAgentRuntime, Memory, State, Content } from '@elizaos/core';
import PostgresDatabaseAdapter from '@elizaos/adapter-postgres';

export interface ResourceQueryParams extends Content {
  type: 'all' | 'by_tier' | 'by_name' | 'by_rarity';
  tier?: string;
  name?: string;
  rarity?: number;
}

export interface ResourceQueryResult {
  name: string;
  tier: string;
  description: string;
  rarity: string;
  value: number;
  ticker: string;
  colour: string;
}

export const ResourceQueryProvider: Provider = {
  async get(runtime: IAgentRuntime, message: Memory, state?: State): Promise<ResourceQueryResult[]> {
    const dbAdapter = runtime.databaseAdapter as PostgresDatabaseAdapter;
    if (!dbAdapter || typeof dbAdapter.query !== 'function') {
      throw new Error('Database adapter is not a valid PostgresDatabaseAdapter');
    }

    // message.content は ResourceQueryParams の形を想定
    const params = message.content as ResourceQueryParams;
    const { query, queryParams } = buildResourceQuery(params);

    try {
      const result = await dbAdapter.query<ResourceQueryResult>(query, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error executing resource query:', error);
      throw new Error('Failed to execute resource query');
    }
  },
};

/**
 * Constructs the SQL query and parameters based on input params
 * @param params ResourceQueryParams
 * @returns Query and query parameters
 */
function buildResourceQuery(params: ResourceQueryParams): { query: string; queryParams: any[] } {
  const baseQuery = `
    SELECT 
      name,
      tier,
      description,
      rarity,
      value,
      ticker,
      colour
    FROM resources
  `;

  let whereClause = '';
  const queryParams: any[] = [];

  switch (params.type) {
    case 'by_tier':
      if (params.tier) {
        whereClause = 'WHERE LOWER(tier) = LOWER($1)';
        queryParams.push(params.tier);
      }
      break;

    case 'by_name':
      if (params.name) {
        whereClause = 'WHERE LOWER(name) = LOWER($1)';
        queryParams.push(params.name);
      }
      break;

    case 'by_rarity':
      if (params.rarity !== undefined) {
        whereClause = 'WHERE rarity >= $1';
        queryParams.push(params.rarity);
      }
      break;

    case 'all':
    default:
      // 'all' or no filter
      whereClause = '';
      break;
  }

  const orderByClause = 'ORDER BY tier, rarity ASC';
  const finalQuery = [baseQuery.trim(), whereClause, orderByClause].filter(Boolean).join(' ');

  return {
    query: finalQuery,
    queryParams,
  };
}

export default ResourceQueryProvider;
