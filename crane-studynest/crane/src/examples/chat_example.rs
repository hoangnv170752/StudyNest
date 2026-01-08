//! Example of using the Crane SDK for chat applications

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
    
    // Example with streaming
    println!("\nStreaming response:");
    let streaming_response = chat_client.send_message_streaming(
        "Tell me about Rust programming language.", 
        |token| print!("{}", token)
    )?;
    println!("\nStreaming response completed: {}", streaming_response);
    
    Ok(())
}