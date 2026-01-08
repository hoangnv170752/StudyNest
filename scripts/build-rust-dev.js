#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const platform = os.platform();
const binaryName = platform === 'win32' ? 'chat-service.exe' : 'chat-service';

console.log('[Build Rust Dev] Starting Rust service build for development...');

const projectRoot = path.join(__dirname, '..');
const craneDir = path.join(projectRoot, 'crane-studynest');
const distDir = path.join(projectRoot, 'dist', 'bin');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  // Check if crane-studynest directory exists
  if (!fs.existsSync(craneDir)) {
    console.warn('[Build Rust Dev] Warning: crane-studynest directory not found!');
    console.warn('[Build Rust Dev] Skipping Rust build. Service will use cargo run in development.');
    process.exit(0);
  }

  // Build the Rust service (release mode for better performance even in dev)
  console.log('[Build Rust Dev] Building Rust service...');
  execSync('cargo build --bin chat-service --release', {
    cwd: craneDir,
    stdio: 'inherit'
  });

  // Copy to dist directory
  const sourcePath = path.join(craneDir, 'target', 'release', binaryName);
  const destPath = path.join(distDir, binaryName);

  if (fs.existsSync(sourcePath)) {
    console.log('[Build Rust Dev] Copying binary to dist...');
    fs.copyFileSync(sourcePath, destPath);

    // Make executable on Unix-like systems
    if (platform !== 'win32') {
      fs.chmodSync(destPath, 0o755);
    }

    console.log('[Build Rust Dev] ✓ Rust service built successfully!');
  } else {
    console.warn('[Build Rust Dev] Warning: Binary not found, will use cargo run in development');
  }

} catch (error) {
  console.warn('[Build Rust Dev] Build warning:', error.message);
  console.warn('[Build Rust Dev] Development mode will use cargo run instead');
  // Don't exit with error in dev mode
  process.exit(0);
}
