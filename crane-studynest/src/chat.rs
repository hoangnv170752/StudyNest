//! Chat inference module using Qwen models

use candle_core::DType;
use crate::device::{DeviceType, get_device};
use crate::error::{Result, StudyNestError};

use crane_core::autotokenizer::AutoTokenizer;
use crane_core::chat::{Message, Role as CoreRole};
use crane_core::generation::{GenerationConfig, based::ModelForCausalLM, streamer::TextStreamer};
use crane_core::models::qwen25::Model as Qwen25Model;
use crane_core::models::qwen3::Model as Qwen3Model;

/// Chat message role
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Role {
    System,
    User,
    Assistant,
}

impl From<Role> for CoreRole {
    fn from(role: Role) -> Self {
        match role {
            Role::System => CoreRole::System,
            Role::User => CoreRole::User,
            Role::Assistant => CoreRole::Assistant,
        }
    }
}

/// Chat message
#[derive(Debug, Clone)]
pub struct ChatMessage {
    pub role: Role,
    pub content: String,
}

impl ChatMessage {
    pub fn new(role: Role, content: impl Into<String>) -> Self {
        Self {
            role,
            content: content.into(),
        }
    }

    pub fn user(content: impl Into<String>) -> Self {
        Self::new(Role::User, content)
    }

    pub fn assistant(content: impl Into<String>) -> Self {
        Self::new(Role::Assistant, content)
    }

    pub fn system(content: impl Into<String>) -> Self {
        Self::new(Role::System, content)
    }
}

/// Supported chat model types
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ChatModelType {
    Qwen25,
    Qwen3,
}

impl Default for ChatModelType {
    fn default() -> Self {
        ChatModelType::Qwen25
    }
}

/// Chat configuration
#[derive(Debug, Clone)]
pub struct ChatConfig {
    pub model_path: String,
    pub model_type: ChatModelType,
    pub device: DeviceType,
    pub dtype: DType,
    pub max_new_tokens: usize,
    pub temperature: Option<f64>,
    pub top_p: Option<f64>,
    pub repetition_penalty: f32,
    pub repeat_last_n: usize,
    pub do_sample: bool,
    pub report_speed: bool,
}

impl Default for ChatConfig {
    fn default() -> Self {
        Self {
            model_path: "checkpoints/Qwen2.5-0.5B-Instruct".to_string(),
            model_type: ChatModelType::Qwen25,
            device: DeviceType::Auto,
            dtype: DType::F16,
            max_new_tokens: 256,
            temperature: Some(0.7),
            top_p: Some(0.9),
            repetition_penalty: 1.1,
            repeat_last_n: 64,
            do_sample: true,
            report_speed: true,
        }
    }
}

impl ChatConfig {
    pub fn with_model_path(mut self, path: impl Into<String>) -> Self {
        self.model_path = path.into();
        self
    }

    pub fn with_device(mut self, device: DeviceType) -> Self {
        self.device = device;
        self
    }

    pub fn with_max_tokens(mut self, max_tokens: usize) -> Self {
        self.max_new_tokens = max_tokens;
        self
    }
}

/// Internal model wrapper
enum ChatModel {
    Qwen25(Qwen25Model),
    Qwen3(Qwen3Model),
}

/// Chat engine for conversational AI
pub struct ChatEngine {
    model: ChatModel,
    tokenizer: AutoTokenizer,
    config: ChatConfig,
    history: Vec<ChatMessage>,
}

impl ChatEngine {
    /// Create a new chat engine with the given configuration
    pub fn new(config: ChatConfig) -> Result<Self> {
        println!("[StudyNest] Loading chat model from: {}", config.model_path);
        
        let device = get_device(config.device)?;
        
        let tokenizer = AutoTokenizer::from_pretrained(&config.model_path, None)
            .map_err(|e| StudyNestError::TokenizationError(e.to_string()))?;
        
        let model = match config.model_type {
            ChatModelType::Qwen25 => {
                let m = Qwen25Model::new(&config.model_path, &device, &config.dtype)
                    .map_err(|e| StudyNestError::ModelError(e.to_string()))?;
                ChatModel::Qwen25(m)
            }
            ChatModelType::Qwen3 => {
                let m = Qwen3Model::new(&config.model_path, &device, &config.dtype)
                    .map_err(|e| StudyNestError::ModelError(e.to_string()))?;
                ChatModel::Qwen3(m)
            }
        };
        
        println!("[StudyNest] Chat model loaded successfully on {}", config.device);
        
        Ok(Self {
            model,
            tokenizer,
            config,
            history: Vec::new(),
        })
    }

