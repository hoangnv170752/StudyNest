use serde::{Deserialize, Serialize};

/// Common configuration for Crane SDK
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommonConfig {
    /// Path to model checkpoints
    pub model_path: String,
    
    /// Device to run models on (CPU/GPU)
    pub device: DeviceConfig,
    
    /// Data type for computations
    pub dtype: DataType,
    
    /// Maximum memory usage
    pub max_memory: Option<usize>,
}

impl Default for CommonConfig {
    fn default() -> Self {
        Self {
            model_path: "checkpoints".to_string(),
            device: DeviceConfig::Cpu,
            dtype: DataType::F16,
            max_memory: None,
        }
    }
}

/// Device configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceConfig {
    Cpu,
    Cuda(u32), // GPU ID
    Metal,
}

/// Data type configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataType {
    F16,
    F32,
    BF16,
}

impl std::fmt::Display for DataType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DataType::F16 => write!(f, "F16"),
            DataType::F32 => write!(f, "F32"),
            DataType::BF16 => write!(f, "BF16"),
        }
    }
}