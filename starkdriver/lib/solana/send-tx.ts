import { Keypair, VersionedTransaction, Connection } from "@solana/web3.js";

/**
 * Send a transaction with priority fees
 * @param agent - SolanaAgentKit instance
 * @param tx - Transaction to send
 * @param priorityLevel - Priority level for the transaction ('low', 'medium', 'high')
 * @returns Transaction ID
 */
export async function sendTx(
  connection: Connection,
  keypair: Keypair,
  tx: VersionedTransaction,
  otherKeypairs?: Keypair[]
) {
  tx.sign([keypair, ...(otherKeypairs ?? [])]);
  const txid = await connection.sendRawTransaction(tx.serialize(), {
    maxRetries: 5,
  });
  await connection.confirmTransaction(txid);
  return txid;
}
