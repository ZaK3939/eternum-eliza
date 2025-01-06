import express, { Application } from 'express';
import { elizaLogger } from '@elizaos/core';
import { IAgentRuntime, AgentRuntime, Client } from '@elizaos/core';
// import { createApiRouter } from './api.ts';
import { createMessageHandler } from './message.ts';
import { settings } from '@elizaos/core';

export class EternumClient {
  public app: Application;
  private agents: Map<string, AgentRuntime>;
  private server: any;

  constructor() {
    elizaLogger.log('EternumClient constructor');
    this.app = express();
    this.agents = new Map();

    // Basic middleware setup
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Setup routes
    this.setupRoutes();
  }

  private setupRoutes() {
    // API routes setup
    // const apiRouter = createApiRouter(this.agents, this);
    // this.app.use('/api', apiRouter);

    // Message handling routes
    const messageRouter = createMessageHandler(this.agents);
    this.app.use('/eternum', messageRouter);
  }

  public registerAgent(runtime: AgentRuntime) {
    this.agents.set(runtime.agentId, runtime);
  }

  public unregisterAgent(runtime: AgentRuntime) {
    this.agents.delete(runtime.agentId);
  }

  public getAgent(agentId: string): AgentRuntime | undefined {
    let runtime = this.agents.get(agentId);

    if (!runtime) {
      runtime = Array.from(this.agents.values()).find((a) => a.character.name.toLowerCase() === agentId.toLowerCase());
    }

    return runtime;
  }

  public start(port: number) {
    this.server = this.app.listen(port, () => {
      elizaLogger.success(
        `Eternum API bound to 0.0.0.0:${port}. If running locally, access it at http://localhost:${port}.`,
      );
    });

    this.setupGracefulShutdown();
  }

  private setupGracefulShutdown() {
    const gracefulShutdown = () => {
      elizaLogger.log('Received shutdown signal, closing server...');
      this.server.close(() => {
        elizaLogger.success('Server closed successfully');
        process.exit(0);
      });

      setTimeout(() => {
        elizaLogger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  }

  public stop() {
    if (this.server) {
      this.server.close(() => {
        elizaLogger.success('Server stopped');
      });
    }
  }
}

export const EternumClientInterface: Client = {
  start: async (_runtime: IAgentRuntime) => {
    elizaLogger.log('EternumClientInterface start');
    const client = new EternumClient();
    const serverPort = parseInt(settings.SERVER_PORT || '3000');
    client.start(serverPort);
    return client;
  },
  stop: async (_runtime: IAgentRuntime, client?: Client) => {
    if (client instanceof EternumClient) {
      client.stop();
    }
  },
};

export default EternumClientInterface;
