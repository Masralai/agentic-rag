# Agentic RAG

A TypeScript-based project that implements a Retrieval-Augmented Generation (RAG) system with AI agents for intelligent document processing and querying.

## Overview

This project implements an AI-powered document processing system that combines memory retrieval with AI support agents to provide accurate and context-aware responses to user queries. It uses the Langbase API for memory management and AI completions.

## Features

- Document processing and memory storage
- Intelligent query handling with context awareness
- AI support agent for generating responses
- Memory retrieval system for relevant context
- Source citation and reference tracking

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager
- Langbase API key

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/agentic-rag.git
cd agentic-rag
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your Langbase API key:

```
LANGBASE_API_KEY=your_api_key_here
```

## Project Structure

```
agentic-rag/
├── src/
│   ├── agents.ts        # AI agent implementations and configurations
│   ├── create-memory.ts # Memory creation and management
│   ├── create-pipe.ts   # Pipeline creation for AI processing
│   ├── index.ts         # Main entry point (returns responses with chunks)
│   ├── query.ts         # Query handling (returns only responses)
│   └── upload-docs.ts   # Document upload functionality
├── docs/                # Directory for training documents
│   ├── langbase-faq.txt
│   └── agent-arch.txt
├── .gitignore
├── package.json
└── README.md
```

## Usage

The project uses `tsx` to run TypeScript files directly. Here's the typical workflow:

1. Add your training documents to the `docs/` folder (text files)

2. Upload the documents to create the knowledge base:

```bash
npx tsx src/upload-docs.ts
```

3. Create memory for the uploaded documents:

```bash
npx tsx src/create-memory.ts
```

4. Create the processing pipeline:

```bash
npx tsx src/create-pipe.ts
```

5. To get responses with detailed chunks (useful for debugging):

```bash
npx tsx src/index.ts
```

6. To get only the responses to queries:
   - Edit the query in `src/query.ts`
   - Run:

```bash
npx tsx src/query.ts
```

## Workflow Explanation

1. **Document Preparation**:
   - Place your training documents in the `docs/` folder
   - Documents should be in text format (.txt)

2. **Setup Process**:
   - Upload documents using `upload-docs.ts`
   - Create memory using `create-memory.ts`
   - Set up the processing pipeline using `create-pipe.ts`

3. **Querying**:
   - For development/debugging: Use `index.ts` to see both responses and chunks
   - For production: Use `query.ts` by updating the query in the file

## Dependencies

- `dotenv` - Environment variable management
- `langbase` - AI and memory management API
- `tsx` - TypeScript execution engine (used for running TypeScript files directly)
