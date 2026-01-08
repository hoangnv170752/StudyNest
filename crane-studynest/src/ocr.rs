//! OCR (Optical Character Recognition) module using vision models

use std::path::Path;
use candle_core::DType;
use crate::device::{DeviceType, get_device};
use crate::error::{Result, StudyNestError};

/// Supported OCR model types
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OcrModelType {
    /// Qwen3-VL for general OCR and document understanding
    Qwen3VL,
    /// Namo2 for document parsing
    Namo2,
}

impl Default for OcrModelType {
    fn default() -> Self {
        OcrModelType::Qwen3VL
    }
}

/// OCR configuration
#[derive(Debug, Clone)]
pub struct OcrConfig {
    pub model_path: String,
    pub model_type: OcrModelType,
    pub device: DeviceType,
    pub dtype: DType,
    pub max_new_tokens: usize,
}

impl Default for OcrConfig {
    fn default() -> Self {
        Self {
            model_path: "checkpoints/Qwen3-VL-2B".to_string(),
            model_type: OcrModelType::Qwen3VL,
            device: DeviceType::Auto,
            dtype: DType::F16,
            max_new_tokens: 1024,
        }
    }
}

impl OcrConfig {
    pub fn with_model_path(mut self, path: impl Into<String>) -> Self {
        self.model_path = path.into();
        self
    }

    pub fn with_device(mut self, device: DeviceType) -> Self {
        self.device = device;
        self
    }
}

/// OCR result containing extracted text and metadata
#[derive(Debug, Clone)]
pub struct OcrResult {
    pub text: String,
    pub confidence: Option<f32>,
    pub processing_time_ms: u64,
}

/// OCR engine for text extraction from images and documents
pub struct OcrEngine {
    config: OcrConfig,
    device: candle_core::Device,
}

impl OcrEngine {
    /// Create a new OCR engine
    pub fn new(config: OcrConfig) -> Result<Self> {
        println!("[StudyNest] Initializing OCR engine with model: {}", config.model_path);
        
        let device = get_device(config.device)?;
        
        // Verify model path exists
        if !Path::new(&config.model_path).exists() {
            return Err(StudyNestError::ConfigError(format!(
                "Model path does not exist: {}. Please download the model first.",
                config.model_path
            )));
        }
        
        println!("[StudyNest] OCR engine initialized on {}", config.device);
        
        Ok(Self { config, device })
    }

    /// Extract text from an image file
    pub fn extract_from_image<P: AsRef<Path>>(&self, image_path: P) -> Result<OcrResult> {
        let start = std::time::Instant::now();
        let image_path = image_path.as_ref();
        
        if !image_path.exists() {
            return Err(StudyNestError::OcrError(format!(
                "Image file not found: {}",
                image_path.display()
            )));
        }
        
        println!("[StudyNest] Processing image: {}", image_path.display());
        
        // Load and process image based on model type
        let text = match self.config.model_type {
            OcrModelType::Qwen3VL => self.process_with_qwen3vl(image_path)?,
            OcrModelType::Namo2 => self.process_with_namo2(image_path)?,
        };
        
        let elapsed = start.elapsed().as_millis() as u64;
        
        Ok(OcrResult {
            text,
            confidence: None,
            processing_time_ms: elapsed,
        })
    }

    /// Extract text from image bytes
    pub fn extract_from_bytes(&self, image_data: &[u8], _format: &str) -> Result<OcrResult> {
        let start = std::time::Instant::now();
        
        // Save to temp file and process
        let temp_path = std::env::temp_dir().join("studynest_ocr_temp.png");
        std::fs::write(&temp_path, image_data)?;
        
        let result = self.extract_from_image(&temp_path);
        
        // Cleanup
        let _ = std::fs::remove_file(&temp_path);
        
        result
    }

    /// Process image with Qwen3-VL model
    fn process_with_qwen3vl(&self, image_path: &Path) -> Result<String> {
        // Note: Qwen3-VL implementation requires the vision model to be loaded
        // This is a placeholder that shows the expected interface
        
        println!("[StudyNest] Using Qwen3-VL for OCR...");
        
        // For now, return a message indicating the model needs to be implemented
        // In a full implementation, this would:
        // 1. Load the image
        // 2. Preprocess for the vision model
        // 3. Run inference with a prompt like "Extract all text from this image"
        // 4. Return the extracted text
        
        Err(StudyNestError::OcrError(
            "Qwen3-VL OCR implementation pending. Model file exists but inference not yet connected.".to_string()
        ))
    }

    /// Process image with Namo2 model
    fn process_with_namo2(&self, image_path: &Path) -> Result<String> {
        println!("[StudyNest] Using Namo2 for document parsing...");
        
        Err(StudyNestError::OcrError(
            "Namo2 OCR implementation pending.".to_string()
        ))
    }

    /// Extract text from PDF file (requires pdf feature)
    #[cfg(feature = "pdf")]
    pub fn extract_from_pdf<P: AsRef<Path>>(&self, pdf_path: P) -> Result<OcrResult> {
        let start = std::time::Instant::now();
        let pdf_path = pdf_path.as_ref();
        
        if !pdf_path.exists() {
            return Err(StudyNestError::OcrError(format!(
                "PDF file not found: {}",
                pdf_path.display()
            )));
        }
        
        println!("[StudyNest] Extracting text from PDF: {}", pdf_path.display());
        
        let text = pdf_extract::extract_text(pdf_path)
            .map_err(|e| StudyNestError::OcrError(format!("PDF extraction failed: {}", e)))?;
        
        let elapsed = start.elapsed().as_millis() as u64;
        
        Ok(OcrResult {
            text,
            confidence: Some(1.0), // Direct extraction is reliable
            processing_time_ms: elapsed,
        })
    }

    #[cfg(not(feature = "pdf"))]
    pub fn extract_from_pdf<P: AsRef<Path>>(&self, _pdf_path: P) -> Result<OcrResult> {
        Err(StudyNestError::FeatureNotEnabled(
            "PDF feature not enabled. Compile with --features pdf".to_string()
        ))
    }

    /// Get device info
    pub fn device_info(&self) -> String {
        format!("{}", self.config.device)
    }
}

/// List available OCR models
pub fn list_available_models() -> Vec<(&'static str, &'static str)> {
    vec![
        ("Qwen3-VL-2B", "Vision-language model for OCR and document understanding"),
        ("Qwen3-VL-4B", "Larger VL model with better accuracy"),
        ("Namo2", "Specialized document parsing model"),
    ]
}
