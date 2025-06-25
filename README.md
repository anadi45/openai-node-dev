# Express + TypeScript + OpenAI Server

A quick setup for testing OpenAI API with Express and TypeScript.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OpenAI API key:**
   - Copy your OpenAI API key
   - Edit the `.env` file and replace `your_openai_api_key_here` with your actual API key

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm run dev` - Run the server in development mode with hot reload
- `npm run dev:watch` - Run with file watching
- `npm run build` - Build the TypeScript to JavaScript
- `npm run start` - Run the built server

## API Endpoints

### Health Check
```bash
GET http://localhost:3000/
```

### Chat Completion
```bash
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "model": "gpt-3.5-turbo"
}
```

### Text Completion (Legacy)
```bash
POST http://localhost:3000/api/completion
Content-Type: application/json

{
  "prompt": "The weather today is",
  "model": "gpt-3.5-turbo-instruct",
  "max_tokens": 100
}
```

### List Models
```bash
GET http://localhost:3000/api/models
```

## Example Usage with curl

```bash
# Test chat completion
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?"}'

# Test text completion
curl -X POST http://localhost:3000/api/completion \
  -H "Content-Type: application/json" \
  -d '{"prompt": "The best programming language is"}'
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3000) | No |
| `OPENAI_BASE_URL` | Custom OpenAI base URL | No |

## Project Structure

```
├── src/
│   └── index.ts          # Main server file
├── dist/                 # Compiled JavaScript (auto-generated)
├── .env                  # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
``` 