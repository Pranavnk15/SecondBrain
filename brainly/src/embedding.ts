import dotenv from "dotenv";
import { QdrantClient } from "@qdrant/js-client-rest";
import { pipeline } from "@xenova/transformers";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// ✅ Environment validation
if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
  throw new Error("QDRANT_URL or QDRANT_API_KEY is missing in environment variables.");
}

// ✅ Initialize Qdrant Client
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// ✅ Singleton embedder
let embedder: any;

export async function loadModel() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: false,
    });
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    await loadModel();
    const output = await embedder(text, {
      pooling: "mean",
      normalize: true,
    });
    return Array.from(output.data as Float32Array);
  } catch (err) {
    console.error("Error generating embedding:", err);
    throw new Error("Failed to generate embedding");
  }
}

// ✅ Collection creation caching to prevent race conditions
const ensuredCollections = new Set<string>();

export async function ensureCollection(name: string) {
  if (ensuredCollections.has(name)) return;

  try {
    await qdrant.getCollection(name);
  } catch {
    await qdrant.createCollection(name, {
      vectors: {
        size: 384,
        distance: "Cosine",
      },
    });

    await qdrant.createPayloadIndex(name, {
      field_name: "userId",
      field_schema: "keyword",
    });
  }

  ensuredCollections.add(name);
}

export async function storeCard(card: {
  id?: string;
  title: string;
  description?: string;
  type: string;
  link?: string;
  userId: string;
}) {
  const collectionName = "cards";
  await ensureCollection(collectionName);

  const combinedText = `${card.title} ${card.description || ""}`.trim();
  const embedding = await getEmbedding(combinedText);

  await qdrant.upsert(collectionName, {
    points: [
      {
        id: card.id || uuidv4(),
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
}

export async function deleteCardFromQdrant(id: string) {
  await qdrant.delete("cards", {
    points: [id],
  });
}

export async function queryRelatedCard(query: string, userId: string) {
  const embedding = await getEmbedding(query);

  const results = await qdrant.search("cards", {
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

  return results.map((result) => ({
    ...result.payload,
    score: result.score, // Optional: include score
  }));
}
