import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Export a helper to get a model instance
export const getGeminiModel = (model = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model });
};

// Embeddings helper
export const getGeminiEmbeddings = async (texts: string[]) => {
  // ✅ use Gemini embeddings model
  const model = genAI.getGenerativeModel({ model: "models/embedding-001" });

  const embeddings: number[][] = [];
  for (const text of texts) {
    const result = await model.embedContent(text);
    embeddings.push(result.embedding.values);
  }
  return embeddings;
};
