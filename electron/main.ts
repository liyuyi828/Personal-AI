import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';
import { ollamaClient, OllamaMessage } from './ollama-client';

let mainWindow: BrowserWindow | null = null;
const conversationHistory: OllamaMessage[] = [];

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

app.whenReady().then(() => {
  createWindow();

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

export {};