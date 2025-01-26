import { z } from "zod";

import type { CdpActionResult } from "../cdp-action";
import type { MintNftInputSchema } from "./input-schema";

export type MintNftSchemaType = typeof MintNftInputSchema;

export type MintNftArgumentsType = z.infer<MintNftSchemaType>;

export type MintNftResultBodyType = {
    transactionHash: string;
}

export type MintNftActionResultType = CdpActionResult<MintNftResultBodyType>; 