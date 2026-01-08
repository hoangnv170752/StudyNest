//! Speech-to-Text (STT) module using Moonshine ASR

use std::path::Path;
use crate::device::DeviceType;
use crate::error::{Result, StudyNestError};

#[cfg(feature = "onnx")]
use crane_core::models::moonshine_asr::MoonshineASR;

/// Supported STT model types
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SttModelType {
    /// Moonshine Tiny - fastest, lower accuracy
    MoonshineTiny,
    /// Moonshine Base - balanced speed and accuracy
    MoonshineBase,
}

impl Default for SttModelType {
    fn default() -> Self {
        SttModelType::MoonshineTiny
    }
}

impl SttModelType {
    fn model_name(&self) -> &'static str {
        match self {
            SttModelType::MoonshineTiny => "tiny",
            SttModelType::MoonshineBase => "base",
        }
    }
}

/// STT configuration
#[derive(Debug, Clone)]
pub struct SttConfig {
    pub model_path: String,
    pub model_type: SttModelType,
    pub device: DeviceType,
    pub sample_rate: u32,
    pub token_rate: Option<usize>,
}

impl Default for SttConfig {
    fn default() -> Self {
        Self {
            model_path: "checkpoints/moonshine-tiny".to_string(),
            model_type: SttModelType::MoonshineTiny,
            device: DeviceType::Auto,
            sample_rate: 16000,
            token_rate: None,
        }
    }
}

impl SttConfig {
    pub fn with_model_path(mut self, path: impl Into<String>) -> Self {
        self.model_path = path.into();
        self
    }

    pub fn with_device(mut self, device: DeviceType) -> Self {
        self.device = device;
        self
    }

    pub fn with_model_type(mut self, model_type: SttModelType) -> Self {
        self.model_type = model_type;
        self
    }
}

/// STT result containing transcribed text and metadata
#[derive(Debug, Clone)]
pub struct SttResult {
    pub text: String,
    pub tokens: Vec<i64>,
    pub duration_ms: u64,
    pub processing_time_ms: u64,
}

/// Speech-to-Text engine
pub struct SttEngine {
    config: SttConfig,
    #[cfg(feature = "onnx")]
    model: MoonshineASR,
    #[cfg(not(feature = "onnx"))]
    _phantom: std::marker::PhantomData<()>,
}

impl SttEngine {
    /// Create a new STT engine
    #[cfg(feature = "onnx")]
    pub fn new(config: SttConfig) -> Result<Self> {
        println!("[StudyNest] Initializing STT engine with model: {}", config.model_path);
        
        let device = get_device(config.device)?;
        
        // Verify model path exists
        if !Path::new(&config.model_path).exists() {
            return Err(StudyNestError::ConfigError(format!(
                "Model path does not exist: {}. Please download the model first.",
                config.model_path
            )));
        }
        
        let model = MoonshineASR::new(
            &config.model_path,
            config.model_type.model_name(),
            config.token_rate,
            &device,
        ).map_err(|e| StudyNestError::ModelError(e.to_string()))?;
        
        println!("[StudyNest] STT engine initialized on {}", config.device);
        
        Ok(Self { config, model })
    }

    #[cfg(not(feature = "onnx"))]
    pub fn new(config: SttConfig) -> Result<Self> {
        Err(StudyNestError::FeatureNotEnabled(
            "ONNX feature not enabled. Compile with --features onnx for STT support.".to_string()
        ))
    }

    /// Transcribe audio from a WAV file
    #[cfg(feature = "onnx")]
    pub fn transcribe_file<P: AsRef<Path>>(&self, audio_path: P) -> Result<SttResult> {
        let start = std::time::Instant::now();
        let audio_path = audio_path.as_ref();
        
        if !audio_path.exists() {
            return Err(StudyNestError::AudioError(format!(
                "Audio file not found: {}",
                audio_path.display()
            )));
        }
        
        println!("[StudyNest] Transcribing audio: {}", audio_path.display());
        
        // Load audio file
        let audio = Self::load_wav_file(audio_path)?;
        let duration_ms = (audio.len() as f64 / self.config.sample_rate as f64 * 1000.0) as u64;
        
        // Run inference
        let tokens = self.model.generate(&audio, None)
            .map_err(|e| StudyNestError::ModelError(e.to_string()))?;
        
        // Decode tokens to text (placeholder - needs tokenizer integration)
        let text = self.decode_tokens(&tokens)?;
        
        let processing_time_ms = start.elapsed().as_millis() as u64;
        
        println!("[StudyNest] Transcription complete in {}ms", processing_time_ms);
        
        Ok(SttResult {
            text,
            tokens,
            duration_ms,
            processing_time_ms,
        })
    }

