import { z } from "zod";
import { Amount } from "@coinbase/coinbase-sdk";

export const TradeInputSchema = z
  .object({
    amount: z.custom<Amount>().describe("The amount of the from asset to trade"),
    fromAssetId: z.string().describe("The from asset ID to trade"),
    toAssetId: z.string().describe("The to asset ID to receive from the trade"),
  })
  .strip()
  .describe("Instructions for trading assets"); 