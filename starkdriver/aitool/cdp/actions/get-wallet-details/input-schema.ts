import { z } from "zod";

export const GetWalletDetailsInputSchema = z
  .object({})
  .strip()
  .describe("Instructions for getting wallet details"); 