import { Connection } from '@solana/web3.js';

import { SolanaGetWalletAddressAction } from '@/aitool/solana/actions';

import { SOLANA_GET_WALLET_ADDRESS_NAME } from '@/aitool/action-names';
import { solanaTool } from '@/aitool/solana';

export const WALLET_TOOLS = {
  [`wallet-${SOLANA_GET_WALLET_ADDRESS_NAME}`]: solanaTool(
    new SolanaGetWalletAddressAction(),
    new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!),
  ),
};
