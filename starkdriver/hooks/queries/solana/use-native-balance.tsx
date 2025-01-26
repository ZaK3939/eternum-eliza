'use client';

import useSWR from 'swr';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export const useNativeBalance = (address: string) => {
  const { data, isLoading, error, mutate } = useSWR(
    address ? `native-balance/${address}` : null,
    async () => {
      try {
        // 直接エンドポイントを指定
        const connection = new Connection('https://api.devnet.solana.com', {
          commitment: 'processed',
          wsEndpoint: 'wss://api.devnet.solana.com/',
          httpHeaders: { 'Content-Type': 'application/json' },
        });

        const pubKey = new PublicKey(address);

        // getParsedAccountInfo を使用して詳細情報を取得
        const accountInfo = await connection.getParsedAccountInfo(pubKey);

        if (accountInfo.value === null) {
          return 0;
        }

        // lamports プロパティから残高を取得
        const balance = accountInfo.value.lamports ?? 0;
        return balance / LAMPORTS_PER_SOL;
      } catch (error) {
        console.error('Error fetching SOL balance:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to fetch balance');
      }
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10000,
    },
  );

  return {
    data: data ?? 0,
    isLoading,
    error,
    mutate,
  };
};
