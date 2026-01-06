import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as http from 'http';
import { ModelManager } from './modelManager';
import { DatabaseManager } from './database';

let mainWindow: BrowserWindow | null = null;
const modelManager = new ModelManager();
const dbManager = new DatabaseManager();

async function initializeApp() {
  await dbManager.initialize();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from dist folder (same level as main.js)
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIpcHandlers() {
  ipcMain.handle('model:isFirstRun', async () => {
    return await modelManager.isFirstRun();
  });

  ipcMain.handle('model:isDownloaded', async () => {
    return await modelManager.isModelDownloaded();
  });

  ipcMain.handle('model:download', async (event) => {
    return new Promise((resolve, reject) => {
      modelManager.downloadModel((progress) => {
        event.sender.send('model:downloadProgress', progress);
      })
      .then(() => resolve(true))
      .catch((error) => reject(error));
    });
  });

  ipcMain.handle('model:getConfig', async () => {
    return await modelManager.getModelConfig();
  });

  ipcMain.handle('ollama:generate', async (_event, payload) => {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: '127.0.0.1',
        port: 11434,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Failed to parse Ollama response: ${error}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Ollama API error:', error);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  });

  ipcMain.handle('db:getAllConversations', async () => {
    return dbManager.getAllConversations();
  });

  ipcMain.handle('db:getConversation', async (_event, id: string) => {
    return dbManager.getConversation(id);
  });

  ipcMain.handle('db:createConversation', async (_event, conversation) => {
    dbManager.createConversation(conversation);
    return true;
  });

  ipcMain.handle('db:updateConversation', async (_event, id: string, title: string, updatedAt: number) => {
    dbManager.updateConversation(id, title, updatedAt);
    return true;
  });

  ipcMain.handle('db:deleteConversation', async (_event, id: string) => {
    dbManager.deleteConversation(id);
    return true;
  });

  ipcMain.handle('db:getMessages', async (_event, conversationId: string) => {
    return dbManager.getMessages(conversationId);
  });

  ipcMain.handle('db:createMessage', async (_event, message) => {
    dbManager.createMessage(message);
    return true;
  });

  ipcMain.handle('db:getConversationWithMessages', async (_event, id: string) => {
    return dbManager.getConversationWithMessages(id);
  });
}

app.whenReady().then(async () => {
  try {
    await initializeApp();
    setupIpcHandlers();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('App initialization failed:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  dbManager.close();
});
