import { TRADE_NAME } from "./name";
import { TRADE_PROMPT } from "./prompt";
import { TradeInputSchema } from "./input-schema";
import { trade } from "./function";

import type { CdpAction } from "../cdp-action";
import type { TradeSchemaType, TradeResultBodyType } from "./types";

export class TradeAction implements CdpAction<TradeSchemaType, TradeResultBodyType> {
  public name = TRADE_NAME;
  public description = TRADE_PROMPT;
  public argsSchema = TradeInputSchema;
  public func = trade;
} 