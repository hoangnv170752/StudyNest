//! Chat service binary for Electron integration
//! Provides HTTP server for chat functionality

use crane_studynest::service::{ChatService, ServiceConfig, ChatRequest, ChatResponse, ErrorResponse};
use std::io::{BufRead, BufReader, Write};
use std::sync::Arc;

fn main() {
    if let Err(e) = run_service() {
        eprintln!("Service error: {}", e);
        std::process::exit(1);
    }
}

fn run_service() -> Result<(), Box<dyn std::error::Error>> {
    eprintln!("[ChatService] Starting crane-studynest chat service...");
    
    let config = ServiceConfig::default();
    let service = Arc::new(ChatService::new(config));
    
    eprintln!("[ChatService] Service initialized. Waiting for commands via stdin...");
    eprintln!("[ChatService] Send JSON-RPC commands in the format:");
    eprintln!("[ChatService] {{\"method\": \"initialize\", \"params\": {{\"model_path\": \"path/to/model\"}}}}");
    eprintln!("[ChatService] {{\"method\": \"chat\", \"params\": {{...}}}}");
    
    let stdin = std::io::stdin();
    let reader = BufReader::new(stdin);
    
    for line in reader.lines() {
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }
        
        match handle_request(&service, &line) {
            Ok(response) => {
                println!("{}", response);
                std::io::stdout().flush()?;
            }
            Err(e) => {
                let error_response = serde_json::json!({
                    "error": e.to_string()
                });
                println!("{}", serde_json::to_string(&error_response)?);
                std::io::stdout().flush()?;
            }
        }
    }
    
    Ok(())
}

fn handle_request(service: &Arc<ChatService>, request_str: &str) -> Result<String, Box<dyn std::error::Error>> {
    let request: serde_json::Value = serde_json::from_str(request_str)?;
    
    let method = request["method"].as_str().ok_or("Missing method")?;
    let params = &request["params"];
    
    match method {
        "initialize" => {
            let model_path = params["model_path"].as_str()
                .ok_or("Missing model_path parameter")?;
            
            eprintln!("[ChatService] Initializing model: {}", model_path);
            service.initialize_model(model_path)?;
            eprintln!("[ChatService] Model initialized successfully");
            
            let response = serde_json::json!({
                "result": "Model initialized successfully"
            });
            Ok(serde_json::to_string(&response)?)
        }
        
        "chat" => {
            let chat_request: ChatRequest = serde_json::from_value(params.clone())?;
            
            eprintln!("[ChatService] Processing chat request with {} messages", 
                     chat_request.messages.len());
            
            let chat_response = service.chat(chat_request)?;
            
            eprintln!("[ChatService] Generated response: {} chars", 
                     chat_response.message.content.len());
            
            let response = serde_json::json!({
                "result": chat_response
            });
            Ok(serde_json::to_string(&response)?)
        }
        
        "list_models" => {
            let models = service.get_available_models();
            let response = serde_json::json!({
                "result": models
            });
            Ok(serde_json::to_string(&response)?)
        }
        
        _ => {
            Err(format!("Unknown method: {}", method).into())
        }
    }
}
