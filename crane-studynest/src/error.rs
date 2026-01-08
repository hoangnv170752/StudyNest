//! Error types for StudyNest

use thiserror::Error;

/// Result type for StudyNest operations
pub type Result<T> = std::result::Result<T, StudyNestError>;

/// Error type for StudyNest operations
#[derive(Error, Debug)]
pub enum StudyNestError {
    #[error("Model error: {0}")]
    ModelError(String),

    #[error("Tokenization error: {0}")]
    TokenizationError(String),

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Device error: {0}")]
    DeviceError(String),

    #[error("Audio error: {0}")]
    AudioError(String),

    #[error("OCR error: {0}")]
    OcrError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Anyhow error: {0}")]
    AnyhowError(#[from] anyhow::Error),

    #[error("Feature not enabled: {0}")]
    FeatureNotEnabled(String),
}
