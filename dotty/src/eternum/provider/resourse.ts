// resourceQueryProvider.ts
import { Provider, IAgentRuntime, Memory, State, IDatabaseAdapter } from '@eliza/core';
import PostgresDatabaseAdapter from '@eliza/adapter-postgres';
import { QueryResult } from 'pg';

export interface ResourceQueryParams {
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

export const resourceQueryProvider: Provider = {
  async get(runtime: IAgentRuntime, message: Memory, state?: State): Promise<ResourceQueryResult[]> {
    if (!('query' in runtime.databaseAdapter)) {
      throw new Error('Database adapter does not support query method');
    }

    const dbAdapter = runtime.databaseAdapter as IDatabaseAdapter & {
      query: <T = any>(query: string, values?: any[]) => Promise<QueryResult<T>>;
    };

    const params = message.content as unknown as ResourceQueryParams;

    const baseQuery = `
      SELECT 
        name,
        tier,
        description,
        rarity,
        value,
        ticker,
        colour
      FROM resources`;

    let whereClause = '';
    let queryParams: any[] = [];

    // クエリパラメータを抽出
    const type = params.type || 'all';

    switch (type) {
      case 'by_tier':
        if (params.tier) {
          whereClause = 'WHERE LOWER(tier) = LOWER($1)';
          queryParams = [params.tier];
        }
        break;

      case 'by_name':
        if (params.name) {
          whereClause = 'WHERE LOWER(name) = LOWER($1)';
          queryParams = [params.name];
        }
        break;

      case 'by_rarity':
        if (params.rarity !== undefined) {
          whereClause = 'WHERE rarity >= $1';
          queryParams = [params.rarity];
        }
        break;

      default:
        whereClause = '';
    }

    const orderByClause = 'ORDER BY tier, rarity ASC';
    const finalQuery = [baseQuery, whereClause, orderByClause].filter(Boolean).join(' ');

    try {
      const result = await dbAdapter.query<ResourceQueryResult>(finalQuery, queryParams);
      console.log('Resource query result:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Resource query provider error:', error);
      throw error;
    }
  },
};

export default resourceQueryProvider;
