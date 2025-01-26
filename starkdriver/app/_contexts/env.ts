import { z } from 'zod';

const processEnv = {
  NEXT_PUBLIC_MASTER_ADDRESS: process.env.NEXT_PUBLIC_MASTER_ADDRESS,
  NEXT_PUBLIC_MASTER_PRIVATE_KEY: process.env.NEXT_PUBLIC_MASTER_PRIVATE_KEY,
  NEXT_PUBLIC_WORLD_ADDRESS: process.env.NEXT_PUBLIC_WORLD_ADDRESS,
  NEXT_PUBLIC_ACCOUNT_CLASS_HASH: process.env.NEXT_PUBLIC_ACCOUNT_CLASS_HASH,
  NEXT_PUBLIC_FEE_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_FEE_TOKEN_ADDRESS,
  NEXT_PUBLIC_CLIENT_FEE_RECIPIENT: process.env.NEXT_PUBLIC_CLIENT_FEE_RECIPIENT,
  NEXT_PUBLIC_SEASON_PASS_ADDRESS: process.env.NEXT_PUBLIC_SEASON_PASS_ADDRESS,
  NEXT_PUBLIC_REALMS_ADDRESS: process.env.NEXT_PUBLIC_REALMS_ADDRESS,
  NEXT_PUBLIC_LORDS_ADDRESS: process.env.NEXT_PUBLIC_LORDS_ADDRESS,
  NEXT_PUBLIC_TORII: process.env.NEXT_PUBLIC_TORII,
  NEXT_PUBLIC_NODE_URL: process.env.NEXT_PUBLIC_NODE_URL,
  NEXT_PUBLIC_TORII_RELAY: process.env.NEXT_PUBLIC_TORII_RELAY,
  NEXT_PUBLIC_DEV: process.env.NEXT_PUBLIC_DEV,
  NEXT_PUBLIC_SHOW_FPS: process.env.NEXT_PUBLIC_SHOW_FPS,
  NEXT_PUBLIC_GRAPHICS_DEV: process.env.NEXT_PUBLIC_GRAPHICS_DEV,
  NEXT_PUBLIC_GAME_VERSION: process.env.NEXT_PUBLIC_GAME_VERSION,
  NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN,
  NEXT_PUBLIC_CONSTRUCTION_FLAG: process.env.NEXT_PUBLIC_CONSTRUCTION_FLAG,
  NEXT_PUBLIC_HIDE_THREEJS_MENU: process.env.NEXT_PUBLIC_HIDE_THREEJS_MENU,
  NEXT_PUBLIC_VRF_PROVIDER_ADDRESS: process.env.NEXT_PUBLIC_VRF_PROVIDER_ADDRESS,
  NEXT_PUBLIC_ARK_MARKETPLACE_API: process.env.NEXT_PUBLIC_ARK_MARKETPLACE_API,
  NEXT_PUBLIC_IMAGE_CDN_URL: process.env.NEXT_PUBLIC_IMAGE_CDN_URL,
  NEXT_PUBLIC_IMAGE_PROXY_URL: process.env.NEXT_PUBLIC_IMAGE_PROXY_URL,
  NEXT_PUBLIC_IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY,
  NEXT_PUBLIC_SLOT: process.env.NEXT_PUBLIC_SLOT,
  NEXT_PUBLIC_SOCIAL_LINK: process.env.NEXT_PUBLIC_SOCIAL_LINK,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
} as const;

const envSchema = z.object({
  NEXT_PUBLIC_MASTER_ADDRESS: z.string().startsWith('0x'),
  NEXT_PUBLIC_MASTER_PRIVATE_KEY: z.string().startsWith('0x'),
  NEXT_PUBLIC_WORLD_ADDRESS: z.string().startsWith('0x'),
  NEXT_PUBLIC_ACCOUNT_CLASS_HASH: z.string().startsWith('0x'),
  NEXT_PUBLIC_FEE_TOKEN_ADDRESS: z.string().startsWith('0x'),
  NEXT_PUBLIC_CLIENT_FEE_RECIPIENT: z.string().startsWith('0x'),
  NEXT_PUBLIC_SEASON_PASS_ADDRESS: z.string().startsWith('0x'),
  NEXT_PUBLIC_REALMS_ADDRESS: z.string().startsWith('0x'),
  NEXT_PUBLIC_LORDS_ADDRESS: z.string().startsWith('0x'),
  NEXT_PUBLIC_TORII: z.string().url(),
  NEXT_PUBLIC_NODE_URL: z.string().url(),
  NEXT_PUBLIC_TORII_RELAY: z.string(),
  NEXT_PUBLIC_DEV: z.coerce.boolean(),
  NEXT_PUBLIC_SHOW_FPS: z.coerce.boolean(),
  NEXT_PUBLIC_GRAPHICS_DEV: z.coerce.boolean(),
  NEXT_PUBLIC_GAME_VERSION: z.string(),
  NEXT_PUBLIC_CHAIN: z.enum(['sepolia', 'mainnet', 'testnet', 'local']),
  NEXT_PUBLIC_CONSTRUCTION_FLAG: z.coerce.boolean(),
  NEXT_PUBLIC_HIDE_THREEJS_MENU: z.coerce.boolean(),
  NEXT_PUBLIC_VRF_PROVIDER_ADDRESS: z.string().startsWith('0x'),
  NEXT_PUBLIC_ARK_MARKETPLACE_API: z.string().url(),
  NEXT_PUBLIC_IMAGE_CDN_URL: z.string().url(),
  NEXT_PUBLIC_IMAGE_PROXY_URL: z.string().url(),
  NEXT_PUBLIC_IPFS_GATEWAY: z.string().url(),
  NEXT_PUBLIC_SLOT: z.string(),
  NEXT_PUBLIC_SOCIAL_LINK: z.string().url(),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
});

const env = envSchema.parse(processEnv);

export { env };
export type Env = z.infer<typeof envSchema>;
