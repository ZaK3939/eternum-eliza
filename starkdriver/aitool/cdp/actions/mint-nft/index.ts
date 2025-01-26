import { CdpAction } from "../cdp-action";

import { MINT_NFT_NAME } from "./name";
import { MINT_NFT_PROMPT } from "./prompt";
import { MintNftInputSchema } from "./input-schema";
import { mintNft } from "./function";

import { MintNftSchemaType, MintNftResultBodyType } from "./types";

export class MintNftAction implements CdpAction<MintNftSchemaType, MintNftResultBodyType> {
  public name = MINT_NFT_NAME;
  public description = MINT_NFT_PROMPT;
  public argsSchema = MintNftInputSchema;
  public func = mintNft;
} 