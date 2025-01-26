// @/types/index.ts もしくは適切な型定義ファイル
export interface TokenAccountsResponse {
  total: number;
  limit: number;
  cursor: string;
  token_accounts: Array<{
    mint: string;
    balance: number;
  }>;
}

// getBalances 関数の修正
export const getBalances = async (address: string): Promise<TokenAccountsResponse> => {
  const response = await fetch(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'tokens-accounts',
      method: 'getTokenAccountsByOwner',
      params: [
        address,
        {
          programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        },
        {
          encoding: 'jsonParsed',
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch token accounts');
  }

  const data = await response.json();
  console.log('data:', data);

  if (data.result) {
    return {
      total: data.result.value.length,
      limit: 1000, // デフォルト値もしくは適切な値
      cursor: '', // 必要に応じて設定
      token_accounts: data.result.value.map((account: any) => ({
        mint: account.account.data.parsed.info.mint,
        balance:
          Number(account.account.data.parsed.info.tokenAmount.amount) /
          Math.pow(10, account.account.data.parsed.info.tokenAmount.decimals),
      })),
    };
  }

  // デフォルトの空レスポンス
  return {
    total: 0,
    limit: 1000,
    cursor: '',
    token_accounts: [],
  };
};
