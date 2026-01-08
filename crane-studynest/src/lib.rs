//! # Crane StudyNest
//!
//! A unified library for Chat, OCR, and Speech-to-Text inference.
//! Supports CPU, CUDA, and Metal (Apple Silicon) backends.

pub mod device;
pub mod chat;
pub mod ocr;
pub mod stt;
pub mod error;
pub mod service;

pub use device::{DeviceType, get_device};
pub use error::{StudyNestError, Result};

/// Prelude module for convenient imports
pub mod prelude {
    pub use crate::device::{DeviceType, get_device};
    pub use crate::chat::{ChatEngine, ChatConfig, ChatMessage, Role};
    pub use crate::ocr::{OcrEngine, OcrConfig};
    pub use crate::stt::{SttEngine, SttConfig};
    pub use crate::error::{StudyNestError, Result};
}
