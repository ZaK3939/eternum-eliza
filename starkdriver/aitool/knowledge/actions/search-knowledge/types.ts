import { z } from "zod";

import { SearchKnowledgeInputSchema } from "./input-schema";

import type { KnowledgeActionResult } from "../knowledge-action";
import type { Knowledge } from "@/db/types";

export type SearchKnowledgeSchemaType = typeof SearchKnowledgeInputSchema;

export type SearchKnowledgeArgumentsType = z.infer<SearchKnowledgeSchemaType>;

export type SearchKnowledgeResultBodyType = {
    knowledge: Knowledge[];
}; 

export type SearchKnowledgeResultType = KnowledgeActionResult<SearchKnowledgeResultBodyType>;