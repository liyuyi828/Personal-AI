# Personal AI - Project Planning

## Project Overview
An Electron desktop application that connects to local LLMs served by Ollama, with a modern UI built using Next.js, TypeScript, and Tailwind CSS. Features intelligent model selection with 12 curated models including the latest Qwen 3, Gemma 3, Llama 3.2, and Phi-3 models.

## Tech Stack

### Core Technologies
- **Electron**: Desktop application framework
- **Next.js 15**: React framework for the UI
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Ollama**: Local LLM server
- **electron-store**: Persistent configuration storage

### Supported Models (2025)
- **Qwen 3** (0.6B - 14B): Latest flagship models from Alibaba
- **Gemma 3** (270M - 12B): Google's multimodal models
- **Llama 3.2** (1B - 3B): Meta's efficient models
- **Phi-3** (3.8B): Microsoft's coding-focused model

## Architecture

### Frontend (Renderer Process)
- Next.js 15 application with TypeScript
- Tailwind CSS 4 for styling
- React 19 components for chat interface
- Custom hooks for state management (useModelSelection)

### Backend (Main Process)
- Electron main process with IPC handlers
- Model Manager for Ollama model operations
- Config Store for persistent settings
- Ollama Client with streaming support

### Communication Flow
```
User Interface (Next.js)
    ↕ IPC (contextBridge)
Electron Main Process
    ├─ Model Manager
    ├─ Config Store
    └─ Ollama Client
        ↕ HTTP/REST
    Ollama Server (localhost:11434)
        ↕
    Selected LLM Model (Dynamic)
```

## Implemented Features ✅

### Phase 1: Core Functionality ✅ COMPLETE
- ✅ **Model Selection & Management**
  - ✅ Detect available models from Ollama
  - ✅ 12 curated model recommendations with hardware specs
  - ✅ Model selection dialog with categories (lightweight/balanced/powerful)
  - ✅ Persist model selection with electron-store
  - ✅ Display hardware requirements and performance estimates
  - ✅ One-click model download with progress tracking
  - ✅ Auto-select model on first launch
- ✅ **Chat Interface**
  - ✅ Real-time message streaming
  - ✅ Message history display
  - ✅ Modern UI with Tailwind CSS
  - ✅ Model selector in header
  - ✅ Connection status indicator
- ✅ **Ollama Integration**
  - ✅ Connect to local Ollama instance
  - ✅ Send prompts and receive streaming responses
  - ✅ Dynamic model switching
  - ✅ Request/response logging for debugging

### Phase 2: Enhanced Features (In Progress)
- [ ] Conversation management (save/load/delete)
- [ ] Settings panel (temperature, context length, etc.)
- [ ] Copy/paste functionality
- [ ] Code syntax highlighting
- ✅ Markdown rendering (FormattedMessage component)

### Phase 3: Advanced Features (Planned)
- [ ] System prompts customization
- [ ] Export conversations
- [ ] Search through conversation history
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Auto-update functionality

## Project Structure
```
personal-ai/
├── electron/
│   ├── main.ts                    # Electron main process
│   ├── preload.ts                 # Preload script (IPC bridge)
│   ├── ollama-client.ts           # Ollama API integration
│   ├── ollama-manager.ts          # Ollama installation & model management
│   └── utils/
│       ├── platform-detector.ts   # Detect OS and platform
│       └── process-manager.ts     # Manage Ollama process
├── src/                           # Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Settings.tsx
│   │   └── setup/
│   │       ├── SetupWizard.tsx    # Initial setup UI
│   │       ├── OllamaInstaller.tsx # Ollama installation UI
│   │       └── ModelDownloader.tsx # Model download progress UI
│   ├── hooks/
│   │   ├── useChat.ts
│   │   └── useOllamaSetup.ts      # Hook for setup state
│   ├── lib/
│   │   └── types.ts
│   └── utils/
│       └── helpers.ts
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── electron-builder.json
```

## User Experience Flow

### First Launch
1. App detects Ollama is not installed
2. Show welcome screen with setup wizard
3. User clicks "Get Started"
4. App checks system requirements (disk space, internet connection)
5. Download and install Ollama (with progress indicator)
6. Start Ollama service automatically
7. Check for Qwen3 8B model
8. If not found, show model download screen
9. Download Qwen3 8B model (with progress bar, ~4.7GB)
10. Once complete, show success screen
11. Navigate to chat interface

### Subsequent Launches
1. Quick check: Is Ollama running?
2. Quick check: Is Qwen3 8B model available?
3. If both OK, go straight to chat interface
4. If Ollama stopped, auto-start or prompt user
5. If model missing, prompt to re-download

### Error Handling
- Network connection issues during download
- Insufficient disk space warnings
- Ollama service startup failures
- Model corruption detection
- Graceful fallback and retry mechanisms

## Development Phases

### Phase 1: Project Setup (Week 1)
1. Initialize Next.js project with TypeScript
2. Setup Tailwind CSS
3. Configure Electron with Next.js
4. Setup IPC communication bridge
5. Implement Ollama detection and setup logic
6. Build setup wizard UI components
7. Test Ollama connection

