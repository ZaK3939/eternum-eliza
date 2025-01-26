import { BaseAction, BaseActionResult, BaseActionSchemaAny } from '@/aitool/base-action';

export type KnowledgeActionSchemaAny = BaseActionSchemaAny;
export type KnowledgeActionResult<TBody> = BaseActionResult<TBody>;

/**
 * Represents the structure for Knowledge Actions.
 */
export interface KnowledgeAction<TActionSchema extends KnowledgeActionSchemaAny, TBody>
  extends BaseAction<TActionSchema, TBody> {}
