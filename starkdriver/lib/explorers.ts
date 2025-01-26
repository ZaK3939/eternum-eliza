import { type Coinbase } from "@coinbase/coinbase-sdk";

export type NetworkKey = (typeof Coinbase.networks)[keyof typeof Coinbase.networks];

export const EXPLORERS: Record<NetworkKey, string> = {
    "base-sepolia": "https://sepolia.basescan.org",
    "base-mainnet": "https://basescan.org",
    "polygon-mainnet": "https://polygonscan.com",
    "arbitrum-mainnet": "https://arbiscan.io",
    "ethereum-holesky": "https://holesky.etherscan.io", 
    "ethereum-mainnet": "https://etherscan.io",
    "solana-mainnet": "https://solscan.io",
    "solana-devnet": "https://solscan.io"
} as const;

export const getExplorerUrl = (network: NetworkKey) => {
    return EXPLORERS[network];
}

export const getExplorerAddressUrl = (address: string, network: NetworkKey = "base-sepolia") => {
    return `${getExplorerUrl(network)}/address/${address}`;
}

export const getExplorerTransactionUrl = (transactionHash: string, network: NetworkKey = "base-sepolia") => {
    return `${getExplorerUrl(network)}/tx/${transactionHash}`;
}