### Phase 2: Core Chat Interface (Week 2)
1. Build basic chat UI components
2. Implement message input and display
3. Connect to Ollama API
4. Implement streaming responses
5. Add basic error handling

### Phase 3: State Management & Persistence (Week 3)
1. Implement conversation state management
2. Add conversation history storage
3. Build sidebar with conversation list
4. Add conversation CRUD operations

### Phase 4: Polish & Enhancement (Week 4)
1. Add settings panel
2. Implement markdown and code rendering
3. Add keyboard shortcuts
4. Improve error handling and loading states
5. Add theme support
6. Testing and bug fixes

### Phase 5: Build & Distribution (Week 5)
1. Configure electron-builder
2. Create app icons
3. Setup auto-update (optional)
4. Build for target platforms (macOS, Windows, Linux)
5. Documentation

## Technical Considerations

### Automated Ollama Setup
The app will automatically detect and install Ollama if not present:

#### Detection Flow
1. **Check if Ollama is installed**
   - macOS: Check `/usr/local/bin/ollama` or `~/.ollama/bin/ollama`
   - Windows: Check `%USERPROFILE%\.ollama\ollama.exe` or Program Files
   - Linux: Check `/usr/local/bin/ollama` or `/usr/bin/ollama`

2. **Check if Ollama is running**
   - Ping `http://localhost:11434/api/tags`
   - If not running, prompt user to start or auto-start Ollama service

3. **Check if Qwen3 8B model is available**
   - Query `/api/tags` endpoint for installed models
   - If not found, show download UI

#### Installation Process
- **macOS**: Download and run official Ollama installer (.dmg or use curl script)
- **Windows**: Download official installer (.exe)
- **Linux**: Use official install script (`curl -fsSL https://ollama.com/install.sh | sh`)

#### Model Download UI
- Show progress bar for model download (qwen3:8b is ~4.7GB)
- Display download speed and estimated time remaining
- Allow cancellation and resume capability
- Show storage space requirements before download

#### Implementation Details
```typescript
// Pseudo-code structure
class OllamaManager {
  async checkInstallation(): Promise<InstallationStatus>
  async installOllama(platform: Platform): Promise<void>
  async startOllamaService(): Promise<void>
  async checkModelExists(modelName: string): Promise<boolean>
  async downloadModel(modelName: string, onProgress: (progress: number) => void): Promise<void>
}
```

### Ollama Integration
- Default Ollama endpoint: `http://localhost:11434`
- API endpoints to use:
  - `/api/generate` - Generate completion
  - `/api/chat` - Chat completion
  - `/api/tags` - List available models
  - `/api/pull` - Pull/download models with progress
- Support for streaming responses using Server-Sent Events

### Electron + Next.js Integration
- Use `electron-builder` for packaging
- Configure Next.js for static export or custom server
- Setup proper IPC type safety with TypeScript
- Handle window management and lifecycle

### Data Persistence
- Store conversations in local JSON files or SQLite
- Save user preferences in Electron's app data directory
- Implement auto-save functionality

## Dependencies

### Core Dependencies
```json
{
  "electron": "^latest",
  "next": "^14.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x"
}
```

### Additional Dependencies
- `electron-builder`: For building and packaging
- `axios` or `fetch`: For Ollama API calls
- `react-markdown`: For markdown rendering
- `react-syntax-highlighter`: For code highlighting
- `zustand` or `jotai`: For state management (optional)

## Prerequisites

### Before Starting Development
1. Install Node.js (v18+ recommended)
2. Install Ollama: https://ollama.ai
3. Pull Qwen3 8B model: `ollama pull qwen3:8b`
4. Verify Ollama is running: `ollama serve`

## Success Criteria
- ✓ Successfully connect to local Ollama instance
- ✓ Send and receive messages with Qwen3 8B
- ✓ Display streaming responses in real-time
- ✓ Save and load conversation history
- ✓ Clean, responsive UI with Tailwind CSS
- ✓ Type-safe codebase with TypeScript
- ✓ Packaged desktop app for target platforms

## Future Enhancements
- Multi-modal support (images, files)
- Voice input/output
- Plugin system for extensions
- Collaborative features (export/share conversations)
- Performance monitoring and optimization

---

# RAG (Retrieval-Augmented Generation) Implementation Plan

## Overview
Add RAG capability to allow the AI to reference user's personal documents (resume, projects, notes, PDFs) when generating responses. This enables personalized assistance like writing cover letters based on your resume, answering questions about your documents, etc.

## Technology Stack Recommendations

### Vector Database: **LanceDB** ✅ RECOMMENDED

**Why LanceDB:**
- ✅ **Serverless/Embedded** - No separate server needed, runs directly in your Electron app
- ✅ **TypeScript Support** - Native TypeScript/Node.js bindings
- ✅ **Zero Configuration** - Works out of the box
- ✅ **Fast** - Built on Apache Arrow, optimized for performance
- ✅ **Local Storage** - Stores data in local files, perfect for Electron
- ✅ **Small Footprint** - Lightweight, won't bloat your app
- ✅ **Free & Open Source** - No licensing concerns

