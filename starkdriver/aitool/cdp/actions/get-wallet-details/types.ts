import { z } from "zod";

import type { CdpActionResult } from "../cdp-action";
import type { GetWalletDetailsInputSchema } from "./input-schema";

export type GetWalletDetailsSchemaType = typeof GetWalletDetailsInputSchema;

export type GetWalletDetailsArgumentsType = z.infer<GetWalletDetailsSchemaType>;

export type GetWalletDetailsResultBodyType = {
  address: string;
};

export type GetWalletDetailsActionResultType = CdpActionResult<GetWalletDetailsResultBodyType>; 