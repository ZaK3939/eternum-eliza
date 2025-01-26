import React from 'react';

import AgentHeader from './agent-header';

import { Agent } from '../_types/agent';
import SampleQueries from './sample-queries';

interface Props {
  agent: Agent;
}

export const AgentPage: React.FC<Props> = ({ agent }) => {
  return (
    <div className='h-full w-full max-w-2xl mx-auto flex flex-col gap-4'>
      <AgentHeader {...agent.info} />
      <SampleQueries sampleQueries={agent.sampleQueries} />
    </div>
  );
};