**Comparison:**
| Feature | LanceDB | Chroma | SQLite-VSS |
|---------|---------|--------|------------|
| Setup Complexity | Low | Medium | High |
| TypeScript Support | Excellent | Good | Fair |
| Performance | Excellent | Good | Good |
| Electron Compatible | Yes | Yes | Yes |
| Serverless | Yes | Requires Python | Yes |
| Storage | Local files | Local files | SQLite DB |

### Embedding Model: **nomic-embed-text** ✅ RECOMMENDED

**Why nomic-embed-text:**
- ✅ **Optimized for Ollama** - Designed specifically for Ollama
- ✅ **Fast** - 137M parameters, quick inference
- ✅ **High Quality** - MTEB score of 62.39, excellent for general text
- ✅ **Context Length** - 8192 tokens, handles long documents
- ✅ **Easy to Use** - Just `ollama pull nomic-embed-text`
- ✅ **License** - Apache 2.0, safe for commercial use

**Comparison:**
| Model | Size | MTEB Score | Context Length | Best For |
|-------|------|------------|----------------|----------|
| nomic-embed-text | 137M | 62.39 | 8192 | General text, documents |
| mxbai-embed-large | 335M | 64.68 | 512 | Short passages, high accuracy |
| all-minilm | 33M | 58.00 | 256 | Fast, lightweight |
| bge-large | 335M | 63.98 | 512 | High quality, slower |

**Recommendation:** Start with `nomic-embed-text` for best balance of speed, quality, and compatibility.

## Architecture

### Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     User Uploads Document                    │
│              (PDF, TXT, DOCX, MD, Resume, etc.)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Document Processing                       │
│  • Extract text (pdf-parse, mammoth, etc.)                  │
│  • Clean and normalize text                                  │
│  • Store metadata (filename, upload date, type)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Text Chunking                           │
│  • Split into ~500 token chunks with 50 token overlap       │
│  • Preserve context at chunk boundaries                      │
│  • Keep chunk metadata (source doc, position)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Generate Embeddings                        │
│  • Call Ollama API: POST /api/embeddings                    │
│  • Model: nomic-embed-text                                   │
│  • Output: 768-dimension vectors                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Store in LanceDB                           │
│  • Create table with schema:                                 │
│    - id: string                                              │
│    - text: string (chunk content)                            │
│    - vector: float32[768] (embedding)                        │
│    - metadata: json (source, position, etc.)                │
│  • Build vector index for fast search                        │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                       User Query                             │
│         e.g., "Write a cover letter for Google"             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Generate Query Embedding                     │
│  • Convert query to vector using nomic-embed-text           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Vector Similarity Search (LanceDB)              │
│  • Find top K most similar chunks (K=3-5)                   │
│  • Use cosine similarity or L2 distance                      │
│  • Filter by metadata if needed (doc type, date)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Context Construction                       │
│  • Retrieve full text of matched chunks                     │
│  • Format as context string                                  │
│  • Add source attribution                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Augmented Prompt                          │
│  System: "Use the following information to answer..."       │
│  Context: [Retrieved chunks from resume/docs]               │
│  User Query: "Write a cover letter for Google"              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Send to Ollama                            │
│  • POST /api/chat with augmented prompt                     │
│  • Stream response back to user                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Display Response                           │
│  • Show AI-generated content                                 │
│  • Optionally show "Sources Used" indicator                 │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Document Management (Week 1)
**Goal:** Allow users to upload and manage documents

**Tasks:**
- [ ] Create document upload UI component
  - Drag & drop area
  - File type filters (.pdf, .txt, .docx, .md)
  - File size validation (max 10MB per file)
- [ ] Implement file storage in Electron
  - Store files in app data directory
  - Create SQLite database for document metadata
  - Schema: documents table (id, filename, filepath, type, upload_date, size)
- [ ] Build document library UI
  - List view of uploaded documents
  - Search/filter documents
  - Preview document content
  - Delete documents
- [ ] Add document processing
  - Install `pdf-parse` for PDF extraction
  - Install `mammoth` for DOCX extraction
  - Handle TXT and MD files with fs
  - Store extracted text in metadata DB

**Files to Create:**
```
components/
  ├── DocumentUpload.tsx
  ├── DocumentLibrary.tsx
  ├── DocumentPreview.tsx
  └── DocumentCard.tsx
electron/
  ├── document-manager.ts
  ├── document-processor.ts
  └── database.ts
lib/
  └── document-types.ts
```

### Phase 2: Embedding & Vector Storage (Week 2)
**Goal:** Process documents into embeddings and store in vector DB

**Tasks:**
- [ ] Install and setup LanceDB
  - `npm install vectordb apache-arrow`
  - Initialize LanceDB instance in Electron main process
  - Create tables with proper schema
- [ ] Install nomic-embed-text model
  - Add to setup wizard: `ollama pull nomic-embed-text`
  - Verify model availability on app startup
- [ ] Implement text chunking
  - Chunk size: ~500 tokens (~375 words)
  - Overlap: 50 tokens to preserve context
  - Preserve paragraph boundaries when possible
