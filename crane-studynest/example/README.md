# Crane SDK Examples

This directory contains simple, user-friendly examples showing how to use the Crane AI SDK for various AI applications.

## Available Examples

### Chat Examples
- `chat_simple.rs`: Basic chat functionality - shows how to send a message and get a response
- `chat_streaming.rs`: Chat with real-time streaming responses - shows how to get token-by-token output

### Audio Examples
- `asr_simple.rs`: Automatic Speech Recognition - transcribe audio to text (requires ONNX feature)

### Vision Examples
- `vision_simple.rs`: Vision capabilities - image analysis and OCR (coming soon)

## Running Examples

### Simple Chat Example
```bash
cargo run --bin chat_simple
```

### Streaming Chat Example
```bash
cargo run --bin chat_streaming
```

### ASR Example (with ONNX support)
```bash
cargo run --features onnx --bin asr_simple
```

### Vision Example
```bash
cargo run --bin vision_simple
```

## Prerequisites

Before running these examples, make sure you have:

1. Downloaded the required model checkpoints (e.g., Qwen2.5-0.5B-Instruct)
2. Updated the model paths in the examples to match your local paths
3. For ONNX examples, ensure you have the required ONNX models and run with `--features onnx`

## Getting Started

Each example is designed to be simple and self-explanatory. Start with `chat_simple.rs` to see the basic usage pattern:

```rust
use crane::prelude::*;
use crane::common::config::{CommonConfig, DataType, DeviceConfig};
use crane::llm::GenerationConfig;

fn main() -> CraneResult<()> {
    // Create a simple chat configuration
    let config = ChatConfig {
        common: CommonConfig {
            model_path: "checkpoints/Qwen2.5-0.5B-Instruct".to_string(), // Update this path to your model
            device: DeviceConfig::Cpu, // Use DeviceConfig::Cuda(0) for GPU
            dtype: DataType::F16,
            max_memory: None,
        },
        generation: GenerationConfig {
            max_new_tokens: 100, // Keep responses short for demo
            temperature: Some(0.7),
            ..Default::default()
        },
        max_history_turns: 4,
        enable_streaming: true, // Enable streaming for real-time responses
    };

    // Create a new chat client
    let mut chat_client = ChatClient::new(config)?;

    // Send a simple message and get a response
    let response = chat_client.send_message("Hello, introduce yourself briefly.")?;
    println!("AI Response: {}", response);

    Ok(())
}
```

The Crane SDK provides a high-level interface for various AI capabilities:
- **Chat**: Natural conversation with AI models
- **Vision**: OCR, image analysis (coming soon)
- **Audio**: ASR, TTS (with ONNX feature)
- **Multimodal**: Vision-language models (coming soon)

For more advanced usage, check the documentation in the main `crane` crate.