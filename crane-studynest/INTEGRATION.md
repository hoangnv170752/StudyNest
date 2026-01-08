# Crane StudyNest - Electron Integration Guide

This guide explains how to build and integrate the crane-studynest Rust service with your Electron application to use local LLM models instead of calling the Ollama API directly.

## Architecture Overview

The integration consists of three main components:

1. **Rust Service** (`chat-service` binary): Runs the LLM models locally using the Crane framework
2. **Electron Bridge** (`craneService.ts`): Manages the Rust service process and provides IPC communication
3. **Frontend Integration**: TypeScript/React code that uses the Crane service instead of Ollama API

## Prerequisites

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Download LLM Models
Download Qwen models from HuggingFace:

```bash
# Install huggingface-cli
pip install huggingface-hub

# Download a small model (recommended for testing)
huggingface-cli download Qwen/Qwen2.5-0.5B-Instruct --local-dir checkpoints/Qwen2.5-0.5B-Instruct

# Or download a larger model for better quality
huggingface-cli download Qwen/Qwen2.5-1.5B-Instruct --local-dir checkpoints/Qwen2.5-1.5B-Instruct
```

### 3. Install crane-core
The crane-studynest library depends on `crane-core`. Make sure it's available:

```bash
cd /path/to/crane-core
cargo build --release
```

## Building the Service

### Development Build
```bash
cd crane-studynest
cargo build --bin chat-service --release
```

The binary will be at: `target/release/chat-service`

### Production Build (for Electron packaging)
```bash
# Build for your platform
cargo build --bin chat-service --release

# For macOS (Apple Silicon)
cargo build --bin chat-service --release --target aarch64-apple-darwin

# For macOS (Intel)
cargo build --bin chat-service --release --target x86_64-apple-darwin

# Copy to Electron resources
mkdir -p ../resources/bin
cp target/release/chat-service ../resources/bin/
```

## Testing the Service

### 1. Test the Rust service directly
```bash
cd crane-studynest
cargo run --bin chat-service --release
```

Then send JSON-RPC commands via stdin:

```json
{"method": "initialize", "params": {"model_path": "checkpoints/Qwen2.5-0.5B-Instruct"}}
{"method": "chat", "params": {"model": "qwen2.5", "messages": [{"role": "user", "content": "Hello!"}]}}
```

### 2. Test from Electron
The service will automatically start when you use the Crane API from your Electron app.

## Usage in Electron App

### 1. Start the Service
```typescript
// In your Electron main process or renderer
const result = await window.electron.crane.start();
if (!result.success) {
  console.error('Failed to start service:', result.error);
}
```

### 2. Initialize with a Model
```typescript
const modelPath = 'checkpoints/Qwen2.5-0.5B-Instruct';
const result = await window.electron.crane.initialize(modelPath);
if (!result.success) {
  console.error('Failed to initialize model:', result.error);
}
```

### 3. Chat with the Model
```typescript
const response = await window.electron.crane.chat({
  model: 'qwen2.5',
  messages: [
    { role: 'user', content: 'Hello, how are you?' }
  ],
  temperature: 0.7,
  max_tokens: 2048
});

console.log('AI:', response.message.content);
```

### 4. Using with Conversation History
```typescript
const response = await window.electron.crane.chat({
  model: 'qwen2.5',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is 2+2?' },
    { role: 'assistant', content: '2+2 equals 4.' },
    { role: 'user', content: 'What about 3+3?' }
  ],
  temperature: 0.7,
  max_tokens: 2048
});
```

## Updating the Frontend Code

To use the Crane service instead of Ollama, update your `llm.ts` utility:

```typescript
// src/utils/llm.ts
export class LLMClient {
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

      // Use Crane service instead of Ollama
      if (window.electron?.crane) {
        // Ensure service is running
        const isRunning = await window.electron.crane.isRunning();
        if (!isRunning) {
          await window.electron.crane.start();
          await window.electron.crane.initialize('checkpoints/Qwen2.5-0.5B-Instruct');
        }

        const data = await window.electron.crane.chat({
          model: this.config.name,
          messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 2048
        });
        
        return cleanResponse(data.message?.content || '');
      } else {
        // Fallback to Ollama if Crane is not available
        const data = await window.electron.ollama.chat({
          model: this.config.name,
          messages,
          stream: false,
          options: {
            temperature: this.config.temperature || 0.7,
            num_predict: this.config.maxTokens || 2048
          }
        });
        return cleanResponse(data.message?.content || '');
      }
    } catch (error) {
      console.error('Error calling LLM:', error);
      throw error;
    }
  }
}
```

## Available Models

The Crane service supports the following Qwen models:

| Model | Size | Description |
|-------|------|-------------|
| Qwen2.5-0.5B-Instruct | 0.5B | Small, fast model for basic chat |
| Qwen2.5-1.5B-Instruct | 1.5B | Medium model with better quality |
| Qwen2.5-3B-Instruct | 3B | Larger model for complex tasks |
| Qwen3-0.6B | 0.6B | Latest Qwen3 small model |
| Qwen3-1.7B | 1.7B | Latest Qwen3 medium model |

## Performance Considerations

### Device Selection
The service automatically selects the best available device:
- **macOS (Apple Silicon)**: Uses Metal GPU acceleration
- **CUDA GPUs**: Compile with `--features cuda` for NVIDIA GPU support
- **CPU**: Fallback option, slower but works everywhere

### Memory Requirements
- 0.5B models: ~1-2GB RAM
- 1.5B models: ~3-4GB RAM
- 3B models: ~6-8GB RAM

### Optimization Tips
1. Use smaller models for faster responses
2. Reduce `max_tokens` for shorter responses
3. Lower `temperature` for more deterministic outputs
4. On Apple Silicon, Metal acceleration provides 3-5x speedup

## Troubleshooting

### Service Won't Start
- Check that Rust is installed: `rustc --version`
- Verify the binary exists: `ls target/release/chat-service`
- Check logs in Electron DevTools console

### Model Not Found
- Verify model path is correct
- Ensure model was downloaded completely
- Check that model directory contains `config.json` and `.safetensors` files

### Out of Memory
- Use a smaller model
- Reduce `max_tokens` parameter
- Close other applications

### Slow Performance
- Ensure Metal/CUDA acceleration is working
- Try a smaller model
- Check CPU/GPU usage in Activity Monitor

## Building for Production

### macOS
```bash
# Build the service
cd crane-studynest
cargo build --bin chat-service --release --target aarch64-apple-darwin

# Copy to resources
mkdir -p ../resources/bin
cp target/aarch64-apple-darwin/release/chat-service ../resources/bin/

# Build Electron app
cd ..
npm run build
npm run package
```

### Update package.json
Add the service binary to your Electron build configuration:

```json
{
  "build": {
    "extraResources": [
      {
        "from": "resources/bin/chat-service",
        "to": "bin/chat-service"
      },
      {
        "from": "checkpoints",
        "to": "checkpoints"
      }
    ]
  }
}
```

## Advantages Over Ollama

1. **No External Dependencies**: No need to install and run Ollama server
2. **Better Integration**: Direct process communication, no HTTP overhead
3. **Faster Startup**: Models load directly without server initialization
4. **Smaller Footprint**: Only includes what you need
5. **Better Control**: Full control over model lifecycle and resources

## License

Same as the Crane project.
