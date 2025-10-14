import { spawn, ChildProcess } from 'child_process';

export class OllamaService {
  private ollamaProcess: ChildProcess | null = null;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if Ollama is running by pinging the API
   */
  async isRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start Ollama service by running "ollama serve"
   */
  async startService(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('\n==================== STARTING OLLAMA ====================');
      console.log('Attempting to start Ollama service...');

      // Check if already running
      const running = await this.isRunning();
      if (running) {
        console.log('Ollama is already running');
        console.log('=========================================================\n');
        return {
          success: true,
          message: 'Ollama is already running'
        };
      }

      // Start Ollama serve process
      this.ollamaProcess = spawn('ollama', ['serve'], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      console.log(`Started Ollama process with PID: ${this.ollamaProcess.pid}`);

      // Capture output for debugging
      this.ollamaProcess.stdout?.on('data', (data) => {
        console.log(`[Ollama stdout]: ${data.toString().trim()}`);
      });

      this.ollamaProcess.stderr?.on('data', (data) => {
        console.log(`[Ollama stderr]: ${data.toString().trim()}`);
      });

      this.ollamaProcess.on('error', (error) => {
        console.error(`[Ollama error]: ${error.message}`);
      });

      this.ollamaProcess.on('exit', (code, signal) => {
        console.log(`[Ollama exited]: code=${code}, signal=${signal}`);
        this.ollamaProcess = null;
      });

      // Unref so the process can continue running independently
      this.ollamaProcess.unref();

      // Wait for Ollama to be ready (max 10 seconds)
      const maxWaitTime = 10000; // 10 seconds
      const checkInterval = 500; // Check every 500ms
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));

        const isReady = await this.isRunning();
        if (isReady) {
          const waitTime = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log(`Ollama is ready! (took ${waitTime}s)`);
          console.log('=========================================================\n');
          return {
            success: true,
            message: `Ollama started successfully in ${waitTime}s`
          };
        }
      }

      console.warn('Ollama started but not responding yet. It may still be initializing.');
      console.log('=========================================================\n');
      return {
        success: true,
        message: 'Ollama started but still initializing. Please wait a moment.'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to start Ollama:', errorMessage);
      console.log('=========================================================\n');
      return {
        success: false,
        message: `Failed to start Ollama: ${errorMessage}`
      };
    }
  }

  /**
   * Stop the Ollama service (if started by this app)
   */
  stopService(): void {
    if (this.ollamaProcess && !this.ollamaProcess.killed) {
      console.log('Stopping Ollama service...');
      this.ollamaProcess.kill();
      this.ollamaProcess = null;
    }
  }

  /**
   * Get the current status of Ollama
   */
  async getStatus(): Promise<{
    running: boolean;
    managedByApp: boolean;
    pid?: number;
  }> {
    const running = await this.isRunning();
    return {
      running,
      managedByApp: this.ollamaProcess !== null,
      pid: this.ollamaProcess?.pid
    };
  }
}

export const ollamaService = new OllamaService();
