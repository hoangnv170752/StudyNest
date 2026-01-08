#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const platform = os.platform();
const arch = os.arch();

console.log('[Build Rust] Starting Rust service build...');
console.log(`[Build Rust] Platform: ${platform}, Architecture: ${arch}`);

// Determine target triple
let target = '';
let binaryName = 'chat-service';

if (platform === 'darwin') {
  if (arch === 'arm64') {
    target = 'aarch64-apple-darwin';
  } else {
    target = 'x86_64-apple-darwin';
  }
} else if (platform === 'win32') {
  target = 'x86_64-pc-windows-msvc';
  binaryName = 'chat-service.exe';
} else if (platform === 'linux') {
  target = 'x86_64-unknown-linux-gnu';
}

const projectRoot = path.join(__dirname, '..');
const craneDir = path.join(projectRoot, 'crane-studynest');
const resourcesDir = path.join(projectRoot, 'resources', 'bin');
const distDir = path.join(projectRoot, 'dist', 'bin');

// Create directories if they don't exist
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  // Check if crane-studynest directory exists
  if (!fs.existsSync(craneDir)) {
    console.error('[Build Rust] Error: crane-studynest directory not found!');
    console.error('[Build Rust] Expected at:', craneDir);
    process.exit(1);
  }

  // Build the Rust service
  console.log('[Build Rust] Building Rust service...');
  const buildCmd = target 
    ? `cargo build --bin chat-service --release --target ${target}`
    : `cargo build --bin chat-service --release`;
  
  execSync(buildCmd, {
    cwd: craneDir,
    stdio: 'inherit'
  });

  // Determine source path
  const sourcePath = target
    ? path.join(craneDir, 'target', target, 'release', binaryName)
    : path.join(craneDir, 'target', 'release', binaryName);

  // Check if binary was built
  if (!fs.existsSync(sourcePath)) {
    console.error('[Build Rust] Error: Binary not found at:', sourcePath);
    process.exit(1);
  }

  // Copy to resources and dist directories
  const resourcesDest = path.join(resourcesDir, binaryName);
  const distDest = path.join(distDir, binaryName);

  console.log('[Build Rust] Copying binary to resources...');
  fs.copyFileSync(sourcePath, resourcesDest);
  
  console.log('[Build Rust] Copying binary to dist...');
  fs.copyFileSync(sourcePath, distDest);

  // Make executable on Unix-like systems
  if (platform !== 'win32') {
    fs.chmodSync(resourcesDest, 0o755);
    fs.chmodSync(distDest, 0o755);
  }

  console.log('[Build Rust] ✓ Rust service built successfully!');
  console.log('[Build Rust] Binary location:', resourcesDest);
  
  // Get binary size
  const stats = fs.statSync(resourcesDest);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`[Build Rust] Binary size: ${sizeMB} MB`);

} catch (error) {
  console.error('[Build Rust] Build failed:', error.message);
  process.exit(1);
}
