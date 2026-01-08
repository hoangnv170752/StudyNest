pub mod qwen25;
pub mod siglip2;
#[cfg(feature = "onnx")]
pub mod snac_onnx;
pub mod orpheus;
pub mod qwen3;
#[cfg(feature = "onnx")]
pub mod moonshine_asr;
#[cfg(feature = "onnx")]
pub mod silero_vad;

pub use candle_core::{DType, Device};
