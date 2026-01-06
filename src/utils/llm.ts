import { ModelConfig } from '../types/chat';

export class LLMClient {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async sendMessage(prompt: string, conversationHistory: string[] = []): Promise<string> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 2048,
          history: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`LLM request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || data.text || data.content || '';
    } catch (error) {
      console.error('Error calling LLM:', error);
      throw error;
    }
  }

  async streamMessage(
    prompt: string,
    onChunk: (chunk: string) => void,
    conversationHistory: string[] = []
  ): Promise<void> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 2048,
          history: conversationHistory,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`LLM request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        onChunk(chunk);
      }
    } catch (error) {
      console.error('Error streaming from LLM:', error);
      throw error;
    }
  }
}

export const createLLMClient = (config: ModelConfig): LLMClient => {
  return new LLMClient(config);
};
