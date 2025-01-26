import { z } from "zod";
import { Amount } from "@coinbase/coinbase-sdk";

export const TransferInput = z
  .object({
    amount: z.custom<Amount>().describe("The amount of the asset to transfer"),
    assetId: z.string().describe("The asset ID to transfer"),
    destination: z.string().describe("The destination to transfer the funds"),
    gasless: z.boolean().default(false).describe("Whether to do a gasless transfer"),
  })
  .strip()
  .describe("Instructions for transferring assets"); 