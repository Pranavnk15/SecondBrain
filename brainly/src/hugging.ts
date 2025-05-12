import dotenv from "dotenv";
import { QdrantClient } from "@qdrant/js-client-rest";
import { CohereClient } from "cohere-ai";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// ✅ Environment validation
if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY || !process.env.COHERE_API_KEY) {
  throw new Error("Missing environment variables: QDRANT_URL, QDRANT_API_KEY, or COHERE_API_KEY.");
}

// ✅ Initialize Qdrant Client
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// ✅ Initialize Cohere Client
const cohereClient = new CohereClient({ token: process.env.COHERE_API_KEY });

// ✅ Modify the embedding function according to the Cohere API response
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const res = await cohereClient.v2.embed({
      texts: [text],
      model: "embed-v4.0",
      inputType: "classification",
      embeddingTypes: ["float"],
    });

    // ✅ Validate the structure before accessing
    const embeddingArray = res?.embeddings?.float?.[0];

    if (!embeddingArray || embeddingArray.length === 0) {
      throw new Error("Failed to generate valid embedding");
    }

   

    return embeddingArray;
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
        size: 1536,
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

// Store card in Qdrant with embedding
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

  //@ts-ignore
console.log("Generated Embedding:", embedding);
console.log("Generated length:", embedding.length);
// Log the embedding to verify
//   return;

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

// Function to delete a card from Qdrant by its ID
export async function deleteCardFromQdrant(id: string) {
  await qdrant.delete("cards", {
    points: [id],
  });
}

// Query related cards from Qdrant based on a given query and userId
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

// Test function to store a sample card
async function testStoreCard() {
  const testCard = {
    title: "Test Card Title",
    description: "This is a test card description.",
    type: "Info",
    userId: "user123",
  };

  try {
    await storeCard(testCard);
    console.log("Card stored successfully!");
  } catch (error) {
    console.error("Error storing card:", error);
  }
}

// Run the test
testStoreCard();
