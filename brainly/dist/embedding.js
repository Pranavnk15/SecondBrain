"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedding = getEmbedding;
exports.ensureCollection = ensureCollection;
exports.storeCard = storeCard;
exports.deleteCardFromQdrant = deleteCardFromQdrant;
exports.queryRelatedCard = queryRelatedCard;
const dotenv_1 = __importDefault(require("dotenv"));
const js_client_rest_1 = require("@qdrant/js-client-rest");
const cohere_ai_1 = require("cohere-ai");
const uuid_1 = require("uuid");
dotenv_1.default.config();
// ✅ Environment validation
if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY || !process.env.COHERE_API_KEY) {
    throw new Error("Missing environment variables: QDRANT_URL, QDRANT_API_KEY, or COHERE_API_KEY.");
}
// ✅ Initialize Qdrant Client
const qdrant = new js_client_rest_1.QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});
// ✅ Initialize Cohere Client
const cohereClient = new cohere_ai_1.CohereClient({ token: process.env.COHERE_API_KEY });
// ✅ Modify the embedding function according to the Cohere API response
function getEmbedding(text) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const res = yield cohereClient.v2.embed({
                texts: [text],
                model: "embed-v4.0",
                inputType: "classification",
                embeddingTypes: ["float"],
            });
            // ✅ Validate the structure before accessing
            const embeddingArray = (_b = (_a = res === null || res === void 0 ? void 0 : res.embeddings) === null || _a === void 0 ? void 0 : _a.float) === null || _b === void 0 ? void 0 : _b[0];
            if (!embeddingArray || embeddingArray.length === 0) {
                throw new Error("Failed to generate valid embedding");
            }
            return embeddingArray;
        }
        catch (err) {
            console.error("Error generating embedding:", err);
            throw new Error("Failed to generate embedding");
        }
    });
}
// ✅ Collection creation caching to prevent race conditions
const ensuredCollections = new Set();
function ensureCollection(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ensuredCollections.has(name))
            return;
        try {
            yield qdrant.getCollection(name);
        }
        catch (_a) {
            yield qdrant.createCollection(name, {
                vectors: {
                    size: 1536,
                    distance: "Cosine",
                },
            });
            yield qdrant.createPayloadIndex(name, {
                field_name: "userId",
                field_schema: "keyword",
            });
        }
        ensuredCollections.add(name);
    });
}
// Store card in Qdrant with embedding
function storeCard(card) {
    return __awaiter(this, void 0, void 0, function* () {
        const collectionName = "cards";
        yield ensureCollection(collectionName);
        const combinedText = `${card.title} ${card.description || ""}`.trim();
        const embedding = yield getEmbedding(combinedText);
        //@ts-ignore
        // console.log("Generated Embedding:", embedding);
        console.log("Generated length:", embedding.length);
        // Log the embedding to verify
        //   return;
        yield qdrant.upsert(collectionName, {
            points: [
                {
                    id: card.id || (0, uuid_1.v4)(),
                    vector: embedding,
                    payload: {
                        title: card.title,
                        description: card.description || "",
                        type: card.type,
                        link: card.link || "",
                        userId: card.userId,
                    },
                },
            ],
        });
    });
}
// Function to delete a card from Qdrant by its ID
function deleteCardFromQdrant(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield qdrant.delete("cards", {
            points: [id],
        });
    });
}
// Query related cards from Qdrant based on a given query and userId
function queryRelatedCard(query, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const embedding = yield getEmbedding(query);
        const results = yield qdrant.search("cards", {
            vector: embedding,
            limit: 10,
            score_threshold: 0.45,
            filter: {
                must: [
                    {
                        key: "userId",
                        match: { value: userId },
                    },
                ],
            },
        });
        return results.map((result) => (Object.assign(Object.assign({}, result.payload), { score: result.score })));
    });
}
// Test function to store a sample card
function testStoreCard() {
    return __awaiter(this, void 0, void 0, function* () {
        const testCard = {
            title: "Test Card Title",
            description: "This is a test card description.",
            type: "Info",
            userId: "user123",
        };
        try {
            yield storeCard(testCard);
            console.log("Card stored successfully!");
        }
        catch (error) {
            console.error("Error storing card:", error);
        }
    });
}
// Run the test
// testStoreCard();
// import dotenv from "dotenv";
// import { QdrantClient } from "@qdrant/js-client-rest";
// import { pipeline } from "@xenova/transformers";
// import { v4 as uuidv4 } from "uuid";
// dotenv.config();
// // ✅ Environment validation
// if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
//   throw new Error("QDRANT_URL or QDRANT_API_KEY is missing in environment variables.");
// }
// // ✅ Initialize Qdrant Client
// const qdrant = new QdrantClient({
//   url: process.env.QDRANT_URL,
//   apiKey: process.env.QDRANT_API_KEY,
// });
// // ✅ Singleton embedder
// let embedder: any;
// async function loadModel() {
//   if (!embedder) {
//     embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
//       quantized: false,
//     });
//   }
// }
// export async function getEmbedding(text: string): Promise<number[]> {
//   try {
//     await loadModel();
//     const output = await embedder(text, {
//       pooling: "mean",
//       normalize: true,
//     });
//     return Array.from(output.data as Float32Array);
//   } catch (err) {
//     console.error("Error generating embedding:", err);
//     throw new Error("Failed to generate embedding");
//   }
// }
// // ✅ Collection creation caching to prevent race conditions
// const ensuredCollections = new Set<string>();
// export async function ensureCollection(name: string) {
//   if (ensuredCollections.has(name)) return;
//   try {
//     await qdrant.getCollection(name);
//   } catch {
//     await qdrant.createCollection(name, {
//       vectors: {
//         size: 384,
//         distance: "Cosine",
//       },
//     });
//     await qdrant.createPayloadIndex(name, {
//       field_name: "userId",
//       field_schema: "keyword",
//     });
//   }
//   ensuredCollections.add(name);
// }
// export async function storeCard(card: {
//   id?: string;
//   title: string;
//   description?: string;
//   type: string;
//   link?: string;
//   userId: string;
// }) {
//   const collectionName = "cards";
//   await ensureCollection(collectionName);
//   const combinedText = `${card.title} ${card.description || ""}`.trim();
//   const embedding = await getEmbedding(combinedText);
//   await qdrant.upsert(collectionName, {
//     points: [
//       {
//         id: card.id || uuidv4(),
//         vector: embedding,
//         payload: {
//           title: card.title,
//           description: card.description || "",
//           type: card.type,
//           link: card.link || "",
//           userId: card.userId,
//         },
//       },
//     ],
//   });
// }
// export async function deleteCardFromQdrant(id: string) {
//   await qdrant.delete("cards", {
//     points: [id],
//   });
// }
// export async function queryRelatedCard(query: string, userId: string) {
//   const embedding = await getEmbedding(query);
//   const results = await qdrant.search("cards", {
//     vector: embedding,
//     limit: 10,
//     score_threshold: 0.45,
//     filter: {
//       must: [
//         {
//           key: "userId",
//           match: { value: userId },
//         },
//       ],
//     },
//   });
//   return results.map((result) => ({
//     ...result.payload,
//     score: result.score, // Optional: include score
//   }));
// }
