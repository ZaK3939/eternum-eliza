import { z } from "zod";

import type { CdpActionResult } from "../cdp-action";
import type { TransferInput } from "./input-schema";

export type TransferSchemaType = typeof TransferInput;

export type TransferArgumentsType = z.infer<TransferSchemaType>;

export type TransferResultBodyType = {
  transactionHash: string;
  symbol: string;
};

export type TransferActionResultType = CdpActionResult<TransferResultBodyType>; 