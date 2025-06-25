import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

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
app.get('/', (req, res) => {
  res.json({ 
    message: 'Express + TypeScript + OpenAI Server is running!',
    timestamp: new Date().toISOString()
  });
});

// OpenAI chat completion test route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, model = 'gpt-3.5-turbo' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 500,
    });

    res.json({
      response: completion.choices[0]?.message?.content || 'No response generated',
      usage: completion.usage,
      model: completion.model,
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from OpenAI',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// OpenAI text completion test route (legacy)
app.post('/api/completion', async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo-instruct', max_tokens = 100 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await openai.completions.create({
      model,
      prompt,
      max_tokens,
      temperature: 0.7,
    });

    res.json({
      response: completion.choices[0]?.text?.trim() || 'No response generated',
      usage: completion.usage,
      model: completion.model,
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Failed to get completion from OpenAI',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// OpenAI models list route
app.get('/api/models', async (req, res) => {
  try {
    const models = await openai.models.list();
    res.json({
      models: models.data.map(model => ({
        id: model.id,
        created: model.created,
        owned_by: model.owned_by
      }))
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch models from OpenAI',
      details: error instanceof Error ? error.message : 'Unknown error'
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
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
    console.warn('   Please add your OpenAI API key to the .env file');
  }
}); 