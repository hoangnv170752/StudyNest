import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  model: {
    isFirstRun: () => ipcRenderer.invoke('model:isFirstRun'),
    isDownloaded: () => ipcRenderer.invoke('model:isDownloaded'),
    download: () => ipcRenderer.invoke('model:download'),
    getConfig: () => ipcRenderer.invoke('model:getConfig'),
    onDownloadProgress: (callback: (progress: any) => void) => {
      ipcRenderer.on('model:downloadProgress', (_event, progress) => callback(progress));
    },
    removeDownloadProgressListener: () => {
      ipcRenderer.removeAllListeners('model:downloadProgress');
    }
  },
  ollama: {
    generate: (payload: any) => ipcRenderer.invoke('ollama:generate', payload),
    listModels: () => ipcRenderer.invoke('ollama:listModels'),
    pullModel: (modelName: string) => ipcRenderer.invoke('ollama:pullModel', modelName)
  },
  db: {
    getAllConversations: () => ipcRenderer.invoke('db:getAllConversations'),
    getConversation: (id: string) => ipcRenderer.invoke('db:getConversation', id),
    createConversation: (conversation: any) => ipcRenderer.invoke('db:createConversation', conversation),
    updateConversation: (id: string, title: string, updatedAt: number) => 
      ipcRenderer.invoke('db:updateConversation', id, title, updatedAt),
    deleteConversation: (id: string) => ipcRenderer.invoke('db:deleteConversation', id),
    getMessages: (conversationId: string) => ipcRenderer.invoke('db:getMessages', conversationId),
    createMessage: (message: any) => ipcRenderer.invoke('db:createMessage', message),
    getConversationWithMessages: (id: string) => ipcRenderer.invoke('db:getConversationWithMessages', id)
  }
});
