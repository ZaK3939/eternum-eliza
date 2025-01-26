import { z } from "zod";

export const GetBalanceInputSchema = z
  .object({
    assetId: z.string().describe("The asset ID to get the balance for"),
  })
  .strip()
  .describe("Instructions for getting wallet balance");