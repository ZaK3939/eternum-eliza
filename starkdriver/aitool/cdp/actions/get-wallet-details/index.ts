import { CdpAction } from "../cdp-action";
import { GET_WALLET_DETAILS_NAME } from "./name";
import { GET_WALLET_DETAILS_PROMPT } from "./prompt";
import { GetWalletDetailsInputSchema } from "./input-schema";
import { GetWalletDetailsResultBodyType } from "./types";
import { getWalletDetails } from "./function";

export class GetWalletDetailsAction implements CdpAction<typeof GetWalletDetailsInputSchema, GetWalletDetailsResultBodyType> {
  public name = GET_WALLET_DETAILS_NAME;
  public description = GET_WALLET_DETAILS_PROMPT;
  public argsSchema = GetWalletDetailsInputSchema;
  public func = getWalletDetails;
} 