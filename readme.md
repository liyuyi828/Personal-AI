# Personal AI

A modern desktop application for chatting with local LLMs using Ollama, built with Electron, Next.js, and TypeScript.

![Personal AI](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/electron-38.2.2-green)
![Next.js](https://img.shields.io/badge/next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)

## ✨ Features

### 🤖 Smart Model Selection
- **12 curated models** from the latest 2025 releases
- **Intelligent recommendations** based on your hardware
- **One-click download** with real-time progress tracking
- **Persistent model settings** that remember your choice
- **Category filtering**: Lightweight, Balanced, and Powerful models

### 🎨 Modern UI
- **Real-time streaming** chat responses
- **Beautiful interface** built with Tailwind CSS 4
- **Message formatting** with markdown support
- **Model selector** in header for quick switching
- **Connection status** indicator

### ⚡ Performance
- **Automatic Ollama startup** - App starts Ollama if not running
- **Request/response logging** for debugging
- **Performance metrics** showing tokens/sec
- **Efficient streaming** for fast responses

## 📦 Supported Models

| Model | Size | Category | RAM | Speed | Best For |
|-------|------|----------|-----|-------|----------|
| **Gemma 3 (270M)** | 292MB | Lightweight | 2-4GB | ~120 tok/s | Ultra-fast, simple tasks |
| **Qwen 3 (0.6B)** | 523MB | Lightweight | 2-4GB | ~100 tok/s | Basic tasks, code completion |
| **Gemma 3 (1B)** | 815MB | Lightweight | 4-8GB | ~80 tok/s | General chat, content creation |
| **Llama 3.2 (1B)** | 1.3GB | Lightweight | 4-8GB | ~70 tok/s | Quick chat, low-resource |
| **Qwen 3 (1.7B)** | 1.4GB | Lightweight | 4-8GB | ~60 tok/s | General chat, reasoning |
| **Llama 3.2 (3B)** | 2GB | Balanced | 6-8GB | ~45 tok/s | General purpose |
| **Phi-3 (3.8B)** | 2.3GB | Balanced | 6-8GB | ~40 tok/s | **Code generation** |
| **Qwen 3 (4B)** | 2.5GB | Balanced | 6-8GB | ~40 tok/s | 256K context, long docs |
| **Gemma 3 (4B)** | 3.3GB | Balanced | 8-12GB | ~35 tok/s | **Multimodal (images)** |
| **Qwen 3 (8B)** | 5.2GB | Balanced | 8-16GB | ~30 tok/s | High quality, complex tasks |
| **Qwen 3 (14B)** | 9.3GB | Powerful | 16-24GB | ~20 tok/s | Professional writing |
| **Gemma 3 (12B)** | 8.1GB | Powerful | 16-24GB | ~18 tok/s | **Advanced multimodal** |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Ollama** ([Download](https://ollama.ai))

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/personal-ai.git
cd personal-ai

# Install dependencies
npm install

# Start the app
npm run dev
\`\`\`

The app will:
- ✅ Automatically start Ollama if it's not running
- ✅ Open the chat interface
- ✅ Prompt you to select a model on first launch

## 📖 Usage

### First Launch

1. **App starts** and automatically launches Ollama
2. **Model selection dialog** appears
3. Choose a model based on your hardware
4. **Start chatting!**

### Selecting a Model

Click the model name in the header to open the model selector with categories:
- **Lightweight**: For laptops (2-8GB RAM)
- **Balanced**: For desktops (6-16GB RAM)
- **Powerful**: For workstations (16GB+ RAM)

## 🛠️ Development

\`\`\`bash
npm run dev              # Start dev server (Next.js + Electron)
npm run build            # Build for production
npm start                # Run production build
\`\`\`

## 🐛 Troubleshooting

**Ollama won't start?**
\`\`\`bash
ollama serve
\`\`\`

**Check logs** in the terminal for debugging information

## 📝 Configuration

Settings are stored in:
- **macOS**: \`~/Library/Application Support/personal-ai/config.json\`
- **Windows**: \`%APPDATA%\\personal-ai\\config.json\`
- **Linux**: \`~/.config/personal-ai/config.json\`

## 🎯 Roadmap

See [planning.md](planning.md) for the complete roadmap.

- ✅ Phase 1: Core functionality (COMPLETE)
- 🚧 Phase 2: Enhanced features (In Progress)
- 📅 Phase 3: Advanced features (Planned)

## 📄 License

MIT

---

**Built with ❤️ using Electron, Next.js, and TypeScript**