    #[cfg(not(feature = "onnx"))]
    pub fn transcribe_file<P: AsRef<Path>>(&self, _audio_path: P) -> Result<SttResult> {
        Err(StudyNestError::FeatureNotEnabled(
            "ONNX feature not enabled. Compile with --features onnx for STT support.".to_string()
        ))
    }

    /// Transcribe audio from raw samples
    #[cfg(feature = "onnx")]
    pub fn transcribe_audio(&self, audio_samples: &[f32]) -> Result<SttResult> {
        let start = std::time::Instant::now();
        let duration_ms = (audio_samples.len() as f64 / self.config.sample_rate as f64 * 1000.0) as u64;
        
        println!("[StudyNest] Transcribing {} samples ({:.2}s)", 
            audio_samples.len(), 
            duration_ms as f64 / 1000.0
        );
        
        let tokens = self.model.generate(audio_samples, None)
            .map_err(|e| StudyNestError::ModelError(e.to_string()))?;
        
        let text = self.decode_tokens(&tokens)?;
        let processing_time_ms = start.elapsed().as_millis() as u64;
        
        Ok(SttResult {
            text,
            tokens,
            duration_ms,
            processing_time_ms,
        })
    }

    #[cfg(not(feature = "onnx"))]
    pub fn transcribe_audio(&self, _audio_samples: &[f32]) -> Result<SttResult> {
        Err(StudyNestError::FeatureNotEnabled(
            "ONNX feature not enabled. Compile with --features onnx for STT support.".to_string()
        ))
    }

    /// Load WAV file and return audio samples
    fn load_wav_file(path: &Path) -> Result<Vec<f32>> {
        let mut reader = hound::WavReader::open(path)
            .map_err(|e| StudyNestError::AudioError(format!("Failed to open WAV file: {}", e)))?;
        
        let spec = reader.spec();
        
        // Validate format
        if spec.sample_rate != 16000 {
            return Err(StudyNestError::AudioError(format!(
                "Unsupported sample rate: {}. Expected 16000 Hz.",
                spec.sample_rate
            )));
        }
        
        if spec.channels != 1 {
            return Err(StudyNestError::AudioError(format!(
                "Unsupported channels: {}. Expected mono (1 channel).",
                spec.channels
            )));
        }
        
        // Read samples
        let samples: Vec<f32> = match spec.bits_per_sample {
            16 => {
                reader.samples::<i16>()
                    .map(|s| s.unwrap() as f32 / 32768.0)
                    .collect()
            }
            32 => {
                reader.samples::<i32>()
                    .map(|s| s.unwrap() as f32 / 2147483648.0)
                    .collect()
            }
            _ => {
                return Err(StudyNestError::AudioError(format!(
                    "Unsupported bit depth: {}. Expected 16 or 32 bits.",
                    spec.bits_per_sample
                )));
            }
        };
        
        Ok(samples)
    }

    /// Decode token IDs to text
    fn decode_tokens(&self, tokens: &[i64]) -> Result<String> {
        // Basic token decoding - in a full implementation, 
        // this would use the model's tokenizer
        // For now, return token IDs as a debug string
        Ok(format!("[Tokens: {:?}]", tokens))
    }

    /// Get expected audio format info
    pub fn expected_format() -> &'static str {
        "WAV format: 16kHz sample rate, mono channel, 16-bit PCM"
    }
}

/// List available STT models
pub fn list_available_models() -> Vec<(&'static str, &'static str)> {
    vec![
        ("moonshine-tiny", "Fastest model, lower accuracy (~6 tokens/sec)"),
        ("moonshine-base", "Balanced speed and accuracy"),
        ("moonshine-tiny-zh", "Chinese language support"),
    ]
}
