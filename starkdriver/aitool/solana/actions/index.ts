import { SolanaGetWalletAddressAction } from './get-wallet-address';

import type { SolanaAction, SolanaActionSchemaAny } from './solana-action';

export function getAllSolanaActions(): SolanaAction<SolanaActionSchemaAny, any>[] {
  return [new SolanaGetWalletAddressAction()];
}

export const SOLANA_ACTIONS = getAllSolanaActions();

export * from './types';
export * from './solana-action';
export * from './get-wallet-address';
