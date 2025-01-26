import { z } from "zod";

import type { GetWalletAddressInputSchema } from "./input-schema";
import type { SolanaActionResult } from "../solana-action";

export type GetWalletAddressSchemaType = typeof GetWalletAddressInputSchema;

export type GetWalletAddressArgumentsType = z.infer<GetWalletAddressSchemaType>;

export type GetWalletAddressResultBodyType = {
    address: string;
} 

export type GetWalletAddressResultType = SolanaActionResult<GetWalletAddressResultBodyType>;