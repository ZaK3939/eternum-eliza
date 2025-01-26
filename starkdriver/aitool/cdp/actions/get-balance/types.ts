import { z } from "zod";

import Decimal from "decimal.js";

import type { CdpActionResult } from "../cdp-action";
import type { GetBalanceInputSchema } from "./input-schema";

export type GetBalanceSchemaType = typeof GetBalanceInputSchema;

export type GetBalanceArgumentsType = z.infer<GetBalanceSchemaType>;

export type GetBalanceResultBodyType = {
    balance: Decimal;
}

export type GetBalanceActionResultType = CdpActionResult<GetBalanceResultBodyType>; 