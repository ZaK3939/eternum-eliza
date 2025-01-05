import { DirectClient } from '@elizaos/client-direct';
import {
  AgentRuntime,
  Character,
  CacheManager,
  DbCacheAdapter,
  elizaLogger,
  settings,
  stringToUuid,
} from '@elizaos/core';
import readline from 'readline';
import { character } from './character.ts';
import { getTokenForProvider, loadCharacters, parseArguments } from './config.ts';
import { DatabaseConnectionWrapper } from './common/db.ts';
import { cleanup, createAgent } from './agent.ts';
import { initializeClients, setupClientErrorHandlers } from './mangers.ts';
import { EternumClient } from './eternum/client-direct/client.ts';

async function startAgent(character: Character, eternumClient: EternumClient) {
  let dbWrapper: DatabaseConnectionWrapper | null = null;
  let runtime: AgentRuntime | null = null;
  let clients: any[] = [];

  try {
    character.id ??= stringToUuid(character.name);
    const token = getTokenForProvider(character.modelProvider, character);

    dbWrapper = new DatabaseConnectionWrapper();
    await dbWrapper.init();
    const db = dbWrapper.getAdapter();

    const cache = new CacheManager(new DbCacheAdapter(db, character.id));
    runtime = createAgent(character, db, cache, token) as AgentRuntime;

    try {
      await runtime.initialize();
      console.log('=== Available Actions ===');
      runtime.actions.forEach((action) => console.log(action.name));
    } catch (error) {
      elizaLogger.error('Failed to initialize runtime:', error);
      throw error;
    }

    const initializedClients = await initializeClients(character, runtime);
    clients = Object.values(initializedClients);
    runtime.clients = initializedClients;
    eternumClient.registerAgent(runtime);

    setupClientErrorHandlers(clients, character);

    return clients;
  } catch (error) {
    elizaLogger.error(`Error starting agent for character ${character.name}:`, error);
    await cleanup(clients, runtime, dbWrapper);
    return null;
  }
}

const startAgents = async () => {
  // const directClient = new DirectClient();
  const eternumClient = new EternumClient();
  const serverPort = parseInt(settings.SERVER_PORT || '3000');
  const args = parseArguments();

  let characters = [character];
  if (args.characters || args.character) {
    characters = await loadCharacters(args.characters || args.character);
  }

  try {
    for (const character of characters) {
      await startAgent(character, eternumClient);
    }
  } catch (error) {
    elizaLogger.error('Error starting agents:', error);
  }

  eternumClient.start(serverPort);
};

startAgents().catch((error) => {
  elizaLogger.error('Unhandled error in startAgents:', error);
  process.exit(1);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});
