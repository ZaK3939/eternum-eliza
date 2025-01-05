import { AgentRuntime, Character, ICacheManager, IDatabaseAdapter } from '@elizaos/core';
import { bootstrapPlugin } from '@elizaos/plugin-bootstrap';
import { createNodePlugin } from '@elizaos/plugin-node';
import eternumPlugin from './eternum/index.ts';

export function createAgent(character: Character, db: IDatabaseAdapter, cache: ICacheManager, token: string) {
  const nodePlugin = createNodePlugin();

  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    character,
    plugins: [bootstrapPlugin, nodePlugin, eternumPlugin].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    evaluators: [],
    cacheManager: cache,
  });
}

export async function cleanup(clients: any[], runtime: AgentRuntime | null, dbWrapper: any | null) {
  try {
    for (const client of clients) {
      try {
        await client?.cleanup?.();
      } catch (error) {
        console.error('Error cleaning up client:', error);
      }
    }

    if (runtime) {
      console.log('Runtime cleanup skipped - no cleanup method available');
    }

    if (dbWrapper) {
      await dbWrapper.cleanup();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}
