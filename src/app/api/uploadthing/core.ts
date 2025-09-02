import { db } from "@/src/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getPineconeClient } from "@/src/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const f = createUploadthing();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const auth = async (_req:Request) => {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    return user ? { id: user.id } : null;
  } catch (err) {
    console.error("Auth middleware: error calling getUser()", err);
    return null;
  }
};

export const ourFileRouter = {
  pdfUploader: f({
    pdf: { maxFileSize: "4MB", maxFileCount: 1 }, // Ensure maxFileCount is 1 if you only expect one PDF per upload
  })

    .middleware(async ({ req }) => {
      const user = await auth(req);

      if (!user) {
        throw new UploadThingError("Unauthorized");
      }

      // You could add additional checks here based on user plan
      // For example, if (user.plan === 'FREE' && req.headers['content-length'] > 5 * 1024 * 1024) throw new Error("File too large for free plan");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("➡️ UploadComplete triggered for:", file.name, "File Key:", file.key);

      // Check if file already exists and is successfully processed to prevent duplicate work
      const existingFile = await db.file.findFirst({
        where: { key: file.key, userId: metadata.userId },
      });

      if (existingFile && existingFile.uploadStatus === "SUCCESS") {
        console.log("File already processed successfully, skipping:", file.name);
        return { fileId: existingFile.id };
      }

      let createdFile;
      if (existingFile) {
        // If it exists but failed or is processing, update it
        createdFile = await db.file.update({
          data: { uploadStatus: "PROCESSING" },
          where: { id: existingFile.id },
        });
      } else {
        // Otherwise, create a new entry
        createdFile = await db.file.create({
          data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: `https://utfs.io/f/${file.key}`,
            uploadStatus: "PROCESSING",
          },
        });
      }

      // Using an IIFE to handle the asynchronous processing and database updates
      (async () => {
        try {
          console.log(`Attempting to fetch PDF from: https://utfs.io/f/${file.key}`);
          const response = await fetch(`https://utfs.io/f/${file.key}`);

          if (!response.ok) {
            throw new Error(`Failed to fetch PDF from UploadThing: ${response.status} ${response.statusText}`);
          }

          // Use arrayBuffer and then create a Blob for WebPDFLoader
          const arrayBuffer = await response.arrayBuffer();
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

          console.log("Loading PDF with WebPDFLoader...");
          const loader = new WebPDFLoader(blob);
          const pageLevelDocs = await loader.load();
          console.log("Parsed PDF pages:", pageLevelDocs.length);

          // Server-side page limit check
          const MAX_FREE_PAGES = 5; // Define your maximum page limit for free users
          if (pageLevelDocs.length > MAX_FREE_PAGES) {
            console.warn(`PDF exceeds page limit: ${pageLevelDocs.length} pages (max ${MAX_FREE_PAGES} for free plan).`);
            await db.file.update({
              data: { uploadStatus: "FAILED" },
              where: { id: createdFile.id },
            });
            throw new Error(`PDF exceeds page limit (${MAX_FREE_PAGES} pages). Document has ${pageLevelDocs.length} pages.`);
          }

          console.log("Initializing Pinecone client...");
          const pinecone = await getPineconeClient();
          const pineconeIndex = pinecone.index("docmind-chat");

          // Ensure GOOGLE_API_KEY is provided
          if (!process.env.GOOGLE_API_KEY) {
            throw new Error("GOOGLE_API_KEY environment variable is not set. Please set it in your .env.local file.");
          }

          console.log("Initializing GoogleGenerativeAIEmbeddings...");
          const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "models/embedding-001", // Make sure this model is valid and accessible
            apiKey: process.env.GOOGLE_API_KEY,
          });

          console.log(`Inserting documents into Pinecone (namespace=${createdFile.id})...`);
          await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
            pineconeIndex,
            namespace: createdFile.id,
            // Consider adding a batchSize here if you have very large PDFs
            // batchSize: 100,
          });

          await db.file.update({
            data: { uploadStatus: "SUCCESS" },
            where: { id: createdFile.id },
          });

          console.log(
            `✅ Successfully inserted ${pageLevelDocs.length} docs into Pinecone (namespace=${createdFile.id}) and updated file status to SUCCESS.`
          );
        } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("Upload error:", err.message);
  } else {
    console.error("Upload error:", err);
  }

          // Only update to FAILED if it hasn't already been set by a specific check (like page limit)
          const currentFile = await db.file.findUnique({ where: { id: createdFile.id } });
          if (currentFile?.uploadStatus !== "FAILED") {
            await db.file.update({
              data: { uploadStatus: "FAILED" },
              where: { id: createdFile.id },
            });
          }
          console.log(`Updated file ${createdFile.id} status to FAILED.`);
        }
      })(); // End of IIFE

      return { fileId: createdFile.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;