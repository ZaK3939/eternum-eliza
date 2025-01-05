import express, { Router, Request, Response } from 'express';
import { AgentRuntime, elizaLogger, getEnvVariable } from '@elizaos/core';
import { EternumClient } from './client.ts';

export function createApiRouter(agents: Map<string, AgentRuntime>, eternumClient: EternumClient): Router {
  const router = Router();

  router.use(
    express.json({
      limit: getEnvVariable('EXPRESS_MAX_PAYLOAD') || '100kb',
    }),
  );

  // Basic health check endpoint
  router.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Eternum API');
  });

  // List all agents
  router.get('/agents', (req: Request, res: Response) => {
    const agentsList = Array.from(agents.values()).map((agent) => ({
      id: agent.agentId,
      name: agent.character.name,
    }));
    res.json({ agents: agentsList });
  });

  // Get specific agent details
  router.get('/agents/:agentId', (req: Request, res: Response) => {
    const agentId = req.params.agentId;
    const agent = agents.get(agentId);

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    res.json({
      id: agent.agentId,
      character: agent.character,
    });
  });

  return router;
}
