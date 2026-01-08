//! Device selection utilities for CPU/GPU inference

use candle_core::Device;
use crate::error::{Result, StudyNestError};

/// Supported device types
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DeviceType {
    /// CPU inference
    Cpu,
    /// CUDA GPU inference (specify GPU index)
    Cuda(usize),
    /// Metal GPU inference (macOS only)
    Metal,
    /// Automatically select best available device
    Auto,
}

impl Default for DeviceType {
    fn default() -> Self {
        DeviceType::Auto
    }
}

impl std::fmt::Display for DeviceType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DeviceType::Cpu => write!(f, "CPU"),
            DeviceType::Cuda(id) => write!(f, "CUDA:{}", id),
            DeviceType::Metal => write!(f, "Metal"),
            DeviceType::Auto => write!(f, "Auto"),
        }
    }
}

/// Get the candle Device based on DeviceType
pub fn get_device(device_type: DeviceType) -> Result<Device> {
    match device_type {
        DeviceType::Cpu => Ok(Device::Cpu),
        
        DeviceType::Cuda(gpu_id) => {
            #[cfg(feature = "cuda")]
            {
                Device::cuda_if_available(gpu_id)
                    .map_err(|e| StudyNestError::DeviceError(format!("CUDA error: {}", e)))
            }
            #[cfg(not(feature = "cuda"))]
            {
                Err(StudyNestError::FeatureNotEnabled(
                    "CUDA feature not enabled. Compile with --features cuda".to_string()
                ))
            }
        }
        
        DeviceType::Metal => {
            #[cfg(target_os = "macos")]
            {
                Device::new_metal(0)
                    .map_err(|e| StudyNestError::DeviceError(format!("Metal error: {}", e)))
            }
            #[cfg(not(target_os = "macos"))]
            {
                Err(StudyNestError::DeviceError(
                    "Metal is only available on macOS".to_string()
                ))
            }
        }
        
        DeviceType::Auto => {
            // Note: Metal GPU has compatibility issues with some operations (e.g., rms-norm)
            // For now, we use CPU for better stability
            // TODO: Re-enable Metal when candle-core fully supports all Qwen operations
            
            // Try CUDA first if available
            #[cfg(feature = "cuda")]
            {
                if let Ok(device) = Device::cuda_if_available(0) {
                    if !matches!(device, Device::Cpu) {
                        println!("[StudyNest] Using CUDA GPU");
                        return Ok(device);
                    }
                }
            }
            
            // Use CPU for stability (Metal has rms-norm issues)
            println!("[StudyNest] Using CPU (Metal GPU disabled due to compatibility issues)");
            Ok(Device::Cpu)
        }
    }
}

/// Check available devices and print info
pub fn print_device_info() {
    println!("=== StudyNest Device Info ===");
    
    // CPU always available
    println!("✓ CPU: Available");
    
    // Check CUDA
    #[cfg(feature = "cuda")]
    {
        match Device::cuda_if_available(0) {
            Ok(device) if !matches!(device, Device::Cpu) => {
                println!("✓ CUDA: Available");
            }
            _ => println!("✗ CUDA: Not available"),
        }
    }
    #[cfg(not(feature = "cuda"))]
    {
        println!("✗ CUDA: Feature not enabled");
    }
    
    // Check Metal
    #[cfg(target_os = "macos")]
    {
        match Device::new_metal(0) {
            Ok(_) => println!("✓ Metal: Available"),
            Err(_) => println!("✗ Metal: Not available"),
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        println!("✗ Metal: Not available (not macOS)");
    }
    
    println!("=============================");
}
