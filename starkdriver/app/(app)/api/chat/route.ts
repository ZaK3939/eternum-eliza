import { NextRequest } from 'next/server';

import { streamText } from 'ai';

import { Coinbase } from '@coinbase/coinbase-sdk';

import { openai } from '@ai-sdk/openai';

import { CdpAgentkit, cdpTools } from '@/aitool';

export const POST = async (req: NextRequest) => {
  try {
    // リクエストの検証を追加
    if (!req.body) {
      return new Response(JSON.stringify({ error: 'No request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages } = await req.json();

    // 必須の環境変数チェック
    if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_KEY_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const agentkit = await CdpAgentkit.configureWithWallet({
      networkId: Coinbase.networks.BaseSepolia,
      cdpApiKeyName: process.env.CDP_API_KEY_NAME,
      cdpApiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
    });

    // streamText の結果を直接返す
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      tools: cdpTools(agentkit),
      messages,
    });

    // 明示的にストリームを返す
    return new Response(result.toDataStream(), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
