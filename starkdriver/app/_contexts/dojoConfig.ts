// dojoConfig.ts
// ※ "use client" は付けません。
// ここではトップレベルで createDojoConfig() を呼ばず、
// 環境変数・manifestの組み立てのみ行う関数をエクスポートします。

import devManifest from './manifest/manifest_dev.json';
import mainnetManifest from './manifest/manifest_mainnet.json';
import productionManifest from './manifest/manifest_prod.json';

import { env } from './env';

export function getRawDojoConfig() {
  const {
    NEXT_PUBLIC_NODE_URL,
    NEXT_PUBLIC_TORII,
    NEXT_PUBLIC_TORII_RELAY,
    NEXT_PUBLIC_MASTER_ADDRESS,
    NEXT_PUBLIC_MASTER_PRIVATE_KEY,
    NEXT_PUBLIC_ACCOUNT_CLASS_HASH,
    NEXT_PUBLIC_DEV,
    NEXT_PUBLIC_FEE_TOKEN_ADDRESS,
    NEXT_PUBLIC_CHAIN,
  } = env;

  // manifest の切り替え
  let manifest = NEXT_PUBLIC_DEV === true ? devManifest : productionManifest;
  manifest = NEXT_PUBLIC_CHAIN === 'mainnet' ? mainnetManifest : manifest;

  return {
    rpcUrl: NEXT_PUBLIC_NODE_URL,
    toriiUrl: NEXT_PUBLIC_TORII,
    relayUrl: NEXT_PUBLIC_TORII_RELAY,
    masterAddress: NEXT_PUBLIC_MASTER_ADDRESS,
    masterPrivateKey: NEXT_PUBLIC_MASTER_PRIVATE_KEY,
    accountClassHash:
      NEXT_PUBLIC_ACCOUNT_CLASS_HASH || '0x07dc7899aa655b0aae51eadff6d801a58e97dd99cf4666ee59e704249e51adf2',
    feeTokenAddress: NEXT_PUBLIC_FEE_TOKEN_ADDRESS || '0x0',
    manifest,
  };
}
