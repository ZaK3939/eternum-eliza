import { z } from "zod";
import { Wallet } from "@coinbase/coinbase-sdk";
import { BaseAction, BaseActionResult, BaseActionSchemaAny } from "../../base-action";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CdpActionSchemaAny = BaseActionSchemaAny;
export type CdpActionResult<TBody> = BaseActionResult<TBody>;

/**
 * Represents the structure for CDP Actions.
 */
export interface CdpAction<TActionSchema extends CdpActionSchemaAny, TBody> extends BaseAction<TActionSchema, TBody, Wallet> {
  /**
   * The function to execute for this action
   */
  func?:
    | ((wallet: Wallet, args: z.infer<TActionSchema>) => Promise<CdpActionResult<TBody>>)
    | ((args: z.infer<TActionSchema>) => Promise<CdpActionResult<TBody>>)
}