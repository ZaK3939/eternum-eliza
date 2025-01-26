import { TRANSFER_NAME } from "./name";
import { TRANSFER_PROMPT } from "./prompt";
import { TransferInput } from "./input-schema";
import { transfer } from "./function";

import { CdpAction } from "../cdp-action";
import type { TransferSchemaType, TransferResultBodyType } from "./types";

export class TransferAction implements CdpAction<TransferSchemaType, TransferResultBodyType> {
  public name = TRANSFER_NAME;
  public description = TRANSFER_PROMPT;
  public argsSchema = TransferInput;
  public func = transfer;
} 