    /// Send a message and get a response
    pub fn chat(&mut self, message: &str) -> Result<String> {
        self.history.push(ChatMessage::user(message));
        
        let prompt = self.build_prompt()?;
        let response = self.generate(&prompt)?;
        
        self.history.push(ChatMessage::assistant(&response));
        
        Ok(response)
    }

    /// Send a message with streaming output
    pub fn chat_streaming<F>(&mut self, message: &str, callback: F) -> Result<String>
    where
        F: Fn(&str),
    {
        self.history.push(ChatMessage::user(message));
        
        let prompt = self.build_prompt()?;
        let response = self.generate_streaming(&prompt, callback)?;
        
        self.history.push(ChatMessage::assistant(&response));
        
        Ok(response)
    }

    /// Generate response from prompt
    fn generate(&mut self, prompt: &str) -> Result<String> {
        let gen_config = self.build_gen_config();
        
        let input_ids = match &mut self.model {
            ChatModel::Qwen25(m) => m.prepare_inputs(prompt),
            ChatModel::Qwen3(m) => m.prepare_inputs(prompt),
        }.map_err(|e| StudyNestError::ModelError(e.to_string()))?;
        
        let mut streamer = TextStreamer {
            tokenizer: self.tokenizer.clone(),
            buffer: String::new(),
        };
        
        let output_ids = match &mut self.model {
            ChatModel::Qwen25(m) => m.generate(&input_ids, &gen_config, Some(&mut streamer)),
            ChatModel::Qwen3(m) => m.generate(&input_ids, &gen_config, Some(&mut streamer)),
        }.map_err(|e| StudyNestError::ModelError(e.to_string()))?;
        
        let response = self.tokenizer.decode(&output_ids, true)
            .map_err(|e| StudyNestError::TokenizationError(e.to_string()))?;
        
        Ok(response)
    }

    /// Generate with streaming
    fn generate_streaming<F>(&mut self, prompt: &str, _callback: F) -> Result<String>
    where
        F: Fn(&str),
    {
        // For now, use regular generation with TextStreamer which prints to stdout
        self.generate(prompt)
    }

    /// Build prompt from chat history
    fn build_prompt(&self) -> Result<String> {
        let messages: Vec<Message> = self.history
            .iter()
            .map(|m| Message {
                role: m.role.into(),
                content: m.content.clone(),
            })
            .collect();
        
        self.tokenizer.apply_chat_template(&messages, true)
            .map_err(|e| StudyNestError::TokenizationError(e.to_string()))
    }

    /// Build generation config
    fn build_gen_config(&self) -> GenerationConfig {
        GenerationConfig {
            max_new_tokens: self.config.max_new_tokens,
            temperature: self.config.temperature,
            top_p: self.config.top_p,
            repetition_penalty: self.config.repetition_penalty,
            repeat_last_n: self.config.repeat_last_n,
            do_sample: self.config.do_sample,
            pad_token_id: self.tokenizer.get_token("<|end_of_text|>"),
            eos_token_id: self.tokenizer.get_token("<|im_end|>"),
            report_speed: self.config.report_speed,
        }
    }

    /// Clear chat history
    pub fn clear_history(&mut self) {
        self.history.clear();
    }

    /// Get current chat history
    pub fn get_history(&self) -> &[ChatMessage] {
        &self.history
    }

    /// Set system prompt
    pub fn set_system_prompt(&mut self, prompt: &str) {
        // Remove existing system message if any
        self.history.retain(|m| m.role != Role::System);
        // Insert system message at the beginning
        self.history.insert(0, ChatMessage::system(prompt));
    }

    /// Warmup the model
    pub fn warmup(&mut self) {
        println!("[StudyNest] Warming up chat model...");
        match &mut self.model {
            ChatModel::Qwen25(m) => m.warmup(),
            ChatModel::Qwen3(m) => m.warmup(),
        }
        println!("[StudyNest] Warmup complete");
    }
}

/// List available chat models
pub fn list_available_models() -> Vec<(&'static str, &'static str)> {
    vec![
        ("Qwen2.5-0.5B-Instruct", "Small, fast model for basic chat"),
        ("Qwen2.5-1.5B-Instruct", "Medium model with better quality"),
        ("Qwen2.5-3B-Instruct", "Larger model for complex tasks"),
        ("Qwen2.5-7B-Instruct", "High quality, requires more memory"),
        ("Qwen3-0.6B", "Latest Qwen3 small model"),
        ("Qwen3-1.7B", "Latest Qwen3 medium model"),
        ("Qwen3-4B", "Latest Qwen3 larger model"),
    ]
}