- [ ] Create embedding generation service
  - API call to Ollama: `POST /api/embeddings`
  - Batch processing for multiple chunks
  - Progress tracking for large documents
- [ ] Store embeddings in LanceDB
  - Create vector index
  - Link embeddings to source documents
  - Handle updates when documents are deleted

**Files to Create:**
```
electron/
  ├── embedding-service.ts
  ├── vector-store.ts
  └── text-chunker.ts
lib/
  └── embedding-types.ts
```

**LanceDB Schema:**
```typescript
interface DocumentChunk {
  id: string;              // Unique chunk ID
  document_id: string;     // Reference to source document
  chunk_index: number;     // Position in original document
  text: string;            // Chunk content
  vector: number[];        // Embedding vector (768 dimensions)
  metadata: {
    filename: string;
    document_type: string;
    upload_date: string;
    char_start: number;
    char_end: number;
  };
}
```

### Phase 3: Retrieval & Context Injection (Week 3)
**Goal:** Search documents and inject context into AI prompts

**Tasks:**
- [ ] Implement semantic search
  - Convert user query to embedding
  - Search LanceDB for top K similar chunks (K=3-5)
  - Score results by cosine similarity
  - Return ranked results with source info
- [ ] Build context construction logic
  - Format retrieved chunks for prompt
  - Add source attribution
  - Truncate if context is too long (respect model context window)
  - Handle no-results case gracefully
- [ ] Modify chat interface for RAG
  - Add "Use Documents" toggle in chat
  - Show "Sources Used" badge when RAG is active
  - Display which documents were referenced
- [ ] Update Ollama integration
  - Inject context into system prompt
  - Handle streaming with augmented prompts
  - Track RAG usage metrics

**Files to Modify/Create:**
```
electron/
  ├── retrieval-service.ts
  ├── context-builder.ts
  └── ollama-client.ts (modify)
components/
  ├── ChatInterface.tsx (modify)
  ├── MessageList.tsx (modify)
  └── SourcesIndicator.tsx
lib/
  └── rag-types.ts
```

**Prompt Template:**
```
System: You are a helpful AI assistant. Use the following context from the user's documents to provide accurate and personalized responses.

Context:
---
[Source: resume.pdf]
{chunk 1 text}

[Source: project_notes.txt]
{chunk 2 text}
---

User Query: {user's question}

Instructions:
- Base your response on the provided context
- If the context doesn't contain relevant information, say so
- Be specific and reference details from the context
```

### Phase 4: UI/UX Enhancements (Week 4)
**Goal:** Polish the RAG experience

**Tasks:**
- [ ] Add RAG settings panel
  - Toggle RAG on/off globally
  - Adjust number of retrieved chunks (K)
  - Select specific documents to search
  - Similarity threshold slider
- [ ] Improve document upload UX
  - Batch upload support
  - Progress bars for processing
  - Success/error notifications
  - Auto-extraction status
- [ ] Add source citations in responses
  - Highlight text from documents
  - Click to view source document
  - Show relevance scores
- [ ] Create document insights
  - Show embedding status (✓ Embedded, ⏳ Processing)
  - Number of chunks per document
  - Last used in query timestamp
- [ ] Performance optimization
  - Cache embeddings
  - Lazy load document library
  - Debounce search queries

**Files to Create:**
```
components/
  ├── RAGSettings.tsx
  ├── SourceCitation.tsx
  ├── DocumentInsights.tsx
  └── ProcessingStatus.tsx
```

### Phase 5: Testing & Edge Cases (Week 5)
**Goal:** Ensure robustness and handle edge cases

**Tasks:**
- [ ] Test with various document types
  - PDFs (text-based and scanned)
  - Large documents (>100 pages)
  - Different encodings
- [ ] Handle errors gracefully
  - Corrupted files
  - Unsupported formats
  - Embedding failures
  - LanceDB connection issues
- [ ] Add data migration support
  - Backup/restore document database
  - Export embeddings
  - Import from other sources
- [ ] Performance testing
  - Large document libraries (100+ docs)
  - Concurrent queries
  - Memory usage profiling
- [ ] Documentation
  - User guide for RAG features
  - Example use cases
  - Troubleshooting guide

## Use Cases

### 1. Resume-Based Cover Letter Writing
```
User uploads: resume.pdf
User query: "Write a cover letter for a Senior Engineer role at Google"

AI retrieves:
- Work experience chunks
- Skills and technologies
- Notable projects

AI generates:
Personalized cover letter highlighting relevant experience from resume
```

### 2. Project Documentation Q&A
```
User uploads: project_spec.pdf, architecture.md, meeting_notes.txt
User query: "What are the main technical requirements for the auth module?"

AI retrieves:
- Auth-related sections from spec
- Architecture decisions
- Notes from auth discussions

AI generates:
Detailed answer based on actual project documents
```

### 3. Personal Knowledge Base
```
User uploads: research_papers.pdf, learning_notes.md, code_snippets.txt
User query: "Explain the algorithm I used for the recommendation system"

AI retrieves:
- Algorithm description from notes
- Code implementation
- Related research

AI generates:
Explanation based on user's own notes and code
```

