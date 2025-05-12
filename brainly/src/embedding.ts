import dotenv from "dotenv";
import { QdrantClient } from "@qdrant/js-client-rest";
import { pipeline } from "@xenova/transformers";
import { v4 as uuidv4 } from "uuid";
// import { PointIdsList } from "@qdrant/js-client-rest"; 

dotenv.config();

// Qdrant Cloud client
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

// Load embedding model once
let embedder: any;
async function loadModel() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: false,
    });
  }
}

// Generate embedding locally
export async function getEmbedding(text: string): Promise<number[]> {
    try {
    // Your logic to get the embedding from a model/API
      await loadModel();
  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data as Float32Array);
}
catch (err) {
    console.error("Error in embedding:", err);
    throw new Error("Failed to get embedding");
  }
   
}

// Ensure collection exists and has index on userId
export async function ensureCollection(name: string) {
  try {
    await qdrant.getCollection(name);
  } catch {
    await qdrant.createCollection(name, {
      vectors: {
        size: 384,
        distance: "Cosine",
      },
    });

    // Create index on userId for filtering
    await qdrant.createPayloadIndex(name, {
      field_name: "userId",
      field_schema: "keyword",
    });
  }
}

// Store card in Qdrant
export async function storeCard(card: {
  id?: string;
  title: string;
  description?: string;
  type: string;
  link?: string;
  userId: string;
}) {
  await ensureCollection("cards");

  const combinedText = `${card.title} ${card.description || ""}`.trim();
  const embedding = await getEmbedding(combinedText);

  await qdrant.upsert("cards", {
    points: [
      {
        id: card.id || uuidv4(), // ✅ ensure it's a UUID
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

//deleted
export async function deleteCardFromQdrant(id: string) {
  await qdrant.delete("cards", {
    points: [id], // ✅ Correct structure for v1.14.0
  });
}
// Query most relevant card
export async function queryRelatedCard(query: string, userId: string) {
  const embedding = await getEmbedding(query);

  const results = await qdrant.search("cards", {
    vector: embedding,
    limit: 10,
    score_threshold: 0.45,  // ← set similarity threshold (range 0.0 to 1.0)
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
