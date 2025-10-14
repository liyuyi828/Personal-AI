import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
const electronAPI = {
  sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),
  onMessageChunk: (callback: (chunk: string) => void) => {
    ipcRenderer.on('message-chunk', (_event, chunk) => callback(chunk));
  },
  removeMessageChunkListener: () => {
    ipcRenderer.removeAllListeners('message-chunk');
  },
  checkOllamaStatus: () => ipcRenderer.invoke('check-ollama-status'),
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;