## Technical Specifications

### Ollama API Endpoints

**Generate Embeddings:**
```bash
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "Your text here"
}'
```

**Response:**
```json
{
  "embedding": [0.123, -0.456, ...],  // 768 dimensions
}
```

### LanceDB Operations

**Create Table:**
```typescript
import * as lancedb from "vectordb";

const db = await lancedb.connect("/path/to/db");
const table = await db.createTable("documents", [
  { id: "1", text: "example", vector: [...], metadata: {} }
]);
```

**Insert Data:**
```typescript
await table.add([
  { id: "chunk1", text: "...", vector: [...], metadata: {...} }
]);
```

**Search:**
```typescript
const results = await table
  .search(queryVector)
  .limit(5)
  .execute();
```

### Text Chunking Strategy

**Approach: Sliding Window with Overlap**
- Chunk size: 500 tokens (~375 words)
- Overlap: 50 tokens (10%)
- Rationale: Balance between context preservation and retrieval granularity

**Example:**
```
Document: "The quick brown fox jumps over the lazy dog. The dog was sleeping..."

Chunk 1: "The quick brown fox jumps over the lazy dog. The dog was..."
Chunk 2: "...lazy dog. The dog was sleeping under a tree..."
         ↑ 50 token overlap ↑
```

## Dependencies

### New Dependencies to Add
```json
{
  "dependencies": {
    "vectordb": "^0.4.x",      // LanceDB
    "apache-arrow": "^14.x",    // Required by LanceDB
    "pdf-parse": "^1.1.x",      // PDF text extraction
    "mammoth": "^1.6.x",        // DOCX to text
    "better-sqlite3": "^9.x"    // Metadata storage
  }
}
```

### Ollama Models to Pull
```bash
ollama pull nomic-embed-text
```

## Storage Requirements

### Per Document Estimates
- **Original Document**: Variable (1MB - 10MB typical)
- **Extracted Text**: ~1/10 of original size
- **Embeddings**: ~3KB per chunk
- **Metadata**: ~1KB per document

### Example: 100 Documents
- Documents: ~500MB
- Embeddings (avg 20 chunks/doc): ~6MB
- Metadata: ~100KB
- **Total**: ~506MB

## Performance Considerations

### Embedding Generation Speed
- **nomic-embed-text**: ~100 tokens/sec on M1 Mac
- **500 token chunk**: ~5 seconds
- **20 chunks (typical document)**: ~100 seconds (~1.5 minutes)

### Search Performance
- **Vector search in LanceDB**: <100ms for 1000s of documents
- **Ollama embedding generation**: ~500ms per query
- **Total query time**: <1 second

### Optimization Strategies
1. **Batch Embedding**: Process multiple chunks in parallel
2. **Background Processing**: Embed documents in background, not blocking UI
3. **Caching**: Cache frequently used embeddings
4. **Incremental Updates**: Only re-embed changed documents

## Security & Privacy

### Data Protection
- ✅ All data stored locally (no cloud)
- ✅ Embeddings never leave the machine
- ✅ Documents encrypted at rest (optional)
- ✅ No telemetry or tracking

### User Control
- ✅ Users can delete documents and embeddings anytime
- ✅ Clear data boundaries (what's stored, what's processed)
- ✅ Transparent about which documents are used in responses

## Success Metrics

### Phase 1 Success:
- [ ] Users can upload documents successfully
- [ ] Documents appear in library
- [ ] Text extraction works for PDF, DOCX, TXT

### Phase 2 Success:
- [ ] Documents are chunked appropriately
- [ ] Embeddings generated without errors
- [ ] LanceDB stores and retrieves vectors

### Phase 3 Success:
- [ ] Queries return relevant document chunks
- [ ] AI responses incorporate document context
- [ ] Source attribution works

### Phase 4 Success:
- [ ] UI is intuitive and responsive
- [ ] Users can control RAG behavior
- [ ] Performance is acceptable (<1s queries)

### Overall Success:
- [ ] Generate accurate cover letters from resume
- [ ] Answer questions about uploaded documents
- [ ] Users find RAG useful and use it regularly

## Next Steps

1. Review this plan and get approval
2. Set up development environment with LanceDB
3. Pull nomic-embed-text model: `ollama pull nomic-embed-text`
4. Start with Phase 1: Document Management
5. Iterate and gather feedback after each phase

---

# Model Selection & Management Feature

## Overview
Allow users to detect, select, and persist their preferred Ollama model on first launch and anytime thereafter. Display model recommendations with hardware requirements to help users make informed decisions.

## Problem Statement
Currently, the app is hardcoded to use `qwen3:8b`. Users should be able to:
- See which models are available on their system
- Choose their preferred model
- Get recommendations for lightweight models
- Understand hardware requirements before selecting a model
- Have their selection persisted across app restarts

## Solution Architecture

### 1. Ollama API Integration

