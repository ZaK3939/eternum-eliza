import { z } from "zod";

import type { CdpActionResult } from "../cdp-action";
import type { RegisterBasenameInputSchema } from "./input-schema";

export type RegisterBasenameSchemaType = typeof RegisterBasenameInputSchema;

export type RegisterBasenameArgumentsType = z.infer<RegisterBasenameSchemaType>;

export type RegisterBasenameResultBodyType = {
  basename: string;
  transactionHash: string;
};

export type RegisterBasenameActionResultType = CdpActionResult<RegisterBasenameResultBodyType>; 