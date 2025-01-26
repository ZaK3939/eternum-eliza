export type KnowledgeInput = {
    baseUrl: string;
    name: string;
    summary: string;
    summaryEmbedding: number[];
    markdown: string;
    url?: string;
    title?: string;
    description?: string;
    favicon?: string;
}

export type Knowledge = KnowledgeInput & {
    id: string;
}