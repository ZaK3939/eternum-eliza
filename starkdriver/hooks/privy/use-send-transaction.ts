import { Connection, VersionedTransaction, AddressLookupTableAccount, TransactionMessage } from "@solana/web3.js";

import { useSolanaWallets } from "@privy-io/react-auth/solana";

export const useSendTransaction = () => {

    const { wallets } = useSolanaWallets();

    const sendTransaction = async (transaction: VersionedTransaction) => {
        if(!wallets.length) throw new Error("No wallets found");

        const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);

        return wallets[0].sendTransaction(transaction, connection, {
            skipPreflight: true,
        });
    }

    return {
        sendTransaction
    }
}