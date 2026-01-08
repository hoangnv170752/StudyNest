//! StudyNest Demo - Interactive CLI for Chat, OCR, and STT
//!
//! Run with: cargo run --bin studynest-demo --release

use std::io::{self, Write};
use crane_studynest::prelude::*;

fn main() {
    println!("╔═══════════════════════════════════════════════════════════╗");
    println!("║           🦩 Crane StudyNest Demo                         ║");
    println!("║   Chat, OCR, and Speech-to-Text Inference Engine          ║");
    println!("╚═══════════════════════════════════════════════════════════╝");
    println!();

    // Print device info
    crane_studynest::device::print_device_info();
    println!();

    // Show menu
    loop {
        println!("\nSelect a mode:");
        println!("  1. Chat (Qwen2.5/Qwen3)");
        println!("  2. OCR (Image to Text)");
        println!("  3. Speech-to-Text (Audio to Text)");
        println!("  4. List available models");
        println!("  5. Exit");
        println!();
        
        print!("Enter choice (1-5): ");
        io::stdout().flush().unwrap();
        
        let mut choice = String::new();
        io::stdin().read_line(&mut choice).unwrap();
        
        match choice.trim() {
            "1" => run_chat_demo(),
            "2" => run_ocr_demo(),
            "3" => run_stt_demo(),
            "4" => list_models(),
            "5" => {
                println!("\nGoodbye! 👋");
                break;
            }
            _ => println!("Invalid choice. Please enter 1-5."),
        }
    }
}

fn run_chat_demo() {
    println!("\n=== Chat Demo ===");
    println!("Enter model path (or press Enter for default):");
    
    print!("Model path [checkpoints/Qwen2.5-0.5B-Instruct]: ");
    io::stdout().flush().unwrap();
    
    let mut model_path = String::new();
    io::stdin().read_line(&mut model_path).unwrap();
    let model_path = model_path.trim();
    
    let model_path = if model_path.is_empty() {
        "checkpoints/Qwen2.5-0.5B-Instruct".to_string()
    } else {
        model_path.to_string()
    };
    
    // Detect model type from path
    let model_type = if model_path.to_lowercase().contains("qwen3") {
        crane_studynest::chat::ChatModelType::Qwen3
    } else {
        crane_studynest::chat::ChatModelType::Qwen25
    };
    
    let config = ChatConfig {
        model_path,
        model_type,
        device: DeviceType::Auto,
        ..Default::default()
    };
    
    println!("\nLoading model...");
    
    let mut engine = match ChatEngine::new(config) {
        Ok(e) => e,
        Err(e) => {
            println!("Failed to load model: {}", e);
            return;
        }
    };
    
    // Warmup
    engine.warmup();
    
    println!("\nChat started! Type 'exit' to quit, 'clear' to reset history.\n");
    
    loop {
        print!("You: ");
        io::stdout().flush().unwrap();
        
        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        let input = input.trim();
        
        if input.eq_ignore_ascii_case("exit") {
            break;
        }
        
        if input.eq_ignore_ascii_case("clear") {
            engine.clear_history();
            println!("Chat history cleared.\n");
            continue;
        }
        
        if input.is_empty() {
            continue;
        }
        
        print!("AI: ");
        io::stdout().flush().unwrap();
        
        match engine.chat(input) {
            Ok(_response) => {
                // Response is already printed by the streamer
                println!();
            }
            Err(e) => {
                println!("\nError: {}", e);
            }
        }
    }
}

fn run_ocr_demo() {
    println!("\n=== OCR Demo ===");
    
    #[cfg(feature = "pdf")]
    {
        println!("PDF support: Enabled");
    }
    #[cfg(not(feature = "pdf"))]
    {
        println!("PDF support: Disabled (enable with --features pdf)");
    }
    
    print!("Enter image/PDF path: ");
    io::stdout().flush().unwrap();
    
    let mut path = String::new();
    io::stdin().read_line(&mut path).unwrap();
    let path = path.trim();
    
    if path.is_empty() {
        println!("No path provided.");
        return;
    }
    
    let config = OcrConfig {
        device: DeviceType::Auto,
        ..Default::default()
    };
    
    let engine = match OcrEngine::new(config) {
        Ok(e) => e,
        Err(e) => {
            println!("Failed to initialize OCR engine: {}", e);
            return;
        }
    };
    
    let result = if path.ends_with(".pdf") {
        engine.extract_from_pdf(path)
    } else {
        engine.extract_from_image(path)
    };
    
    match result {
        Ok(ocr_result) => {
            println!("\n--- Extracted Text ---");
            println!("{}", ocr_result.text);
            println!("--- End ---");
            println!("Processing time: {}ms", ocr_result.processing_time_ms);
        }
        Err(e) => {
            println!("OCR failed: {}", e);
        }
    }
}

fn run_stt_demo() {
    println!("\n=== Speech-to-Text Demo ===");
    
    #[cfg(not(feature = "onnx"))]
    {
        println!("STT requires ONNX feature. Run with: cargo run --features onnx --bin studynest-demo");
        return;
    }
    
    #[cfg(feature = "onnx")]
    {
        print!("Enter audio file path (WAV, 16kHz mono): ");
        io::stdout().flush().unwrap();
        
        let mut path = String::new();
        io::stdin().read_line(&mut path).unwrap();
        let path = path.trim();
        
        if path.is_empty() {
            println!("No path provided.");
            return;
        }
        
        print!("Enter model path [checkpoints/moonshine-tiny]: ");
        io::stdout().flush().unwrap();
        
        let mut model_path = String::new();
        io::stdin().read_line(&mut model_path).unwrap();
        let model_path = model_path.trim();
        
        let model_path = if model_path.is_empty() {
            "checkpoints/moonshine-tiny".to_string()
        } else {
            model_path.to_string()
        };
        
        let config = SttConfig {
            model_path,
            device: DeviceType::Auto,
            ..Default::default()
        };
        
        println!("\nExpected audio format: {}", SttEngine::expected_format());
        println!("\nLoading STT model...");
        
        let engine = match SttEngine::new(config) {
            Ok(e) => e,
            Err(e) => {
                println!("Failed to initialize STT engine: {}", e);
                return;
            }
        };
        
        println!("Transcribing...");
        
        match engine.transcribe_file(path) {
            Ok(result) => {
                println!("\n--- Transcription ---");
                println!("{}", result.text);
                println!("--- End ---");
                println!("Audio duration: {}ms", result.duration_ms);
                println!("Processing time: {}ms", result.processing_time_ms);
            }
            Err(e) => {
                println!("Transcription failed: {}", e);
            }
        }
    }
}

fn list_models() {
    println!("\n=== Available Models ===\n");
    
    println!("📝 Chat Models:");
    for (name, desc) in crane_studynest::chat::list_available_models() {
        println!("   • {} - {}", name, desc);
    }
    
    println!("\n🖼️  OCR Models:");
    for (name, desc) in crane_studynest::ocr::list_available_models() {
        println!("   • {} - {}", name, desc);
    }
    
    println!("\n🎤 STT Models:");
    for (name, desc) in crane_studynest::stt::list_available_models() {
        println!("   • {} - {}", name, desc);
    }
    
    println!("\n📥 Download models with:");
    println!("   huggingface-cli download <model-name> --local-dir checkpoints/<model-name>");
}
