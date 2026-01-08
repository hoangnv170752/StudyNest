//! Chat functionality for the Crane SDK

mod client;
mod types;

pub use client::ChatClient;
pub use types::{ChatConfig, ChatMessage, ChatRole, ChatHistory};