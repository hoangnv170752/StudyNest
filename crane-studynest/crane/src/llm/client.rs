use crate::common::{CraneResult, CraneError, config::{CommonConfig, DataType, DeviceConfig}};
use crate::llm::GenerationConfig;
use std::sync::Arc;
use crane_core::generation::based::ModelForCausalLM;

/// LLM client for various language models
pub struct LlmClient {
    config: CommonConfig,
    // We'll store the actual model here, but for now we'll use a placeholder
    // The actual implementation will depend on the specific model type
}

impl LlmClient {
    /// Create a new LLM client with the given configuration
    pub fn new(config: CommonConfig) -> CraneResult<Self> {
        // Initialize the appropriate model based on configuration
        // For now, we'll just store the config and return
        Ok(Self {
            config,
        })
    }
    
    /// Generate text using the model
    pub fn generate(&self, prompt: &str, config: &GenerationConfig) -> CraneResult<String> {
        // This is a simplified implementation
        // In reality, we would use the appropriate model based on the config
        let device = match &self.config.device {
            DeviceConfig::Cpu => crane_core::models::Device::Cpu,
            DeviceConfig::Cuda(gpu_id) => crane_core::models::Device::cuda_if_available(*gpu_id as usize)
                .map_err(|e| CraneError::ModelError(e.to_string()))?,
            DeviceConfig::Metal => {
                #[cfg(target_os = "macos")]
                {
                    crane_core::models::Device::new_metal(0)
                        .map_err(|e| CraneError::ModelError(e.to_string()))?
                }
                #[cfg(not(target_os = "macos"))]
                {
                    return Err(CraneError::ConfigError("Metal device not available on this platform".to_string()));
                }
            }
        };

        let dtype = match self.config.dtype {
            DataType::F16 => crane_core::models::DType::F16,
            DataType::F32 => crane_core::models::DType::F32,
            DataType::BF16 => crane_core::models::DType::BF16,
        };

        // Load the appropriate model based on the model type
        // For now, let's use Qwen2.5 as an example
        let tokenizer = crane_core::autotokenizer::AutoTokenizer::from_pretrained(
            &self.config.model_path,
            None
        ).map_err(|e| CraneError::TokenizationError(e.to_string()))?;

        let mut model = crane_core::models::qwen25::Model::new(
            &self.config.model_path,
            &device,
            &dtype
        ).map_err(|e| CraneError::ModelError(e.to_string()))?;

        let gen_config = crane_core::generation::GenerationConfig {
            max_new_tokens: config.max_new_tokens,
            temperature: config.temperature,
            top_p: config.top_p,
            repetition_penalty: config.repetition_penalty,
            repeat_last_n: config.repeat_last_n,
            do_sample: config.do_sample,
            pad_token_id: config.pad_token_id,
            eos_token_id: config.eos_token_id,
            report_speed: config.report_speed,
        };

        let input_ids = model.prepare_inputs(prompt)
            .map_err(|e| CraneError::ModelError(e.to_string()))?;

        model.warmup();

        let mut streamer = crane_core::generation::streamer::TextStreamer {
            tokenizer: tokenizer.clone(),
            buffer: String::new(),
        };

        let output_ids = model
            .generate(&input_ids, &gen_config, Some(&mut streamer))
            .map_err(|e| CraneError::ModelError(e.to_string()))?;

        let result = tokenizer.decode(&output_ids, false)
            .map_err(|e| CraneError::TokenizationError(e.to_string()))?;

        Ok(result)
    }

    /// Generate text with streaming support
    pub fn generate_streaming<F>(&self, prompt: &str, config: &GenerationConfig, callback: F) -> CraneResult<String>
    where
        F: Fn(&str),
    {
        let device = match &self.config.device {
            DeviceConfig::Cpu => crane_core::models::Device::Cpu,
            DeviceConfig::Cuda(gpu_id) => crane_core::models::Device::cuda_if_available(*gpu_id as usize)
                .map_err(|e| CraneError::ModelError(e.to_string()))?,
            DeviceConfig::Metal => {
                #[cfg(target_os = "macos")]
                {
                    crane_core::models::Device::new_metal(0)
                        .map_err(|e| CraneError::ModelError(e.to_string()))?
                }
                #[cfg(not(target_os = "macos"))]
                {
                    return Err(CraneError::ConfigError("Metal device not available on this platform".to_string()));
                }
            }
        };

        let dtype = match self.config.dtype {
            DataType::F16 => crane_core::models::DType::F16,
            DataType::F32 => crane_core::models::DType::F32,
            DataType::BF16 => crane_core::models::DType::BF16,
        };

        let tokenizer = crane_core::autotokenizer::AutoTokenizer::from_pretrained(
            &self.config.model_path,
            None
        ).map_err(|e| CraneError::TokenizationError(e.to_string()))?;

        let mut model = crane_core::models::qwen25::Model::new(
            &self.config.model_path,
            &device,
            &dtype
        ).map_err(|e| CraneError::ModelError(e.to_string()))?;

        let gen_config = crane_core::generation::GenerationConfig {
            max_new_tokens: config.max_new_tokens,
            temperature: config.temperature,
            top_p: config.top_p,
            repetition_penalty: config.repetition_penalty,
            repeat_last_n: config.repeat_last_n,
            do_sample: config.do_sample,
            pad_token_id: config.pad_token_id,
            eos_token_id: config.eos_token_id,
            report_speed: config.report_speed,
        };

        let input_ids = model.prepare_inputs(prompt)
            .map_err(|e| CraneError::ModelError(e.to_string()))?;

        model.warmup();

        let (mut streamer, receiver) = crane_core::generation::streamer::AsyncTextStreamer::new(tokenizer.clone());

        // Start the generation in a separate thread
        let generate_handle = std::thread::spawn(move || {
            let _output_ids = model
                .generate(&input_ids, &gen_config, Some(&mut streamer));
            _output_ids
        });

        // Process the streaming tokens in the main thread
        let mut response_text = String::new();
        for message in receiver {
            match message {
                crane_core::generation::streamer::StreamerMessage::Token(token_text) => {
                    callback(&token_text);
                    response_text.push_str(&token_text);
                }
                crane_core::generation::streamer::StreamerMessage::End => {
                    break;
                }
            }
        }

        // Wait for generation to complete
        generate_handle.join().unwrap()?;
        Ok(response_text)
    }
    
    /// Get the tokenizer for this client
    pub fn get_tokenizer(&self) -> CraneResult<crane_core::autotokenizer::AutoTokenizer> {
        crane_core::autotokenizer::AutoTokenizer::from_pretrained(
            &self.config.model_path, 
            None
        ).map_err(|e| CraneError::TokenizationError(e.to_string()))
    }
}