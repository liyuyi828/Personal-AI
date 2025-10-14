import { contextBridge, ipcRenderer } from 'electron';
import { ModelPullProgress } from './lib/model-types';

// Define the API that will be exposed to the renderer process
const electronAPI = {
  // Chat APIs
  sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),
  onMessageChunk: (callback: (chunk: string) => void) => {
    ipcRenderer.on('message-chunk', (_event, chunk) => callback(chunk));
  },
  removeMessageChunkListener: () => {
    ipcRenderer.removeAllListeners('message-chunk');
  },
  checkOllamaStatus: () => ipcRenderer.invoke('check-ollama-status'),
  startOllama: () => ipcRenderer.invoke('start-ollama'),

  // Model management APIs
  getAvailableModels: () => ipcRenderer.invoke('get-available-models'),
  getModelsWithRecommendations: () => ipcRenderer.invoke('get-models-with-recommendations'),
  getRecommendedModels: () => ipcRenderer.invoke('get-recommended-models'),
  getSelectedModel: () => ipcRenderer.invoke('get-selected-model'),
  selectModel: (modelName: string) => ipcRenderer.invoke('select-model', modelName),
  isModelInstalled: (modelName: string) => ipcRenderer.invoke('is-model-installed', modelName),
  pullModel: (modelName: string) => ipcRenderer.invoke('pull-model', modelName),
  isModelConfigured: () => ipcRenderer.invoke('is-model-configured'),

  // Model pull progress listener
  onModelPullProgress: (callback: (progress: ModelPullProgress) => void) => {
    ipcRenderer.on('model-pull-progress', (_event, progress) => callback(progress));
  },
  removeModelPullProgressListener: () => {
    ipcRenderer.removeAllListeners('model-pull-progress');
  },

  // User preferences APIs
  getUserPreferences: () => ipcRenderer.invoke('get-user-preferences'),
  updateUserPreferences: (preferences: any) => ipcRenderer.invoke('update-user-preferences', preferences),

  // Chat history APIs
  createChatSession: (name: string) => ipcRenderer.invoke('create-chat-session', name),
  getAllChatSessions: () => ipcRenderer.invoke('get-all-chat-sessions'),
  getChatSessionWithMessages: (chatId: number) => ipcRenderer.invoke('get-chat-session-with-messages', chatId),
  addChatMessage: (chatId: number, role: 'user' | 'assistant', content: string) =>
    ipcRenderer.invoke('add-chat-message', chatId, role, content),
  updateChatSessionName: (chatId: number, name: string) =>
    ipcRenderer.invoke('update-chat-session-name', chatId, name),
  deleteChatSession: (chatId: number) => ipcRenderer.invoke('delete-chat-session', chatId),
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;