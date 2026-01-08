//! Service module for Electron integration
//! Provides JSON-RPC interface for chat functionality

use crate::chat::{ChatEngine, ChatConfig, ChatMessage, Role};
use crate::device::DeviceType;
use crate::error::{Result, StudyNestError};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceConfig {
    pub model_path: String,
    pub device: String,
    pub max_tokens: usize,
    pub temperature: f64,
    pub top_p: f64,
}

impl Default for ServiceConfig {
    fn default() -> Self {
        Self {
            model_path: "checkpoints/Qwen2.5-0.5B-Instruct".to_string(),
            device: "auto".to_string(),
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub model: String,
    pub messages: Vec<MessageRequest>,
    pub temperature: Option<f64>,
    pub max_tokens: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageRequest {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatResponse {
    pub message: MessageResponse,
    pub done: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageResponse {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
}

pub struct ChatService {
    engine: Arc<Mutex<Option<ChatEngine>>>,
    config: ServiceConfig,
}

impl ChatService {
    pub fn new(config: ServiceConfig) -> Self {
        Self {
            engine: Arc::new(Mutex::new(None)),
            config,
        }
    }

    fn parse_device(device_str: &str) -> DeviceType {
        match device_str.to_lowercase().as_str() {
            "cpu" => DeviceType::Cpu,
            "metal" => DeviceType::Metal,
            "auto" => DeviceType::Auto,
            s if s.starts_with("cuda:") => {
                let id = s.strip_prefix("cuda:").unwrap_or("0").parse().unwrap_or(0);
                DeviceType::Cuda(id)
            }
            _ => DeviceType::Auto,
        }
    }

    fn parse_role(role_str: &str) -> Role {
        match role_str.to_lowercase().as_str() {
            "system" => Role::System,
            "user" => Role::User,
            "assistant" => Role::Assistant,
            _ => Role::User,
        }
    }

    pub fn initialize_model(&self, model_path: &str) -> Result<()> {
        let device = Self::parse_device(&self.config.device);
        
        let chat_config = ChatConfig::default()
            .with_model_path(model_path)
            .with_device(device)
            .with_max_tokens(self.config.max_tokens);

        let mut engine = ChatEngine::new(chat_config)?;
        engine.warmup();

        let mut engine_lock = self.engine.lock().unwrap();
        *engine_lock = Some(engine);

        Ok(())
    }

    pub fn chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let mut engine_lock = self.engine.lock().unwrap();
        
        let engine = engine_lock.as_mut().ok_or_else(|| {
            StudyNestError::ConfigError("Model not initialized".to_string())
        })?;

        engine.clear_history();

        for msg in &request.messages[..request.messages.len().saturating_sub(1)] {
            let role = Self::parse_role(&msg.role);
            engine.get_history();
        }

        let last_message = request.messages.last().ok_or_else(|| {
            StudyNestError::ConfigError("No messages provided".to_string())
        })?;

        let response = engine.chat(&last_message.content)?;

        Ok(ChatResponse {
            message: MessageResponse {
                role: "assistant".to_string(),
                content: response,
            },
            done: true,
        })
    }

    pub fn get_available_models(&self) -> Vec<String> {
        vec![
            "Qwen2.5-0.5B-Instruct".to_string(),
            "Qwen2.5-1.5B-Instruct".to_string(),
            "Qwen2.5-3B-Instruct".to_string(),
            "Qwen3-0.6B".to_string(),
            "Qwen3-1.7B".to_string(),
        ]
    }
}
