'use client';

import React from 'react';

import { GetWalletAddress } from './solana';

import { SearchKnowledge } from './knowledge';

import { SOLANA_GET_WALLET_ADDRESS_NAME, SEARCH_KNOWLEDGE_NAME } from '@/aitool/action-names';

import type { ToolInvocation as ToolInvocationType } from 'ai';
import { INVOKE_AGENT_NAME } from '@/aitool/invoke/actions/invoke-agent/name';
import { InvokeAgent } from './invoke';

interface Props {
  tool: ToolInvocationType;
  prevToolAgent?: string;
}

const ToolInvocation: React.FC<Props> = ({ tool, prevToolAgent }) => {
  const toolParts = tool.toolName.split('-');
  const toolName = toolParts.slice(1).join('-');

  switch (toolName) {
    case SOLANA_GET_WALLET_ADDRESS_NAME:
      return <GetWalletAddress tool={tool} prevToolAgent={prevToolAgent} />;
    case SEARCH_KNOWLEDGE_NAME:
      return <SearchKnowledge tool={tool} prevToolAgent={prevToolAgent} />;
    case INVOKE_AGENT_NAME:
      return <InvokeAgent tool={tool} prevToolAgent={prevToolAgent} />;
    default:
      return <pre className='whitespace-pre-wrap'>{JSON.stringify(tool, null, 2)}</pre>;
  }
};

export default ToolInvocation;