**Ollama API Endpoints:**
```bash
# List installed models
GET http://localhost:11434/api/tags

Response:
{
  "models": [
    {
      "name": "qwen3:8b",
      "modified_at": "2024-10-13T12:00:00Z",
      "size": 4661224448,
      "digest": "abc123...",
      "details": {
        "format": "gguf",
        "family": "qwen",
        "families": ["qwen"],
        "parameter_size": "8B",
        "quantization_level": "Q4_0"
      }
    }
  ]
}

# Show model details
POST http://localhost:11434/api/show
{
  "name": "qwen3:8b"
}
```

### 2. Data Persistence Strategy

**Option 1: Electron Store (RECOMMENDED)**
```bash
npm install electron-store
```

Advantages:
- ✅ Type-safe with TypeScript
- ✅ Automatic encryption support
- ✅ JSON storage in user's app data directory
- ✅ Automatic migration support
- ✅ Simple API

**Storage Schema:**
```typescript
interface AppConfig {
  selectedModel: string;           // e.g., "qwen3:8b"
  lastModelCheck: string;          // ISO timestamp
  ollamaBaseUrl: string;           // Default: "http://localhost:11434"
  userPreferences: {
    autoSelectModel: boolean;      // Auto-select if only one model
    showHardwareWarnings: boolean; // Warn if model too large
  };
}
```

**Storage Location:**
- **macOS**: `~/Library/Application Support/personal-ai/config.json`
- **Windows**: `%APPDATA%\personal-ai\config.json`
- **Linux**: `~/.config/personal-ai/config.json`

**Option 2: localStorage (Alternative)**
- Simpler but less secure
- Stored in browser context
- Good for web-based preferences

### 3. User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      App First Launch                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Check if model │
              │ is configured  │
              └────────┬───────┘
                       │
          ┌────────────┴────────────┐
          │                         │
      No  │                         │ Yes
          ▼                         ▼
┌──────────────────┐      ┌─────────────────┐
│ Show Model       │      │ Load saved      │
│ Selection Dialog │      │ model & start   │
└────────┬─────────┘      └─────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Fetch Available Models from Ollama  │
│ GET /api/tags                        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Parse & Display Models               │
│ - Installed models (highlighted)     │
│ - Recommended models (with download) │
│ - Hardware requirements              │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ User Selects Model                   │
└────────┬─────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Installed  Not Installed
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Offer to     │
    │    │ Download     │
    │    │ (pull model) │
    │    └──────┬───────┘
    │           │
    └───────────┴─────────────┐
                              ▼
                    ┌──────────────────┐
                    │ Save to Config   │
                    │ (electron-store) │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Initialize Chat  │
                    │ with Selected    │
                    │ Model            │
                    └──────────────────┘
```

### 4. Model Recommendations Database

**Curated Model List with Hardware Specs:**

```typescript
interface ModelRecommendation {
  name: string;
  displayName: string;
  description: string;
  size: number; // in bytes
  parameterSize: string; // e.g., "8B"
  recommended: boolean;
  category: 'lightweight' | 'balanced' | 'powerful';
  hardwareRequirements: {
    minRAM: string;
    recommendedRAM: string;
    minVRAM?: string; // GPU memory
    cpuOnly: boolean;
    approxSpeed: string; // e.g., "~30 tokens/sec on M1"
  };
  useCases: string[];
}

