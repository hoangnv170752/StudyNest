use crate::generation::{streamer::TokenStreamer, GenerationConfig};
use anyhow::Result;
use candle_core::{DType, Device};

pub trait ModelForCausalLM {
    fn device(&self) -> &Device;
    fn generate(
        &mut self,
        input_ids: &[u32],
        config: &GenerationConfig,
        mut streamer: Option<&mut dyn TokenStreamer>,
    ) -> Result<Vec<u32>> {
        // a default implementation
        let mut output = Vec::with_capacity(config.max_new_tokens);
        for _ in 0..config.max_new_tokens {
            let next_token = self.generate_next_token(input_ids)?;
            if let Some(streamer) = streamer.as_deref_mut() {
                streamer.append(next_token)?;
            }
            if Some(next_token) == config.eos_token_id {
                break;
            }
            output.push(next_token);
        }
        Ok(output)
    }

    fn generate_next_token(&self, input_ids: &[u32]) -> Result<u32> {
        unimplemented!("Implement specific token generation logic")
    }
}
