export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ElectronAPI {
  sendMessage: (message: string) => Promise<{ success: boolean; error?: string }>;
  onMessageChunk: (callback: (chunk: string) => void) => void;
  removeMessageChunkListener: () => void;
  checkOllamaStatus: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}