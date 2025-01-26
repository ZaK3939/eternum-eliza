import { z } from "zod";

import type{ Amount } from "@coinbase/coinbase-sdk";
import type { CdpActionResult } from "../cdp-action";
import type { TradeInputSchema } from "./input-schema";

export type TradeSchemaType = typeof TradeInputSchema;

export type TradeArgumentsType = z.infer<TradeSchemaType>;

export type TradeResultBodyType = {
  transactionHash: string;
  toAmount: Amount;
};

export type TradeActionResultType = CdpActionResult<TradeResultBodyType>; 