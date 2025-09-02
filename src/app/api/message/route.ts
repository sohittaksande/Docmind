import { db } from "@/src/db";
import { getPineconeClient } from "@/src/lib/pinecone";
import { SendMessageValidator } from "@/src/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { getGeminiModel } from "@/src/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

// Define a local interface that matches Pinecone's QueryRequest structure,
// but omit 'namespace' as it will be handled by the index object directly.
interface PineconeQueryRequest {
  vector: number[];
  topK: number;
  // namespace: string; // Removed from here
  includeMetadata?: boolean;
  // Add any other properties here if you use them in the query object,
  // e.g., filter?: Record<string, unknown>;
  // id?: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const userId = user?.id;

    if (!userId) {
      console.warn("Unauthorized access attempt to /api/message");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileId, message } = SendMessageValidator.parse(body);

    const file = await db.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      console.warn(`File not found or unauthorized for fileId: ${fileId}, userId: ${userId}`);
      return new NextResponse("Not found", { status: 404 });
    }

    await db.message.create({
      data: { text: message, isUserMessage: true, userId, fileId },
    });
    console.log(`User message stored for file ${fileId}: "${message}"`);

    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not set. Cannot create embeddings.");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "models/embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
    });
    console.log("Gemini Embeddings initialized.");

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.index("docmind-chat");

    // ✅ NEW: Get a namespaced index object
    const namespacedPineconeIndex = pineconeIndex.namespace(file.id);
    console.log(`Initialized Pinecone namespaced index for namespace: '${file.id}'`);


    console.log("Embedding user message for Pinecone query...");
    const queryVector = await embeddings.embedQuery(message);
    if (!queryVector || queryVector.length === 0) {
      throw new Error("Failed to generate embedding for the user message.");
    }
    console.log(`User message embedded into a vector of ${queryVector.length} dimensions.`);

    // ✅ Use the locally defined interface for type checking, without 'namespace'
    const pineconeQueryOptions: PineconeQueryRequest = {
      vector: queryVector,
      topK: 4,
      includeMetadata: true,
    };

    // ✅ Query the namespaced index object
    console.log(`Querying Pinecone index 'docmind-chat' (namespaced to '${file.id}')...`);
    const queryResult = await namespacedPineconeIndex.query(pineconeQueryOptions);
    console.log("Raw Pinecone query result:", queryResult);

    const results = queryResult.matches?.map((match) => {
      const pageContent = (match.metadata as { text?: string; pageContent?: string })?.text ||
                         (match.metadata as { text?: string; pageContent?: string })?.pageContent ||
                         '';
      return {
        pageContent: pageContent,
        metadata: match.metadata,
        score: match.score
      };
    }).filter(r => r.pageContent !== '') || [];
    console.log("Formatted vector search results:", results.map(r => `Score: ${r.score}, Content: ${r.pageContent.substring(0, 100)}...`));

    const prevMessages = await db.message.findMany({
      where: { fileId },
      orderBy: { createdAt: "asc" },
      take: 6,
    });
    const previousConversation = prevMessages
      .map((msg) =>
        msg.isUserMessage ? `User: ${msg.text}` : `Assistant: ${msg.text}`
      )
      .join("\n");
    console.log("Previous conversation history collected.");

    const context = results.map((r) => r.pageContent).join("\n\n");
    console.log("Context from Pinecone:", context.substring(0, Math.min(context.length, 500)) + (context.length > 500 ? "..." : ""));

    const prompt = `Use the following pieces of context (or previous conversation if needed)
to answer the user's question in markdown format.
If you don't know the answer, just say you don't know.

----------------
PREVIOUS CONVERSATION:
${previousConversation}

----------------
CONTEXT:
${context}

USER INPUT: ${message}`;

    console.log("Gemini prompt generated.");

    const model = getGeminiModel();
    console.log("Calling Gemini model...");
    const response = await model.generateContent(prompt);
    /*changes->>> */
     
    console.log("Gemini response received.");

    const text = response.response.text();
    console.log("Gemini generated text:", text.substring(0, Math.min(text.length, 500)) + (text.length > 500 ? "..." : ""));

    await db.message.create({
      data: { text, isUserMessage: false, userId, fileId },
    });
    console.log("Assistant's reply stored.");

    return new NextResponse(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" ,
        "Transfer-Encoding": "chunked"
      },
    });
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("❌ Error in /api/message POST:", err.message);
    console.error("Stack trace:", err.stack);
  } else {
    console.error("❌ Unknown error:", err);
  }
  return new NextResponse("Internal Server Error", { status: 500 });
}

};