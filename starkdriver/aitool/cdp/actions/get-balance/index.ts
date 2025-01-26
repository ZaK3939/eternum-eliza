import { CdpAction } from "../cdp-action";
import { GET_BALANCE_NAME } from "./name";
import { GET_BALANCE_PROMPT } from "./prompt";
import { GetBalanceInputSchema } from "./input-schema";
import { GetBalanceResultBodyType } from "./types";
import { getBalance } from "./function";

/**
 * Get wallet balance action.
 */
export class GetBalanceAction implements CdpAction<typeof GetBalanceInputSchema, GetBalanceResultBodyType> {
  public name = GET_BALANCE_NAME;
  public description = GET_BALANCE_PROMPT;
  public argsSchema = GetBalanceInputSchema;
  public func = getBalance;
}