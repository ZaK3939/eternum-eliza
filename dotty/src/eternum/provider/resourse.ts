// resourceQueryProvider.ts
import { Provider, IAgentRuntime, Memory, State } from '@ai16z/eliza';
import PostgresDatabaseAdapter from '@ai16z/adapter-postgres';

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
    const dbAdapter = runtime.databaseAdapter as PostgresDatabaseAdapter;
    const content = message.content;

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

    // メッセージのコンテンツからクエリパラメータを抽出
    const type = content.type || 'all';

    switch (type) {
      case 'by_tier':
        whereClause = 'WHERE LOWER(tier) = LOWER($1)';
        queryParams = [content.tier];
        break;

      case 'by_name':
        whereClause = 'WHERE LOWER(name) = LOWER($1)';
        queryParams = [content.name];
        break;

      case 'by_rarity':
        whereClause = 'WHERE rarity >= $1';
        queryParams = [content.rarity];
        break;

      default:
        whereClause = '';
    }

    const orderByClause = 'ORDER BY tier, rarity ASC';
    const finalQuery = [baseQuery, whereClause, orderByClause].filter(Boolean).join(' ');

    try {
      const result = await dbAdapter.query(finalQuery, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Resource query provider error:', error);
      throw error;
    }
  },
};

export default resourceQueryProvider;
