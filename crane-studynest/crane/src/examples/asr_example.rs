//! Example of using the Crane SDK for ASR (Automatic Speech Recognition)

use crane::prelude::*;

fn main() -> CraneResult<()> {
    // Create an ASR configuration
    let config = CommonConfig {
        model_path: "checkpoints/moonshine".to_string(), // Adjust path as needed
        device: DeviceConfig::Cpu,
        dtype: DataType::F16,
        max_memory: None,
    };
    
    // Create a new ASR client
    let asr_client = AsrClient::new(config)?;
    
    // Transcribe an audio file
    let transcription = asr_client.transcribe_from_file("data/audio_sample.wav")?;
    println!("Transcription: {}", transcription);
    
    Ok(())
}