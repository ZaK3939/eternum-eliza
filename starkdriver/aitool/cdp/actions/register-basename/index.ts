import { CdpAction } from "../cdp-action";

import { REGISTER_BASENAME_NAME } from "./name";
import { REGISTER_BASENAME_PROMPT } from "./prompt";
import { RegisterBasenameInputSchema } from "./input-schema";
import { registerBasename } from "./function";
import { RegisterBasenameSchemaType, RegisterBasenameResultBodyType } from "./types";

export class RegisterBasenameAction implements CdpAction<RegisterBasenameSchemaType, RegisterBasenameResultBodyType> {
  public name = REGISTER_BASENAME_NAME;
  public description = REGISTER_BASENAME_PROMPT;
  public argsSchema = RegisterBasenameInputSchema;
  public func = registerBasename;
} 