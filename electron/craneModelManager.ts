import * as fs from 'fs';
import * as path from 'path';

export interface CraneModel {
  id: string;
  name: string;
  path: string;
  size?: string;
  type: 'crane';
}

export class CraneModelManager {
  private checkpointsPath: string;

  constructor() {
    // Path to crane-studynest/checkpoints
    this.checkpointsPath = path.join(__dirname, '..', 'crane-studynest', 'checkpoints');
  }

  /**
   * Scan checkpoints directory for available models
   */
  async listAvailableModels(): Promise<CraneModel[]> {
    const models: CraneModel[] = [];

    try {
      // Check if checkpoints directory exists
      if (!fs.existsSync(this.checkpointsPath)) {
        console.log('[CraneModelManager] Checkpoints directory not found:', this.checkpointsPath);
        return models;
      }

      // Read all directories in checkpoints
      const entries = fs.readdirSync(this.checkpointsPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const modelPath = path.join(this.checkpointsPath, entry.name);
          
          // Check if it's a valid model directory (contains config.json and model files)
          const configPath = path.join(modelPath, 'config.json');
          const hasModelFile = this.hasModelFiles(modelPath);

          if (fs.existsSync(configPath) && hasModelFile) {
            const size = this.getDirectorySize(modelPath);
            
            models.push({
              id: `crane:${entry.name}`,
              name: this.formatModelName(entry.name),
              path: modelPath,
              size: this.formatSize(size),
              type: 'crane'
            });
          }
        }
      }

      console.log('[CraneModelManager] Found models:', models.map(m => m.name));
      return models;
    } catch (error) {
      console.error('[CraneModelManager] Error listing models:', error);
      return models;
    }
  }

  /**
   * Check if directory contains model files (.safetensors or .bin)
   */
  private hasModelFiles(dirPath: string): boolean {
    try {
      const files = fs.readdirSync(dirPath);
      return files.some(file => 
        file.endsWith('.safetensors') || 
        file.endsWith('.bin') ||
        file === 'model.safetensors' ||
        file === 'pytorch_model.bin'
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get total size of directory in bytes
   */
  private getDirectorySize(dirPath: string): number {
    let totalSize = 0;

    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
        } else if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        }
      }
    } catch (error) {
      console.error('[CraneModelManager] Error calculating directory size:', error);
    }

    return totalSize;
  }

  /**
   * Format size in bytes to human-readable format
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format model directory name to display name
   */
  private formatModelName(dirName: string): string {
    // Convert directory name to readable format
    // e.g., "Qwen2.5-0.5B-Instruct" -> "Qwen 2.5 (0.5B Instruct)"
    return dirName
      .replace(/-/g, ' ')
      .replace(/(\d+)\.(\d+)/, '$1.$2')
      .replace(/(\d+[BM])/g, '($1)')
      .trim();
  }

  /**
   * Get model info by ID
   */
  async getModelInfo(modelId: string): Promise<CraneModel | null> {
    const models = await this.listAvailableModels();
    return models.find(m => m.id === modelId) || null;
  }

  /**
   * Check if a specific model exists
   */
  async modelExists(modelName: string): Promise<boolean> {
    const modelPath = path.join(this.checkpointsPath, modelName);
    const configPath = path.join(modelPath, 'config.json');
    
    return fs.existsSync(configPath) && this.hasModelFiles(modelPath);
  }
}
