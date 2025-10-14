export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'qwen3:8b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  // Set the model dynamically
  setModel(model: string): void {
    this.model = model;
  }

  // Get the current model
  getModel(): string {
    return this.model;
  }

  // Set the base URL dynamically
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  // Get the current base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }

  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama is not running:', error);
      return false;
    }
  }

  async chat(
    messages: OllamaMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      // Get the latest user message for logging
      const latestUserMessage = messages.filter(m => m.role === 'user').pop();
      const userPrompt = latestUserMessage?.content || 'No prompt';

      // Log request details
      console.log('\n==================== LLM REQUEST ====================');
      console.log(`Model: ${this.model}`);
      console.log(`URL: ${this.baseUrl}/api/chat`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`\nUser Prompt:\n${userPrompt}`);
      console.log(`\nConversation History (${messages.length} messages):`);
      messages.forEach((msg, idx) => {
        const preview = msg.content.length > 100
          ? msg.content.substring(0, 100) + '...'
          : msg.content;
        console.log(`  ${idx + 1}. [${msg.role}]: ${preview}`);
      });
      console.log('=====================================================\n');

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      const startTime = Date.now();
      let tokenCount = 0;
      let responseComplete = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const json: OllamaResponse = JSON.parse(line);
            if (json.message?.content) {
              tokenCount++;
              onChunk(json.message.content);
            }
            if (json.done) {
              responseComplete = true;
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }

      // Log completion
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const tokensPerSecond = (tokenCount / parseFloat(duration)).toFixed(2);
      console.log('==================== LLM RESPONSE COMPLETE ====================');
      console.log(`Model: ${this.model}`);
      console.log(`Duration: ${duration}s`);
      console.log(`Chunks received: ${tokenCount}`);
      console.log(`Speed: ~${tokensPerSecond} chunks/sec`);
      console.log(`Status: ${responseComplete ? 'Success' : 'Incomplete'}`);
      console.log('===============================================================\n');

    } catch (error) {
      console.error('\n==================== LLM REQUEST FAILED ====================');
      console.error(`Model: ${this.model}`);
      console.error(`Error: ${error}`);
      console.error('============================================================\n');
      throw error;
    }
  }
}

export const ollamaClient = new OllamaClient();