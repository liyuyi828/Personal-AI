import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';
import { ollamaClient, OllamaMessage } from './ollama-client';
import { modelManager } from './model-manager';
import { configManager } from './config-store';

let mainWindow: BrowserWindow | null = null;
const conversationHistory: OllamaMessage[] = [];

// Initialize model on app startup
async function initializeModel() {
  try {
    const selectedModel = configManager.getSelectedModel();

    if (selectedModel) {
      // Check if the selected model is still available
      const isValid = await modelManager.isConfiguredModelValid();
      if (isValid) {
        ollamaClient.setModel(selectedModel);
        console.log(`Initialized with model: ${selectedModel}`);
        return;
      } else {
        console.warn(`Selected model ${selectedModel} is no longer available`);
      }
    }

    // Try to auto-select a model if configured to do so
    const preferences = configManager.getUserPreferences();
    if (preferences.autoSelectModel) {
      const autoSelected = await modelManager.autoSelectModel();
      if (autoSelected) {
        ollamaClient.setModel(autoSelected);
        console.log(`Auto-selected model: ${autoSelected}`);
        return;
      }
    }

    console.log('No model configured, user will need to select one');
  } catch (error) {
    console.error('Error initializing model:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:8899'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  createWindow();

  // Initialize model on startup
  await initializeModel();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('check-ollama-status', async () => {
  return await ollamaClient.checkStatus();
});

ipcMain.handle('send-message', async (_event, message: string) => {
  try {
    // Add user message to history
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    let assistantMessage = '';

    // Send to Ollama and stream response
    await ollamaClient.chat(conversationHistory, (chunk) => {
      assistantMessage += chunk;
      // Send chunk to renderer process
      if (mainWindow) {
        mainWindow.webContents.send('message-chunk', chunk);
      }
    });

    // Add complete assistant message to history
    conversationHistory.push({
      role: 'assistant',
      content: assistantMessage,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: String(error) };
  }
});

// Model management IPC handlers

ipcMain.handle('get-available-models', async () => {
  try {
    const models = await modelManager.getAvailableModels();
    return { success: true, models };
  } catch (error) {
    console.error('Error getting available models:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('get-models-with-recommendations', async () => {
  try {
    const models = await modelManager.getModelsWithRecommendations();
    return { success: true, models };
  } catch (error) {
    console.error('Error getting models with recommendations:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('get-recommended-models', async () => {
  try {
    const models = modelManager.getRecommendedModels();
    return { success: true, models };
  } catch (error) {
    console.error('Error getting recommended models:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('get-selected-model', async () => {
  try {
    const model = configManager.getSelectedModel();
    return { success: true, model };
  } catch (error) {
    console.error('Error getting selected model:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('select-model', async (_event, modelName: string) => {
  try {
    await modelManager.selectModel(modelName);
    ollamaClient.setModel(modelName);
    return { success: true };
  } catch (error) {
    console.error('Error selecting model:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('is-model-installed', async (_event, modelName: string) => {
  try {
    const installed = await modelManager.isModelInstalled(modelName);
    return { success: true, installed };
  } catch (error) {
    console.error('Error checking model installation:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('pull-model', async (_event, modelName: string) => {
  try {
    await modelManager.pullModel(modelName, (progress) => {
      // Send progress updates to renderer
      if (mainWindow) {
        mainWindow.webContents.send('model-pull-progress', progress);
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error pulling model:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('is-model-configured', async () => {
  try {
    const configured = configManager.isModelConfigured();
    return { success: true, configured };
  } catch (error) {
    console.error('Error checking model configuration:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('get-user-preferences', async () => {
  try {
    const preferences = configManager.getUserPreferences();
    return { success: true, preferences };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('update-user-preferences', async (_event, preferences) => {
  try {
    configManager.setUserPreferences(preferences);
    return { success: true };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { success: false, error: String(error) };
  }
});

export {};