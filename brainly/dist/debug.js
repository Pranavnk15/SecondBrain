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
const embedding_1 = require("./embedding");
const js_client_rest_1 = require("@qdrant/js-client-rest");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const qdrant = new js_client_rest_1.QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const userId = "debug-user";
    const title = "Test React Typescript";
    const description = "Learn the basics of TS in modern React apps";
    const fullText = `${title} ${description}`;
    const emb1 = yield (0, embedding_1.getEmbedding)(fullText);
    console.log("Embed 1 (first 5):", emb1.slice(0, 5));
    // Store the card
    yield (0, embedding_1.storeCard)({
        title,
        description,
        type: "test",
        userId,
    });
    // Wait a few seconds to ensure it's stored
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        const emb2 = yield (0, embedding_1.getEmbedding)(fullText);
        console.log("Embed 2 (first 5):", emb2.slice(0, 5));
        // Compare embeddings directly
        const identical = emb1.every((v, i) => Math.abs(v - emb2[i]) < 1e-6);
        console.log("Embeddings match?", identical);
        // Check vector count
        const info = yield qdrant.getCollection("cards");
        console.log("Vector count in Qdrant:", info.vectors_count);
        // Scroll to inspect what's stored
        const scroll = yield qdrant.scroll("cards", { limit: 5 });
        console.log("Stored payloads:", scroll.points.map(p => p.payload));
        // Search now
        const results = yield (0, embedding_1.queryRelatedCard)(fullText, userId);
        console.log("Search results:", results);
    }), 3000);
}))();
