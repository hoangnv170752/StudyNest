# Build Instructions for Crane StudyNest Service

## Quick Start

```bash
# 1. Build the service
cd crane-studynest
cargo build --bin chat-service --release

# 2. Test it
cargo run --bin chat-service --release

# 3. Send a test command (in another terminal)
echo '{"method":"initialize","params":{"model_path":"checkpoints/Qwen2.5-0.5B-Instruct"}}' | target/release/chat-service
```

## Development Workflow

### 1. Setup Development Environment
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone and build crane-core (if needed)
cd ../crane-core
cargo build --release

# Return to crane-studynest
cd ../crane-studynest
```

### 2. Build and Test
```bash
# Build the service
cargo build --bin chat-service --release

# Run tests
cargo test

# Run the demo
cargo run --bin studynest-demo --release
```

### 3. Test with Electron
```bash
# Start the Electron app in development mode
cd ..
npm run dev

# The service will be automatically spawned by Electron
```

## Feature Flags

### CUDA Support (NVIDIA GPUs)
```bash
cargo build --bin chat-service --release --features cuda
```

### All Features
```bash
cargo build --bin chat-service --release --features full
```

Available features:
- `cuda`: NVIDIA GPU support
- `cudnn`: cuDNN acceleration
- `mkl`: Intel MKL acceleration
- `onnx`: ONNX runtime for STT
- `pdf`: PDF text extraction
- `docx`: DOCX text extraction
- `full`: All features enabled

## Platform-Specific Builds

### macOS (Apple Silicon)
```bash
cargo build --bin chat-service --release --target aarch64-apple-darwin
```

### macOS (Intel)
```bash
cargo build --bin chat-service --release --target x86_64-apple-darwin
```

### Linux
```bash
cargo build --bin chat-service --release --target x86_64-unknown-linux-gnu
```

### Windows
```bash
cargo build --bin chat-service --release --target x86_64-pc-windows-msvc
```

## Production Build

### 1. Build the Service
```bash
cd crane-studynest
cargo build --bin chat-service --release

# The binary will be at: target/release/chat-service
```

### 2. Copy to Electron Resources
```bash
mkdir -p ../resources/bin
cp target/release/chat-service ../resources/bin/
```

### 3. Build Electron App
```bash
cd ..
npm run build
npm run package
```

## Optimizations

### Release Build with Optimizations
```toml
# Add to Cargo.toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
```

### Smaller Binary Size
```bash
# Strip debug symbols
cargo build --bin chat-service --release
strip target/release/chat-service
```

### Faster Compilation
```bash
# Use mold linker (Linux)
cargo build --bin chat-service --release

# Use lld linker (macOS/Linux)
RUSTFLAGS="-C link-arg=-fuse-ld=lld" cargo build --bin chat-service --release
```

## Troubleshooting

### Build Errors

**Error: `crane-core` not found**
```bash
# Make sure crane-core is in the parent directory
cd ..
git clone <crane-core-repo>
cd crane-core
cargo build --release
cd ../crane-studynest
```

**Error: linking with `cc` failed**
```bash
# Install build essentials
# macOS:
xcode-select --install

# Linux:
sudo apt-get install build-essential
```

**Error: CUDA not found**
```bash
# Install CUDA toolkit
# Then build without CUDA feature:
cargo build --bin chat-service --release
```

### Runtime Errors

**Error: Model not found**
- Download the model using huggingface-cli
- Verify the model path in your code

**Error: Out of memory**
- Use a smaller model
- Close other applications
- Reduce max_tokens parameter

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Build Chat Service

on: [push, pull_request]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Install Rust
      uses: actions-rs/toolchain@v1
      with:
        toolchain: stable
        override: true
    
    - name: Build
      run: |
        cd crane-studynest
        cargo build --bin chat-service --release
    
    - name: Upload Binary
      uses: actions/upload-artifact@v2
      with:
        name: chat-service-${{ matrix.os }}
        path: crane-studynest/target/release/chat-service*
```

## Size Optimization

The compiled binary can be large. Here are ways to reduce size:

### 1. Strip Symbols
```bash
strip target/release/chat-service
```

### 2. Use UPX Compression
```bash
# Install UPX
brew install upx  # macOS
sudo apt-get install upx  # Linux

# Compress binary
upx --best --lzma target/release/chat-service
```

### 3. Optimize Cargo.toml
```toml
[profile.release]
opt-level = "z"  # Optimize for size
lto = true
codegen-units = 1
strip = true
```

## Performance Benchmarking

```bash
# Build with profiling
cargo build --bin chat-service --release

# Run with time measurement
time target/release/chat-service < test_input.json

# Profile with instruments (macOS)
instruments -t "Time Profiler" target/release/chat-service
```
