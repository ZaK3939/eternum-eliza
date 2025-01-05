import { AutoClientInterface } from '@elizaos/client-auto';
import { TelegramClientInterface } from '@elizaos/client-telegram';
import { Character, Clients, IAgentRuntime, elizaLogger } from '@elizaos/core';

export async function initializeClients(character: Character, runtime: IAgentRuntime) {
  const clients: Record<string, any> = {};
  const clientTypes: string[] = character.clients?.map((str) => str.toLowerCase()) || [];
  elizaLogger.log('initializeClients', clientTypes, 'for', character.name);

  if (clientTypes.includes(Clients.DIRECT)) {
    const autoClient = await AutoClientInterface.start(runtime);
    if (autoClient) clients.auto = autoClient;
  }

  if (clientTypes.includes(Clients.TELEGRAM)) {
    const telegramClient = await TelegramClientInterface.start(runtime);
    if (telegramClient) clients.telegram = telegramClient;
  }

  elizaLogger.log('client keys', Object.keys(clients));

  if (character.plugins?.length > 0) {
    for (const plugin of character.plugins) {
      if (plugin.clients) {
        for (const client of plugin.clients) {
          clients.push(await client.start(runtime));
        }
      }
    }
  }

  return clients;
}

export function setupClientErrorHandlers(clients: any[], character: Character) {
  clients.forEach((client) => {
    if (client && client.on) {
      client.on('error', async (error) => {
        elizaLogger.error(`Client error for ${character.name}:`, error);
        try {
          await client.reconnect?.();
        } catch (reconnectError) {
          elizaLogger.error(`Failed to reconnect client for ${character.name}:`, reconnectError);
        }
      });
    }
  });
}