const MODEL_CATALOG: ModelRecommendation[] = [
  {
    name: 'qwen2.5:0.5b',
    displayName: 'Qwen 2.5 (0.5B)',
    description: 'Ultra-lightweight model, great for simple tasks',
    size: 397000000, // ~397MB
    parameterSize: '0.5B',
    recommended: true,
    category: 'lightweight',
    hardwareRequirements: {
      minRAM: '2GB',
      recommendedRAM: '4GB',
      cpuOnly: true,
      approxSpeed: '~100 tokens/sec on modern CPU'
    },
    useCases: ['Quick responses', 'Simple Q&A', 'Code completion']
  },
  {
    name: 'qwen2.5:1.5b',
    displayName: 'Qwen 2.5 (1.5B)',
    description: 'Lightweight and fast, good balance',
    size: 934000000, // ~934MB
    parameterSize: '1.5B',
    recommended: true,
    category: 'lightweight',
    hardwareRequirements: {
      minRAM: '4GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~60 tokens/sec on modern CPU'
    },
    useCases: ['General chat', 'Basic reasoning', 'Content generation']
  },
  {
    name: 'qwen2.5:3b',
    displayName: 'Qwen 2.5 (3B)',
    description: 'Balanced performance and quality',
    size: 1870000000, // ~1.87GB
    parameterSize: '3B',
    recommended: true,
    category: 'balanced',
    hardwareRequirements: {
      minRAM: '6GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~40 tokens/sec on modern CPU'
    },
    useCases: ['Detailed responses', 'Code writing', 'Analysis']
  },
  {
    name: 'qwen2.5:7b',
    displayName: 'Qwen 2.5 (7B)',
    description: 'High quality responses, good for most tasks',
    size: 4370000000, // ~4.37GB
    parameterSize: '7B',
    recommended: true,
    category: 'balanced',
    hardwareRequirements: {
      minRAM: '8GB',
      recommendedRAM: '16GB',
      minVRAM: '6GB',
      cpuOnly: false,
      approxSpeed: '~30 tokens/sec on M1, ~20 tokens/sec CPU'
    },
    useCases: ['Complex reasoning', 'Long-form content', 'Technical writing']
  },
  {
    name: 'llama3.2:1b',
    displayName: 'Llama 3.2 (1B)',
    description: 'Meta\'s lightweight model, very fast',
    size: 1300000000, // ~1.3GB
    parameterSize: '1B',
    recommended: true,
    category: 'lightweight',
    hardwareRequirements: {
      minRAM: '4GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~70 tokens/sec on modern CPU'
    },
    useCases: ['Quick chat', 'Simple tasks', 'Low-resource devices']
  },
  {
    name: 'llama3.2:3b',
    displayName: 'Llama 3.2 (3B)',
    description: 'Meta\'s balanced model',
    size: 2000000000, // ~2GB
    parameterSize: '3B',
    recommended: true,
    category: 'balanced',
    hardwareRequirements: {
      minRAM: '6GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~45 tokens/sec on modern CPU'
    },
    useCases: ['General purpose', 'Good quality', 'Reasonable speed']
  },
  {
    name: 'phi3:3.8b',
    displayName: 'Phi-3 (3.8B)',
    description: 'Microsoft\'s efficient model',
    size: 2300000000, // ~2.3GB
    parameterSize: '3.8B',
    recommended: true,
    category: 'balanced',
    hardwareRequirements: {
      minRAM: '6GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~40 tokens/sec on modern CPU'
    },
    useCases: ['Code generation', 'Technical Q&A', 'Reasoning']
  },
  {
    name: 'gemma2:2b',
    displayName: 'Gemma 2 (2B)',
    description: 'Google\'s lightweight model',
    size: 1600000000, // ~1.6GB
    parameterSize: '2B',
    recommended: true,
    category: 'lightweight',
    hardwareRequirements: {
      minRAM: '4GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~50 tokens/sec on modern CPU'
    },
    useCases: ['Chat', 'Q&A', 'Content creation']
  },
];
```

## Implementation Phases

### Phase 1: Core Model Detection (Week 1)

**Tasks:**
- [ ] Install `electron-store` for config persistence
- [ ] Create `ModelManager` class in Electron main process
  - Fetch available models from Ollama
  - Parse model metadata (size, parameter count, etc.)
  - Map models to hardware requirements
- [ ] Update `OllamaClient` to accept dynamic model
- [ ] Add IPC handlers for model operations
  - `get-available-models`
  - `get-selected-model`
  - `set-selected-model`
- [ ] Create config store with TypeScript schema
- [ ] Add model validation (check if model exists before using)

**Files to Create/Modify:**
```
electron/
  ├── model-manager.ts (new)
  ├── config-store.ts (new)
  ├── ollama-client.ts (modify)
  └── main.ts (modify - add IPC handlers)
lib/
  ├── model-types.ts (new)
  └── model-catalog.ts (new)
```

**Code Structure:**
```typescript
// electron/model-manager.ts
export class ModelManager {
  async getAvailableModels(): Promise<OllamaModel[]>
  async getModelDetails(modelName: string): Promise<ModelDetails>
  async pullModel(modelName: string, onProgress: (progress: number) => void): Promise<void>
  getRecommendedModels(): ModelRecommendation[]
  validateModel(modelName: string): Promise<boolean>
}

// electron/config-store.ts
export class ConfigStore {
  getSelectedModel(): string | null
  setSelectedModel(modelName: string): void
  getOllamaBaseUrl(): string
  setOllamaBaseUrl(url: string): void
  getUserPreferences(): UserPreferences
  setUserPreferences(prefs: UserPreferences): void
}
```

### Phase 2: Model Selection UI (Week 2)

**Tasks:**
- [ ] Create Model Selection Dialog component
  - List installed models (with green checkmark)
  - List recommended models (with download button)
  - Display hardware requirements for each model
  - Show estimated download size
  - Add filter/search functionality
- [ ] Create ModelCard component
  - Display model name, description
  - Show hardware requirements badge
  - Show size and parameter count
  - Add "Select" or "Download" button
- [ ] Implement first-launch detection
  - Check if model is configured
  - Show dialog on first launch or if model invalid
- [ ] Add model download progress UI
  - Progress bar with percentage
  - Download speed and ETA
  - Cancel button
- [ ] Add "Change Model" option in settings

**Files to Create:**
```
components/
  ├── ModelSelectionDialog.tsx
  ├── ModelCard.tsx
  ├── ModelDownloadProgress.tsx
  ├── HardwareRequirementsBadge.tsx
  └── FirstLaunchWizard.tsx
hooks/
  └── useModelSelection.ts
