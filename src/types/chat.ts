export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  inferenceTime?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ModelConfig {
  name: string;
  endpoint: string;
  temperature?: number;
  maxTokens?: number;
}
