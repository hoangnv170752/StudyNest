import { spawn, ChildProcess } from 'child_process';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class CraneService {
  private process: ChildProcess | null = null;
  private isInitialized = false;
  private initializedModelPath: string | null = null;
  private requestId = 0;
  private pendingRequests: Map<number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = new Map();

  constructor() {}

  async start(): Promise<void> {
    if (this.process) {
      console.log('[CraneService] Service already running');
      return;
    }

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    let servicePath: string;
    let useCargoRun = false;

    if (isDev) {
      // Try to find pre-built binary first
      const distBinary = path.join(__dirname, '..', 'dist', 'bin', 'chat-service');
      
      if (fs.existsSync(distBinary)) {
        console.log('[CraneService] Using pre-built binary for development');
        servicePath = distBinary;
      } else {
        // Fallback to cargo run
        console.log('[CraneService] Pre-built binary not found, using cargo run');
        servicePath = 'cargo';
        useCargoRun = true;
      }
    } else {
      // Production: use compiled binary from resources
      const resourcesPath = process.resourcesPath || path.join(app.getAppPath(), '..', 'Resources');
      servicePath = path.join(resourcesPath, 'bin', 'chat-service');
      
      console.log('[CraneService] Resources path:', resourcesPath);
      console.log('[CraneService] Looking for binary at:', servicePath);
      
      // Check if binary exists
      if (!fs.existsSync(servicePath)) {
        throw new Error(`Chat service binary not found at: ${servicePath}`);
      }
      
      // Make sure binary is executable
      try {
        fs.chmodSync(servicePath, 0o755);
      } catch (err) {
        console.warn('[CraneService] Could not set executable permission:', err);
      }
    }

    console.log('[CraneService] Starting chat service...');
    console.log('[CraneService] Service path:', servicePath);

    if (useCargoRun) {
      // In development, run with cargo
      const projectPath = path.join(__dirname, '..', 'crane-studynest');
      
      if (!fs.existsSync(projectPath)) {
        throw new Error(`crane-studynest directory not found at: ${projectPath}`);
      }
      
      this.process = spawn('cargo', ['run', '--bin', 'chat-service', '--release'], {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } else {
      this.process = spawn(servicePath, [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }

    if (!this.process.stdin || !this.process.stdout || !this.process.stderr) {
      throw new Error('Failed to create service process pipes');
    }

    // Handle stdout (responses)
    let buffer = '';
    this.process.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            this.handleResponse(response);
          } catch (error) {
            console.error('[CraneService] Failed to parse response:', line);
          }
        }
      }
    });

    // Handle stderr (logs)
    this.process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      console.error('[CraneService stderr]', message);
      
      // Check for critical errors
      if (message.includes('error') || message.includes('Error') || message.includes('panic')) {
        console.error('[CraneService] CRITICAL ERROR:', message);
      }
    });

    // Handle process errors
    this.process.on('error', (error) => {
      console.error('[CraneService] Process error:', error);
    });

    // Handle process exit
    this.process.on('exit', (code, signal) => {
      console.error(`[CraneService] Process exited with code ${code}, signal ${signal}`);
      this.process = null;
      this.isInitialized = false;
      this.initializedModelPath = null;
      
      // Reject all pending requests
      for (const [id, { reject }] of this.pendingRequests) {
        reject(new Error(`Service process terminated (code: ${code}, signal: ${signal})`));
      }
      this.pendingRequests.clear();
    });

    // Wait a bit for the service to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[CraneService] Service started');
  }

  async initialize(modelPath: string): Promise<void> {
    if (this.isInitialized && this.initializedModelPath === modelPath) {
      console.log('[CraneService] Model already initialized:', modelPath);
      return;
    }

    console.log('[CraneService] Initializing model:', modelPath);
    
    const response = await this.sendRequest('initialize', {
      model_path: modelPath
    });

    this.isInitialized = true;
    this.initializedModelPath = modelPath;
    console.log('[CraneService] Model initialized:', response);
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    const response = await this.sendRequest('chat', request);
    return response;
  }

  async listModels(): Promise<string[]> {
    const response = await this.sendRequest('list_models', {});
    return response;
  }

  private sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin) {
        reject(new Error('Service not running'));
        return;
      }

      const id = this.requestId++;
      this.pendingRequests.set(id, { resolve, reject });

      const request = {
        method,
        params
      };

      const requestStr = JSON.stringify(request) + '\n';
      
      console.log('[CraneService] Sending request:', method, 'with params:', JSON.stringify(params).substring(0, 100));
      
      try {
        this.process.stdin.write(requestStr);
      } catch (error) {
        this.pendingRequests.delete(id);
        console.error('[CraneService] Failed to write request:', error);
        reject(error);
      }

      // Timeout: 5 minutes for initialize, 2 minutes for chat, 30 seconds for others
      const timeout = method === 'initialize' ? 300000 : method === 'chat' ? 120000 : 30000;
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          console.error('[CraneService] Request timeout after', timeout / 1000, 'seconds for method:', method);
          reject(new Error(`Request timeout after ${timeout / 1000}s`));
        }
      }, timeout);
    });
  }

  private handleResponse(response: any): void {
    console.log('[CraneService] Received response:', JSON.stringify(response).substring(0, 200));
    
    // Get the oldest pending request (FIFO)
    const entries = Array.from(this.pendingRequests.entries());
    if (entries.length === 0) {
      console.warn('[CraneService] Received response but no pending requests');
      return;
    }

    const [id, { resolve, reject }] = entries[0];
    this.pendingRequests.delete(id);

    if (response.error) {
      console.error('[CraneService] Response error:', response.error);
      reject(new Error(response.error));
    } else {
      console.log('[CraneService] Response success');
      resolve(response.result);
    }
  }

  async stop(): Promise<void> {
    if (!this.process) {
      return;
    }

    console.log('[CraneService] Stopping service...');
    
    return new Promise((resolve) => {
      if (!this.process) {
        resolve();
        return;
      }

      this.process.on('exit', () => {
        this.process = null;
        this.isInitialized = false;
        this.initializedModelPath = null;
        console.log('[CraneService] Service stopped');
        resolve();
      });

      this.process.kill();

      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.process) {
          this.process.kill('SIGKILL');
        }
      }, 5000);
    });
  }

  isRunning(): boolean {
    return this.process !== null;
  }
}
