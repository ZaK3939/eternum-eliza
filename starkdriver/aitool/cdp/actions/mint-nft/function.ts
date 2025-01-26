import { Wallet } from "@coinbase/coinbase-sdk";
import { MintNftArgumentsType, MintNftActionResultType } from "./types";

export async function mintNft(
  wallet: Wallet,
  args: MintNftArgumentsType
): Promise<MintNftActionResultType> {
  const mintArgs = {
    to: args.destination,
    quantity: "1",
  };

  try {
    const mintInvocation = await wallet.invokeContract({
      contractAddress: args.contractAddress,
      method: "mint",
      args: mintArgs,
    });

    const result = await mintInvocation.wait();
    const transaction = result.getTransaction();
    const transactionHash = transaction.getTransactionHash();

    if (!transactionHash) {
      throw new Error("Failed to get transaction hash");
    }

    return {
      message: `Minted NFT from contract ${args.contractAddress} to address ${args.destination} on network ${wallet.getNetworkId()}.\nTransaction hash for the mint: ${transactionHash}\nTransaction link for the mint: ${result.getTransaction().getTransactionLink()}`,
      body: {
        transactionHash
      }
    };
  } catch (error) {
    return {
      message: `Error minting NFT: ${error}`
    };
  }
} 