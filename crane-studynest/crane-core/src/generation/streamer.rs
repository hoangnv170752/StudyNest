use anyhow::Result;
use std::sync::mpsc;

use crate::autotokenizer::AutoTokenizer;

pub trait TokenStreamer {
    fn append(&mut self, token_id: u32) -> Result<()>;
    fn finalize(&mut self) -> Result<()>;
}

pub struct TextStreamer {
    pub tokenizer: AutoTokenizer,
    pub buffer: String,
}

impl TokenStreamer for TextStreamer {
    fn append(&mut self, token_id: u32) -> Result<()> {
        let token = self
            .tokenizer
            .decode(&[token_id], true)
            .expect("decode failed");
        self.buffer.push_str(&token);
        Ok(())
    }

    fn finalize(&mut self) -> Result<()> {
        println!();
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub enum StreamerMessage {
    Token(String), // Decoded token text
    End,
}

pub struct AsyncTextStreamer {
    tokenizer: AutoTokenizer,
    sender: mpsc::Sender<StreamerMessage>,
}

impl AsyncTextStreamer {
    pub fn new(tokenizer: AutoTokenizer) -> (Self, mpsc::Receiver<StreamerMessage>) {
        let (sender, receiver) = mpsc::channel();
        let streamer = Self { tokenizer, sender };
        (streamer, receiver)
    }
}

impl TokenStreamer for AsyncTextStreamer {
    fn append(&mut self, token_id: u32) -> Result<()> {
        let token = self
            .tokenizer
            .decode(&[token_id], true)
            .map_err(|e| anyhow::anyhow!("Decode failed: {}", e))?;

        self.sender
            .send(StreamerMessage::Token(token))
            .map_err(|e| anyhow::anyhow!("Failed to send token through channel: {}", e))?;

        Ok(())
    }

    fn finalize(&mut self) -> Result<()> {
        self.sender
            .send(StreamerMessage::End)
            .map_err(|e| anyhow::anyhow!("Failed to send end message through channel: {}", e))?;
        Ok(())
    }
}
