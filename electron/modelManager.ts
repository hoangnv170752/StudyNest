import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const execAsync = promisify(exec);

export interface ModelDownloadProgress {
  status: 'checking' | 'downloading' | 'completed' | 'error';
  progress?: number;
  message?: string;
}

export class ModelManager {
  private modelName = 'tinyllama:1.1b';
  private configPath: string;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'model-config.json');
  }

  async isModelDownloaded(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('ollama list');
      return stdout.includes('tinyllama');
    } catch (error) {
      console.error('Error checking model:', error);
      return false;
    }
  }

  async isOllamaInstalled(): Promise<boolean> {
    try {
      await execAsync('which ollama');
      return true;
    } catch (error) {
      return false;
    }
  }

  async downloadModel(
    onProgress: (progress: ModelDownloadProgress) => void
  ): Promise<void> {
    try {
      onProgress({ status: 'checking', message: 'Checking Ollama installation...' });

      const ollamaInstalled = await this.isOllamaInstalled();
      if (!ollamaInstalled) {
        throw new Error('Ollama is not installed. Please install Ollama from https://ollama.ai');
      }

      const modelExists = await this.isModelDownloaded();
      if (modelExists) {
        onProgress({ status: 'completed', progress: 100, message: 'Model already downloaded' });
        await this.saveModelConfig();
        return;
      }

      onProgress({ status: 'downloading', progress: 0, message: 'Starting download...' });

      const pullProcess = exec(`ollama pull ${this.modelName}`);

      pullProcess.stdout?.on('data', (data: string) => {
        const output = data.toString();
        console.log('Ollama output:', output);
        
        const progressMatch = output.match(/(\d+)%/);
        if (progressMatch) {
          const progress = parseInt(progressMatch[1]);
          onProgress({
            status: 'downloading',
            progress,
            message: `Downloading TinyLlama 1.1B: ${progress}%`
          });
        }
      });

      pullProcess.stderr?.on('data', (data: string) => {
        console.error('Ollama error:', data.toString());
      });

      await new Promise<void>((resolve, reject) => {
        pullProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Model download failed with code ${code}`));
          }
        });

        pullProcess.on('error', (error) => {
          reject(error);
        });
      });

      onProgress({ status: 'completed', progress: 100, message: 'Model downloaded successfully' });
      await this.saveModelConfig();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onProgress({ status: 'error', message: errorMessage });
      throw error;
    }
  }

  async isFirstRun(): Promise<boolean> {
    try {
      await fs.promises.access(this.configPath);
      return false;
    } catch {
      return true;
    }
  }

  private async saveModelConfig(): Promise<void> {
    const config = {
      modelName: this.modelName,
      downloadedAt: Date.now(),
      version: '1.1b'
    };

    await fs.promises.writeFile(
      this.configPath,
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  }

  async getModelConfig(): Promise<any> {
    try {
      const data = await fs.promises.readFile(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
