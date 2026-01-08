//! # Crane AI SDK
//! 
//! A comprehensive SDK for building AI applications with various capabilities
//! including chat, vision, audio, and multimodal processing.

pub mod common;
pub mod chat;
pub mod vision;
pub mod audio;
pub mod multimodal;
pub mod llm;

pub mod prelude {
    //! Common imports for the Crane SDK

    pub use crate::chat::{ChatClient, ChatConfig, ChatMessage, ChatRole};
    pub use crate::common::{CraneResult, CraneError};
    pub use crate::audio::TtsClient;
    pub use crate::vision::{OcrClient, VisionClient};

    #[cfg(feature = "onnx")]
    pub use crate::audio::AsrClient;
}