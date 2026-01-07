import { ModelConfig, Message } from '../types/chat';

export class LLMClient {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async sendMessage(prompt: string, conversationHistory: Message[] = []): Promise<string> {
    try {
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      if (window.electron?.ollama) {
        const data = await window.electron.ollama.chat({
          model: this.config.name,
          messages,
          stream: false,
          options: {
            temperature: this.config.temperature || 0.7,
            num_predict: this.config.maxTokens || 2048
          }
        });
        return data.message?.content || '';
      } else {
        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.name,
            messages,
            stream: false,
            options: {
              temperature: this.config.temperature || 0.7,
              num_predict: this.config.maxTokens || 2048
            }
          })
        });

        if (!response.ok) {
          throw new Error(`LLM request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message?.content || '';
      }
    } catch (error) {
      console.error('Error calling LLM:', error);
      throw error;
    }
  }

  async streamMessage(
    prompt: string,
    onChunk: (chunk: string) => void,
    conversationHistory: Message[] = []
  ): Promise<void> {
    try {
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.name,
          messages,
          stream: true,
          options: {
            temperature: this.config.temperature || 0.7,
            num_predict: this.config.maxTokens || 2048
          }
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
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              onChunk(json.message.content);
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', line);
          }
        }
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
