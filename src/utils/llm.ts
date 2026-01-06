import { ModelConfig } from '../types/chat';

export class LLMClient {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async sendMessage(prompt: string, conversationHistory: string[] = []): Promise<string> {
    try {
      if (window.electron?.ollama) {
        const data = await window.electron.ollama.generate({
          model: this.config.name,
          prompt,
          stream: false,
          options: {
            temperature: this.config.temperature || 0.7,
            num_predict: this.config.maxTokens || 2048
          }
        });
        return data.response || '';
      } else {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.name,
            prompt,
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
        return data.response || '';
      }
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
          model: this.config.name,
          prompt,
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
            if (json.response) {
              onChunk(json.response);
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
