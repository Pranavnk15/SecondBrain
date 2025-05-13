export declare function getEmbedding(text: string): Promise<number[]>;
export declare function ensureCollection(name: string): Promise<void>;
export declare function storeCard(card: {
    id?: string;
    title: string;
    description?: string;
    type: string;
    link?: string;
    userId: string;
}): Promise<void>;
export declare function deleteCardFromQdrant(id: string): Promise<void>;
export declare function queryRelatedCard(query: string, userId: string): Promise<({
    score: number;
} | {
    score: number;
} | {
    score: number;
} | {
    score: number;
})[]>;
