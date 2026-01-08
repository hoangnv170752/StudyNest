# Crane AI SDK

A comprehensive Rust SDK for building AI applications with various capabilities including chat, vision, audio, and multimodal processing.

## Features

- **Chat Applications**: High-level chat interfaces with streaming support
- **Vision Processing**: OCR, image analysis, and computer vision capabilities
- **Audio Processing**: ASR (Automatic Speech Recognition), TTS (Text-to-Speech), and VAD (Voice Activity Detection)
- **Multimodal Models**: Vision-language models for combined image and text processing
- **Easy Setup**: Simple initialization for different AI applications
- **Configurable**: Flexible configuration for different use cases
- **Cross-platform**: Works across different hardware and OS

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
crane = { path = "../crane" }  # Adjust path as needed
```

## Quick Start

### Chat Application

```rust
use crane::prelude::*;

fn main() -> CraneResult<()> {
    // Create a chat configuration
    let config = ChatConfig {
        common: CommonConfig {
            model_path: "checkpoints/Qwen2.5-0.5B-Instruct".to_string(),
            device: DeviceConfig::Cpu,
            dtype: DataType::F16,
            max_memory: None,
        },
        generation: GenerationConfig {
            max_new_tokens: 235,
            temperature: Some(0.67),
            top_p: Some(1.0),
            repetition_penalty: 1.1,
            ..Default::default()
        },
        max_history_turns: 4,
        enable_streaming: true,
    };
    
    // Create a new chat client
    let mut chat_client = ChatClient::new(config)?;
    
    // Send a message and get a response
    let response = chat_client.send_message("Hello, how are you?")?;
    println!("Response: {}", response);
    
    Ok(())
}
```

### ASR (Automatic Speech Recognition)

```rust
use crane::prelude::*;

fn main() -> CraneResult<()> {
    // Create an ASR configuration
    let config = CommonConfig {
        model_path: "checkpoints/moonshine".to_string(), // Adjust path as needed
        device: DeviceConfig::Cpu,
        dtype: DataType::F16,
        max_memory: None,
    };
    
    // Create a new ASR client
    let asr_client = AsrClient::new(config)?;
    
    // Transcribe an audio file
    let transcription = asr_client.transcribe_from_file("data/audio_sample.wav")?;
    println!("Transcription: {}", transcription);
    
    Ok(())
}
```

## Modules

- `chat`: High-level chat interfaces and CLI utilities
- `vision`: OCR, image analysis, computer vision capabilities
- `audio`: ASR, TTS, voice activity detection
- `multimodal`: Vision-language models and multimodal processing
- `llm`: Generic LLM interfaces and provider abstractions
- `common`: Shared utilities, configuration, and error handling

## License

MIT