```

**UI Mockup:**
```
┌─────────────────────────────────────────────────────┐
│  Select Your AI Model                          [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Choose a model to start chatting. We recommend    │
│  starting with a lightweight model if you're        │
│  unsure about your hardware.                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ Search models...                        🔍  │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────── Lightweight (Recommended) ─────┐  │
│  │                                              │  │
│  │ ✓ Qwen 2.5 (1.5B)                  [SELECT] │  │
│  │   Fast responses, minimal resources          │  │
│  │   📦 934MB  💾 4GB RAM  ⚡ ~60 tok/s        │  │
│  │                                              │  │
│  │   Llama 3.2 (1B)                [DOWNLOAD]  │  │
│  │   Ultra-fast, great for laptops              │  │
│  │   📦 1.3GB  💾 4GB RAM  ⚡ ~70 tok/s        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────── Balanced ─────────────────┐   │
│  │                                              │  │
│  │   Qwen 2.5 (3B)                 [DOWNLOAD]  │  │
│  │   Best quality/performance balance           │  │
│  │   📦 1.87GB  💾 8GB RAM  ⚡ ~40 tok/s       │  │
│  │                                              │  │
│  │ ✓ Qwen 2.5 (7B)                    [SELECT] │  │
│  │   High quality, needs more resources         │  │
│  │   📦 4.37GB  💾 16GB RAM  ⚡ ~30 tok/s      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  [ Show Advanced Models ]                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Phase 3: Model Switching & Management (Week 3)

**Tasks:**
- [ ] Add model switcher in app header/settings
- [ ] Implement hot-swap (switch model without restart)
- [ ] Add model health check (test if model works)
- [ ] Show current model in UI (status bar or header)
- [ ] Add model usage statistics
  - Track tokens generated
  - Average response time
  - Last used timestamp
- [ ] Implement model download queue
  - Download multiple models
  - Pause/resume downloads
  - Cancel downloads

**Files to Create/Modify:**
```
components/
  ├── ModelSwitcher.tsx (new)
  ├── ModelStatusBadge.tsx (new)
  └── Settings.tsx (modify)
electron/
  └── model-manager.ts (modify - add stats tracking)
```

### Phase 4: Advanced Features (Week 4)

**Tasks:**
- [ ] Add model performance benchmarking
  - Test response time on user's hardware
  - Compare with expected performance
  - Suggest better model if current is slow
- [ ] Implement model auto-updates
  - Check for model updates
  - Notify user of newer versions
  - One-click update
- [ ] Add model tags/categories
  - Filter by use case (coding, creative, general)
  - Star/favorite models
  - Custom tags
- [ ] Create model comparison tool
  - Side-by-side comparison
  - Test same prompt on different models
  - Show speed and quality differences

## Technical Specifications

### Ollama Model Naming Convention
```
<model-name>:<version>-<size>-<quantization>

Examples:
- qwen2.5:latest
- qwen2.5:7b
- qwen2.5:7b-q4_0
- llama3.2:3b-instruct
```

### Model Size Calculations
```typescript
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function estimateRAMRequirement(parameterSize: string): string {
  const sizeMap: Record<string, string> = {
    '0.5B': '2-4GB',
    '1B': '4GB',
    '1.5B': '4-8GB',
    '2B': '4-8GB',
    '3B': '6-8GB',
    '7B': '8-16GB',
    '13B': '16-32GB',
    '70B': '64GB+'
  };
  return sizeMap[parameterSize] || 'Unknown';
}
```

### Config Store Schema
```typescript
// electron/config-store.ts
import Store from 'electron-store';

interface AppConfig {
  version: string;
  selectedModel: string;
  lastModelCheck: string;
  ollamaBaseUrl: string;
  userPreferences: {
    autoSelectModel: boolean;
    showHardwareWarnings: boolean;
    preferredCategory: 'lightweight' | 'balanced' | 'powerful';
    enableAutoUpdates: boolean;
  };
  modelStats: Record<string, {
    totalTokens: number;
    totalRequests: number;
    lastUsed: string;
    averageResponseTime: number;
  }>;
}

const schema = {
  version: { type: 'string', default: '1.0.0' },
  selectedModel: { type: 'string', default: null },
  lastModelCheck: { type: 'string', default: null },
  ollamaBaseUrl: { type: 'string', default: 'http://localhost:11434' },
  // ... more schema definitions
};

export const configStore = new Store<AppConfig>({
  schema,
  name: 'config',
});
```

## Dependencies

### New Dependencies to Add
```json
{
  "dependencies": {
    "electron-store": "^8.x"
  }
}
```

## User Benefits

✅ **Choice & Flexibility** - Users can select models that fit their hardware
✅ **Transparency** - Clear hardware requirements help users make informed decisions
✅ **Performance** - Lighter models mean faster responses on modest hardware
✅ **Convenience** - One-click model switching without restarting app
✅ **Future-proof** - Easy to add new models as they're released

## Success Criteria

- [ ] Users can see all available models on their system
- [ ] First-launch wizard successfully guides users to select a model
- [ ] Model selection persists across app restarts
- [ ] Hardware requirements are displayed clearly
- [ ] Model download works with progress indication
- [ ] Users can switch models without issues
- [ ] Lightweight models are prominently recommended
- [ ] App gracefully handles missing or invalid models

## Next Steps

1. Review and approve this feature plan
2. Install `electron-store` dependency
3. Start Phase 1: Core Model Detection
4. Build model catalog with latest Ollama models
5. Test with multiple models on different hardware
