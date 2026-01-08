export interface ModelDownloadProgress {
  status: 'checking' | 'downloading' | 'completed' | 'error';
  progress?: number;
  message?: string;
}

export interface DBConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface DBMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  model: {
    isFirstRun: () => Promise<boolean>;
    isDownloaded: () => Promise<boolean>;
    download: () => Promise<boolean>;
    getConfig: () => Promise<any>;
    onDownloadProgress: (callback: (progress: ModelDownloadProgress) => void) => void;
    removeDownloadProgressListener: () => void;
  };
  ollama: {
    generate: (payload: any) => Promise<any>;
    chat: (payload: any) => Promise<any>;
    listModels: () => Promise<string[]>;
    pullModel: (modelName: string) => Promise<boolean>;
  };
  crane: {
    start: () => Promise<{ success: boolean; error?: string }>;
    initialize: (modelPath: string) => Promise<{ success: boolean; error?: string }>;
    chat: (payload: any) => Promise<any>;
    listModels: () => Promise<string[]>;
    isRunning: () => Promise<boolean>;
    listAvailableModels: () => Promise<Array<{
      id: string;
      name: string;
      path: string;
      size?: string;
      type: 'crane';
    }>>;
    getModelInfo: (modelId: string) => Promise<any>;
    modelExists: (modelName: string) => Promise<boolean>;
  };
  db: {
    getAllConversations: () => Promise<any[]>;
    getConversation: (id: string) => Promise<any>;
    createConversation: (conversation: any) => Promise<boolean>;
    updateConversation: (id: string, title: string, updatedAt: number) => Promise<boolean>;
    deleteConversation: (id: string) => Promise<boolean>;
    getMessages: (conversationId: string) => Promise<any[]>;
    createMessage: (message: any) => Promise<boolean>;
    getConversationWithMessages: (id: string) => Promise<any>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
