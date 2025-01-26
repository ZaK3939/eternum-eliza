import { Edge, Node } from '@xyflow/react';

import { IconName } from '@/types';

export type AgentInfo = {
  name: string;
  icon: IconName;
  objective: string;
};

export type AgentGraph = {
  nodes: Node[];
  edges: Edge[];
};

export type Agent = {
  info: AgentInfo;
  sampleQueries: string[];
};
