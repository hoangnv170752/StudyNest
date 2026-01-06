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
  };
  db: {
    getAllConversations: () => Promise<DBConversation[]>;
    getConversation: (id: string) => Promise<DBConversation | undefined>;
    createConversation: (conversation: DBConversation) => Promise<boolean>;
    updateConversation: (id: string, title: string, updatedAt: number) => Promise<boolean>;
    deleteConversation: (id: string) => Promise<boolean>;
    getMessages: (conversationId: string) => Promise<DBMessage[]>;
    createMessage: (message: DBMessage) => Promise<boolean>;
    getConversationWithMessages: (id: string) => Promise<{ conversation: DBConversation; messages: DBMessage[] } | null>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
