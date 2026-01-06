import React, { useState } from 'react';
import './HowToUseModal.css';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OS = 'windows' | 'macos' | 'linux';

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  const [selectedOS, setSelectedOS] = useState<OS>('macos');

  if (!isOpen) return null;

  const getInstallInstructions = () => {
    switch (selectedOS) {
      case 'windows':
        return (
          <>
            <p>Download and install Ollama for Windows:</p>
            <div className="code-block">
              <code>
                1. Download from: https://ollama.com/download/windows<br/>
                2. Run the installer (OllamaSetup.exe)<br/>
                3. Follow the installation wizard<br/>
                4. Ollama will start automatically after installation
              </code>
            </div>
          </>
        );
      case 'macos':
        return (
          <>
            <p>Install Ollama on macOS using one of these methods:</p>
            <div className="code-block">
              <code>
                # Method 1: Download installer<br/>
                Download from: https://ollama.com/download/mac<br/>
                <br/>
                # Method 2: Using Terminal<br/>
                curl -fsSL https://ollama.com/install.sh | sh
              </code>
            </div>
          </>
        );
      case 'linux':
        return (
          <>
            <p>Install Ollama on Linux:</p>
            <div className="code-block">
              <code>
                # Install using curl<br/>
                curl -fsSL https://ollama.com/install.sh | sh<br/>
                <br/>
                # Or manually download from:<br/>
                https://ollama.com/download/linux
              </code>
            </div>
          </>
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
            <h3>1. Install Ollama</h3>
            <p>StudyNest uses Ollama to run AI models locally on your computer.</p>
            {getInstallInstructions()}
          </section>

          <section className="how-to-section">
            <h3>2. Pull AI Models</h3>
            <p>After installing Ollama, open {selectedOS === 'windows' ? 'Command Prompt or PowerShell' : 'Terminal'} and pull models using these commands:</p>
            {getPullCommands()}
          </section>

          <section className="how-to-section">
            <h3>3. Recommended Models for Students</h3>
            <div className="model-recommendations">
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
            </div>
          </section>

          <section className="how-to-section">
            <h3>4. Offline Study Mode</h3>
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
            </ul>
          </section>

          <section className="how-to-section">
            <h3>5. Start Chatting</h3>
            <p>
              1. Make sure Ollama is running (it starts automatically after installation)<br/>
              2. Select a model from the dropdown in the chat input<br/>
              3. Type your question and press Enter or click Send<br/>
              4. Enjoy learning with AI assistance!
            </p>
          </section>

          <div className="how-to-footer">
            <p>
              <strong>Need help?</strong> Visit{' '}
              <a href="https://ollama.com/library" target="_blank" rel="noopener noreferrer">
                Ollama Model Library
              </a>{' '}
              for more models and documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUseModal;
