import { z } from "zod";

export const MintNftInputSchema = z
  .object({
    contractAddress: z.string().describe("The contract address of the NFT to mint"),
    destination: z.string().describe("The destination address that will receive the NFT"),
  })
  .strip()
  .describe("Instructions for minting an NFT"); 