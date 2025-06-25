import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import util from "util";

// Load environment variables
dotenv.config();

// Utility function for comprehensive data type logging
function logDataTypeAnalysis(data: any, label: string = "DATA") {
  console.log(`\n=== ${label} TYPE ANALYSIS ===`);
  console.log("1. Type:", typeof data);
  console.log("2. Constructor:", data?.constructor?.name || "N/A");
  console.log("3. Is Array:", Array.isArray(data));
  console.log("4. Is null:", data === null);
  console.log("5. Is undefined:", data === undefined);
  
  if (data && typeof data === 'object') {
    console.log("\n6. Object properties and types:");
    for (const [key, value] of Object.entries(data)) {
      const valueType = typeof value;
      const isArray = Array.isArray(value);
      const constructor = value?.constructor?.name || "N/A";
      
      console.log(`   ${key}: ${valueType}${isArray ? ' (Array)' : ''} - Constructor: ${constructor}`);
      
      // Special handling for arrays
      if (isArray && value.length > 0) {
        console.log(`     Array length: ${value.length}`);
        console.log(`     First element type: ${typeof value[0]}`);
        if (key === 'embedding' || key === 'data') {
          console.log(`     Sample values: [${value.slice(0, 3).join(', ')}...]`);
        }
      }
      
      // Special handling for nested objects
      if (valueType === 'object' && !isArray && value !== null && value !== undefined) {
        console.log(`     Nested object keys: [${Object.keys(value).join(', ')}]`);
      }
    }
    
    console.log("\n7. Deep structure:");
    console.log(util.inspect(data, { 
      depth: 2, 
      colors: false, 
      showHidden: false,
      maxArrayLength: 3
    }));
  }
  
  console.log(`=== END ${label} TYPE ANALYSIS ===\n`);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Express + TypeScript + OpenAI Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// OpenAI chat completion test route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, model = "gpt-3.5-turbo" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 500,
    });

    // Log the chat completion response data types
    logDataTypeAnalysis(completion, "CHAT COMPLETION");

    res.json({
      response:
        completion.choices[0]?.message?.content || "No response generated",
      usage: completion.usage,
      model: completion.model,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: "Failed to get response from OpenAI",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// OpenAI text completion test route (legacy)
app.post("/api/completion", async (req, res) => {
  try {
    const {
      prompt,
      model = "gpt-3.5-turbo-instruct",
      max_tokens = 100,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await openai.completions.create({
      model,
      prompt,
      max_tokens,
      temperature: 0.7,
    });

    // Log the text completion response data types
    logDataTypeAnalysis(completion, "TEXT COMPLETION");

    res.json({
      response: completion.choices[0]?.text?.trim() || "No response generated",
      usage: completion.usage,
      model: completion.model,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: "Failed to get completion from OpenAI",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// OpenAI models list route
app.get("/api/models", async (req, res) => {
  try {
    const models = await openai.models.list();
    
    // Log the models response data types
    logDataTypeAnalysis(models, "MODELS LIST");
    
    res.json({
      models: models.data.map((model) => ({
        id: model.id,
        created: model.created,
        owned_by: model.owned_by,
      })),
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: "Failed to fetch models from OpenAI",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// OpenAI single text embedding route
app.post("/api/embedding", async (req, res) => {
  try {
    const {
      text,
      model = "text-embedding-ada-002",
      encoding_format = "float",
    } = req.body;
    console.log("req.body", req.body);
    
    const embedding = await openai.embeddings.create({
      model,
      input: text,
      encoding_format,
    });

    // Comprehensive logging for data type analysis
    logDataTypeAnalysis(embedding, "EMBEDDING");

    res.json({
      embedding,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: "Failed to get embedding from OpenAI",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// OpenAI batch embeddings route
app.post("/api/embeddings/batch", async (req, res) => {
  try {
    const { texts, model = "text-embedding-ada-002" } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res
        .status(400)
        .json({ error: "Texts array is required and must not be empty" });
    }

    if (texts.length > 2048) {
      return res
        .status(400)
        .json({ error: "Maximum 2048 texts allowed per batch" });
    }

    const embeddings = await openai.embeddings.create({
      model,
      input: texts,
    });

    // Log the batch embeddings response data types
    logDataTypeAnalysis(embeddings, "BATCH EMBEDDINGS");

    res.json({
      embeddings: embeddings.data.map((item, index) => ({
        index,
        text: texts[index],
        embedding: item.embedding,
        dimensions: item.embedding.length,
      })),
      usage: embeddings.usage,
      model: embeddings.model,
      total_embeddings: embeddings.data.length,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: "Failed to get batch embeddings from OpenAI",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// OpenAI embedding similarity comparison route
app.post("/api/embeddings/similarity", async (req, res) => {
  try {
    const { text1, text2, model = "text-embedding-ada-002" } = req.body;

    if (!text1 || !text2) {
      return res
        .status(400)
        .json({ error: "Both text1 and text2 are required" });
    }

    // Get embeddings for both texts
    const embeddings = await openai.embeddings.create({
      model,
      input: [text1, text2],
    });

    // Log the similarity embeddings response data types
    logDataTypeAnalysis(embeddings, "SIMILARITY EMBEDDINGS");

    const embedding1 = embeddings.data[0].embedding;
    const embedding2 = embeddings.data[1].embedding;

    // Calculate cosine similarity
    const dotProduct = embedding1.reduce(
      (sum, a, i) => sum + a * embedding2[i],
      0
    );
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));
    const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);

    res.json({
      text1,
      text2,
      cosine_similarity: cosineSimilarity,
      similarity_percentage: (cosineSimilarity * 100).toFixed(2) + "%",
      embeddings: {
        text1: {
          embedding: embedding1,
          dimensions: embedding1.length,
        },
        text2: {
          embedding: embedding2,
          dimensions: embedding2.length,
        },
      },
      usage: embeddings.usage,
      model: embeddings.model,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: "Failed to calculate embedding similarity",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Available routes:`);
  console.log(`   GET  /               - Health check`);
  console.log(`   POST /api/chat       - Chat completion`);
  console.log(`   POST /api/completion - Text completion`);
  console.log(`   GET  /api/models     - List OpenAI models`);
  console.log(`   POST /api/embedding  - Single text embedding`);
  console.log(`   POST /api/embeddings/batch - Batch text embeddings`);
  console.log(
    `   POST /api/embeddings/similarity - Compare embedding similarity`
  );

  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️  OPENAI_API_KEY not found in environment variables");
    console.warn("   Please add your OpenAI API key to the .env file");
  }
});
