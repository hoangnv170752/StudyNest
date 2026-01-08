import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiRocket, mdiAlphaL } from '@mdi/js';
import './HowToUseModal.css';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OS = 'windows' | 'macos' | 'linux';

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  const [selectedOS, setSelectedOS] = useState<OS>('macos');
  const [selectedMethod, setSelectedMethod] = useState<'crane' | 'ollama'>('crane');

  if (!isOpen) return null;

  const getRustInstallInstructions = () => {
    switch (selectedOS) {
      case 'windows':
        return (
          <div className="code-block">
            <code>
              # Download and run rustup-init.exe from:<br/>
              https://rustup.rs/<br/>
              <br/>
              # Verify installation in PowerShell:<br/>
              rustc --version<br/>
              cargo --version
            </code>
          </div>
        );
      case 'macos':
      case 'linux':
        return (
          <div className="code-block">
            <code>
              # Install Rust toolchain<br/>
              curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh<br/>
              <br/>
              # Verify installation<br/>
              rustc --version<br/>
              cargo --version
            </code>
          </div>
        );
    }
  };

  const getOllamaInstallInstructions = () => {
    switch (selectedOS) {
      case 'windows':
        return (
          <div className="code-block">
            <code>
              1. Download from: https://ollama.com/download/windows<br/>
              2. Run the installer (OllamaSetup.exe)<br/>
              3. Follow the installation wizard<br/>
              4. Ollama will start automatically after installation
            </code>
          </div>
        );
      case 'macos':
        return (
          <div className="code-block">
            <code>
              # Method 1: Download installer<br/>
              Download from: https://ollama.com/download/mac<br/>
              <br/>
              # Method 2: Using Terminal<br/>
              curl -fsSL https://ollama.com/install.sh | sh
            </code>
          </div>
        );
      case 'linux':
        return (
          <div className="code-block">
            <code>
              # Install using curl<br/>
              curl -fsSL https://ollama.com/install.sh | sh<br/>
              <br/>
              # Or manually download from:<br/>
              https://ollama.com/download/linux
            </code>
          </div>
        );
    }
  };

  const getPullCommands = () => {
    const isWindows = selectedOS === 'windows';
    return (
      <div className="code-block">
        <code>
          # Lightweight models (recommended for students)<br/>
          ollama pull tinyllama:1.1b<br/>
          ollama pull phi3:mini<br/>
          <br/>
          # More powerful models<br/>
          ollama pull llama3.2:3b<br/>
          ollama pull mistral:7b
        </code>
      </div>
    );
  };

  return (
    <div className="how-to-modal-overlay" onClick={onClose}>
      <div className="how-to-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="how-to-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="how-to-content">
          <h2 className="how-to-title">How to Use StudyNest</h2>
          
          <div className="os-selector">
            <label htmlFor="os-select">Select your operating system:</label>
            <select 
              id="os-select"
              value={selectedOS} 
              onChange={(e) => setSelectedOS(e.target.value as OS)}
              className="os-dropdown"
            >
              <option value="windows">Windows</option>
              <option value="macos">macOS</option>
              <option value="linux">Linux</option>
            </select>
          </div>

          <section className="how-to-section">
            <h3>Choose Your AI Backend</h3>
            <div className="method-selector">
              <button 
                className={`method-button ${selectedMethod === 'crane' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('crane')}
              >
                <Icon path={mdiRocket} size={0.9} />
                <span>Crane Service (Recommended)</span>
              </button>
              <button 
                className={`method-button ${selectedMethod === 'ollama' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('ollama')}
              >
                <Icon path={mdiAlphaL} size={0.9} />
                <span>Ollama</span>
              </button>
            </div>
          </section>

          {selectedMethod === 'crane' ? (
            <>
              <section className="how-to-section">
                <h3>1. Install Rust</h3>
                <p>Crane service requires Rust toolchain to compile the AI engine.</p>
                {getRustInstallInstructions()}
              </section>

              <section className="how-to-section">
                <h3>2. Download AI Models</h3>
                <p>Download Qwen models from HuggingFace:</p>
                <div className="code-block">
                  <code>
                    # Install huggingface-cli<br/>
                    pip install huggingface-hub<br/>
                    <br/>
                    # Download Qwen 2.5 (0.5B) - Fast & lightweight<br/>
                    huggingface-cli download Qwen/Qwen2.5-0.5B-Instruct \<br/>
                    &nbsp;&nbsp;--local-dir crane-studynest/checkpoints/Qwen2.5-0.5B-Instruct<br/>
                    <br/>
                    # Or Qwen 2.5 (1.5B) - Better quality<br/>
                    huggingface-cli download Qwen/Qwen2.5-1.5B-Instruct \<br/>
                    &nbsp;&nbsp;--local-dir crane-studynest/checkpoints/Qwen2.5-1.5B-Instruct
                  </code>
                </div>
              </section>

              <section className="how-to-section">
                <h3>3. Run StudyNest</h3>
                <p>The Crane service will automatically compile and start when you run the app:</p>
                <div className="code-block">
                  <code>
                    pnpm run dev
                  </code>
                </div>
                <p><strong>Note:</strong> First run takes 2-3 minutes to compile Rust code. Subsequent runs are instant!</p>
              </section>
            </>
          ) : (
            <>
              <section className="how-to-section">
                <h3>1. Install Ollama</h3>
                <p>StudyNest uses Ollama to run AI models locally on your computer.</p>
                {getOllamaInstallInstructions()}
              </section>

              <section className="how-to-section">
                <h3>2. Pull AI Models</h3>
                <p>After installing Ollama, open {selectedOS === 'windows' ? 'Command Prompt or PowerShell' : 'Terminal'} and pull models using these commands:</p>
                {getPullCommands()}
              </section>
            </>
          )}

          <section className="how-to-section">
            <h3>{selectedMethod === 'crane' ? '4' : '3'}. Recommended Models for Students</h3>
            <div className="model-recommendations">
              {selectedMethod === 'crane' ? (
                <>
                  <div className="model-card">
                    <h4>🚀 Qwen 2.5 (0.5B)</h4>
                    <p><strong>Best for:</strong> Quick answers, basic homework help</p>
                    <p><strong>Size:</strong> ~1GB download, ~2GB RAM</p>
                    <p><strong>Speed:</strong> Very fast with Metal GPU (Apple Silicon)</p>
                  </div>
                  
                  <div className="model-card">
                    <h4>⚡ Qwen 2.5 (1.5B)</h4>
                    <p><strong>Best for:</strong> Detailed explanations, coding help</p>
                    <p><strong>Size:</strong> ~3GB download, ~4GB RAM</p>
                    <p><strong>Speed:</strong> Fast, excellent quality</p>
                  </div>
                  
                  <div className="model-card">
                    <h4>🎯 Qwen 2.5 (3B)</h4>
                    <p><strong>Best for:</strong> Essays, research, complex topics</p>
                    <p><strong>Size:</strong> ~6GB download, ~8GB RAM</p>
                    <p><strong>Speed:</strong> Balanced, high quality</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="model-card">
                    <h4>🚀 TinyLlama 1.1B</h4>
                    <p><strong>Best for:</strong> Quick answers, basic homework help</p>
                    <p><strong>Size:</strong> ~637MB</p>
                    <p><strong>Speed:</strong> Very fast, works offline</p>
                  </div>
                  
                  <div className="model-card">
                    <h4>⚡ Phi-3 Mini</h4>
                    <p><strong>Best for:</strong> Math, coding, detailed explanations</p>
                    <p><strong>Size:</strong> ~2.3GB</p>
                    <p><strong>Speed:</strong> Fast, excellent quality</p>
                  </div>
                  
                  <div className="model-card">
                    <h4>🎯 Llama 3.2 3B</h4>
                    <p><strong>Best for:</strong> Essays, research, complex topics</p>
                    <p><strong>Size:</strong> ~2GB</p>
                    <p><strong>Speed:</strong> Balanced performance</p>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="how-to-section">
            <h3>{selectedMethod === 'crane' ? '5' : '4'}. Offline Study Mode</h3>
            <p>
              <strong>Perfect for students!</strong> Once you've downloaded models, 
              you can turn off WiFi and still use StudyNest. All AI processing 
              happens locally on your computer - no internet required!
            </p>
            <ul>
              <li>Study anywhere without internet</li>
              <li>Complete privacy - your data never leaves your device</li>
              <li>No subscription fees or API costs</li>
              <li>Fast responses without network delays</li>
              {selectedMethod === 'crane' && selectedOS === 'macos' && (
                <li>Automatic Metal GPU acceleration on Apple Silicon (M1/M2/M3)</li>
              )}
            </ul>
          </section>

          <section className="how-to-section">
            <h3>{selectedMethod === 'crane' ? '6' : '5'}. Start Chatting</h3>
            {selectedMethod === 'crane' ? (
              <p>
                1. Models will be automatically detected from checkpoints folder<br/>
                2. Select a Crane model from the dropdown (e.g., "Qwen 2.5 (0.5B) Instruct")<br/>
                3. Type your question and press Enter or click Send<br/>
                4. First message takes 30-60s to load model, then it's fast!<br/>
                5. Enjoy learning with AI assistance!
              </p>
            ) : (
              <p>
                1. Make sure Ollama is running (it starts automatically after installation)<br/>
                2. Select a model from the dropdown in the chat input<br/>
                3. Type your question and press Enter or click Send<br/>
                4. Enjoy learning with AI assistance!
              </p>
            )}
          </section>

          <div className="how-to-footer">
            <p>
              <strong>Need help?</strong> Visit{' '}
              {selectedMethod === 'crane' ? (
                <a href="https://huggingface.co/Qwen" target="_blank" rel="noopener noreferrer">
                  Qwen Models on HuggingFace
                </a>
              ) : (
                <a href="https://ollama.com/library" target="_blank" rel="noopener noreferrer">
                  Ollama Model Library
                </a>
              )}{' '}
              for more models and documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUseModal;
