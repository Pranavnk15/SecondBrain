import { getEmbedding, storeCard, queryRelatedCard } from "./embedding.js";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();
const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});
(async () => {
    const userId = "debug-user";
    const title = "Test React Typescript";
    const description = "Learn the basics of TS in modern React apps";
    const fullText = `${title} ${description}`;
    const emb1 = await getEmbedding(fullText);
    console.log("Embed 1 (first 5):", emb1.slice(0, 5));
    // Store the card
    await storeCard({
        title,
        description,
        type: "test",
        userId,
    });
    // Wait a few seconds to ensure it's stored
    setTimeout(async () => {
        const emb2 = await getEmbedding(fullText);
        console.log("Embed 2 (first 5):", emb2.slice(0, 5));
        // Compare embeddings directly
        const identical = emb1.every((v, i) => Math.abs(v - emb2[i]) < 1e-6);
        console.log("Embeddings match?", identical);
        // Check vector count
        const info = await qdrant.getCollection("cards");
        console.log("Vector count in Qdrant:", info.vectors_count);
        // Scroll to inspect what's stored
        const scroll = await qdrant.scroll("cards", { limit: 5 });
        console.log("Stored payloads:", scroll.points.map((p) => p.payload));
        // Search now
        const results = await queryRelatedCard(fullText, userId);
        console.log("Search results:", results);
    }, 3000);
})();
