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
const transformers_1 = require("@xenova/transformers");
const uuid_1 = require("uuid");
// import { PointIdsList } from "@qdrant/js-client-rest"; 
dotenv_1.default.config();
// Qdrant Cloud client
const qdrant = new js_client_rest_1.QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});
// Load embedding model once
let embedder;
function loadModel() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!embedder) {
            embedder = yield (0, transformers_1.pipeline)("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
                quantized: false,
            });
        }
    });
}
// Generate embedding locally
function getEmbedding(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Your logic to get the embedding from a model/API
            yield loadModel();
            const output = yield embedder(text, {
                pooling: "mean",
                normalize: true,
            });
            return Array.from(output.data);
        }
        catch (err) {
            console.error("Error in embedding:", err);
            throw new Error("Failed to get embedding");
        }
    });
}
// Ensure collection exists and has index on userId
function ensureCollection(name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield qdrant.getCollection(name);
        }
        catch (_a) {
            yield qdrant.createCollection(name, {
                vectors: {
                    size: 384,
                    distance: "Cosine",
                },
            });
            // Create index on userId for filtering
            yield qdrant.createPayloadIndex(name, {
                field_name: "userId",
                field_schema: "keyword",
            });
        }
    });
}
// Store card in Qdrant
function storeCard(card) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureCollection("cards");
        const combinedText = `${card.title} ${card.description || ""}`.trim();
        const embedding = yield getEmbedding(combinedText);
        yield qdrant.upsert("cards", {
            points: [
                {
                    id: card.id || (0, uuid_1.v4)(), // ✅ ensure it's a UUID
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
//deleted
function deleteCardFromQdrant(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield qdrant.delete("cards", {
            points: [id], // ✅ Correct structure for v1.14.0
        });
    });
}
// Query most relevant card
function queryRelatedCard(query, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const embedding = yield getEmbedding(query);
        const results = yield qdrant.search("cards", {
            vector: embedding,
            limit: 10,
            score_threshold: 0.45, // ← set similarity threshold (range 0.0 to 1.0)
            filter: {
                must: [
                    {
                        key: "userId",
                        match: { value: userId },
                    },
                ],
            },
        });
        return results.map(result => result.payload);
    });
}
// // Test script
// (async () => {
//   const card = {
//     title: "How to use TypeScript with React",
//     description: "Learn the basics of TS in modern React apps",
//     type: "guide",
//     link: "https://example.com/ts-react-guide",
//     userId: "user001",
//   };
// //   await storeCard(card);
// //    await storeCard(card);
// //     await storeCard(card);
// //   const related = await queryRelatedCard("learn react use", "user001");
// //   console.log("Related card:", related);
// })();
