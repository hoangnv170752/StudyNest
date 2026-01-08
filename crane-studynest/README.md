# Crane StudyNest 

A unified library for **Chat**, **OCR**, and **Speech-to-Text** inference using the Crane framework.
Supports CPU, CUDA, and Metal (Apple Silicon) backends.

## Features

- **Chat Engine**: Conversational AI using Qwen2.5/Qwen3 models
- **OCR Engine**: Text extraction from images and PDFs
- **STT Engine**: Speech-to-text transcription using Moonshine ASR
- **Multi-device support**: CPU, CUDA GPU, Metal (macOS)
- **Auto device selection**: Automatically picks the best available device

## Quick Start

### 1. Download Models

```bash
# Chat model (Qwen2.5)
huggingface-cli download Qwen/Qwen2.5-0.5B-Instruct --local-dir checkpoints/Qwen2.5-0.5B-Instruct

# STT model (Moonshine - requires onnx feature)
huggingface-cli download moonshine/moonshine-tiny --local-dir checkpoints/moonshine-tiny
```

### 2. Run the Demo

```bash
# Basic demo (chat only)
cargo run --bin studynest-demo --release

# With ONNX support for STT
cargo run --bin studynest-demo --release --features onnx

# With PDF support
cargo run --bin studynest-demo --release --features pdf

# All features
cargo run --bin studynest-demo --release --features full
```

## Usage Examples

### Chat

```rust
use crane_studynest::prelude::*;

fn main() -> Result<()> {
    let config = ChatConfig::default()
        .with_model_path("checkpoints/Qwen2.5-0.5B-Instruct")
        .with_device(DeviceType::Auto);

    let mut engine = ChatEngine::new(config)?;
    engine.warmup();

    let response = engine.chat("Hello, how are you?")?;
    println!("AI: {}", response);

    Ok(())
}
```

### OCR (Image to Text)

```rust
use crane_studynest::prelude::*;

fn main() -> Result<()> {
    let config = OcrConfig::default()
        .with_device(DeviceType::Auto);

    let engine = OcrEngine::new(config)?;
  
    // From image
    let result = engine.extract_from_image("document.png")?;
    println!("Extracted: {}", result.text);

    // From PDF (requires --features pdf)
    let result = engine.extract_from_pdf("document.pdf")?;
    println!("Extracted: {}", result.text);

    Ok(())
}
```

### Speech-to-Text

```rust
use crane_studynest::prelude::*;

fn main() -> Result<()> {
    let config = SttConfig::default()
        .with_model_path("checkpoints/moonshine-tiny")
        .with_device(DeviceType::Auto);

    let engine = SttEngine::new(config)?;
  
    // Transcribe WAV file (16kHz, mono, 16-bit)
    let result = engine.transcribe_file("audio.wav")?;
    println!("Transcription: {}", result.text);

    Ok(())
}
```

## Device Selection

```rust
use crane_studynest::device::{DeviceType, get_device, print_device_info};

// Auto-select best device
let device = get_device(DeviceType::Auto)?;

// Force CPU
let device = get_device(DeviceType::Cpu)?;

// Force CUDA (requires --features cuda)
let device = get_device(DeviceType::Cuda(0))?;

// Force Metal (macOS only)
let device = get_device(DeviceType::Metal)?;

// Print available devices
print_device_info();
```

## Available Models

### Chat Models

| Model                 | Description                      |
| --------------------- | -------------------------------- |
| Qwen2.5-0.5B-Instruct | Small, fast model for basic chat |
| Qwen2.5-1.5B-Instruct | Medium model with better quality |
| Qwen2.5-3B-Instruct   | Larger model for complex tasks   |
| Qwen3-0.6B            | Latest Qwen3 small model         |
| Qwen3-1.7B            | Latest Qwen3 medium model        |

### OCR Models

| Model       | Description                          |
| ----------- | ------------------------------------ |
| Qwen3-VL-2B | Vision-language model for OCR        |
| Qwen3-VL-4B | Larger VL model with better accuracy |

### STT Models

| Model          | Description                   |
| -------------- | ----------------------------- |
| moonshine-tiny | Fastest model, lower accuracy |
| moonshine-base | Balanced speed and accuracy   |

## Feature Flags

| Feature   | Description                   |
| --------- | ----------------------------- |
| `cuda`  | Enable CUDA GPU support       |
| `cudnn` | Enable cuDNN acceleration     |
| `mkl`   | Enable Intel MKL acceleration |
| `onnx`  | Enable ONNX runtime for STT   |
| `pdf`   | Enable PDF text extraction    |
| `docx`  | Enable DOCX text extraction   |
| `full`  | Enable onnx + pdf + docx      |

## Integration with Electron

For Electron app integration, build as a shared library:

```toml
[lib]
crate-type = ["cdylib"]
```

Then use `neon` or `napi-rs` to create Node.js bindings.

## License

Same as the Crane project.
