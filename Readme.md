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

- `index.ts` - Main entry point for the application
- `agents.ts` - AI agent implementations and configurations
- `create-memory.ts` - Memory creation and management
- `create-pipe.ts` - Pipeline creation for AI processing
- `query.ts` - Query handling and processing
- `upload-docs.ts` - Document upload functionality

## Usage

The project uses `tsx` to run TypeScript files directly. Here's how to use the different components:

1. Upload documents:

```bash
npx tsx upload-docs.ts
```

2. Create memory:

```bash
npx tsx create-memory.ts
```

3. Create pipe:

```bash
npx tsx create-pipe.ts
```

4. Run queries:

```bash
npx tsx query.ts
```

5. Run the main application:

```bash
npx tsx index.ts
```

## Dependencies

- `dotenv` - Environment variable management
- `langbase` - AI and memory management API
- `tsx` - TypeScript execution engine (used for running TypeScript files directly)
