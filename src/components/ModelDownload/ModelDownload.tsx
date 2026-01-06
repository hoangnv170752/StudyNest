import React, { useEffect, useState } from 'react';
import { ModelDownloadProgress } from '../../types/electron';
import './ModelDownload.css';

interface ModelDownloadProps {
  onComplete: () => void;
}

export const ModelDownload: React.FC<ModelDownloadProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<ModelDownloadProgress>({
    status: 'checking',
    message: 'Initializing...'
  });

  useEffect(() => {
    const startDownload = async () => {
      try {
        if (!window.electron?.model) {
          setProgress({
            status: 'error',
            message: 'Electron API not available'
          });
          return;
        }

        window.electron.model.onDownloadProgress((progressData) => {
          setProgress(progressData);
          if (progressData.status === 'completed') {
            setTimeout(() => {
              onComplete();
            }, 1500);
          }
        });

        const isDownloaded = await window.electron.model.isDownloaded();
        if (isDownloaded) {
          setProgress({
            status: 'completed',
            progress: 100,
            message: 'Model already available'
          });
          setTimeout(() => {
            onComplete();
          }, 1000);
          return;
        }

        await window.electron.model.download();
      } catch (error) {
        console.error('Download error:', error);
        setProgress({
          status: 'error',
          message: error instanceof Error ? error.message : 'Download failed'
        });
      }
    };

    startDownload();

    return () => {
      if (window.electron?.model) {
        window.electron.model.removeDownloadProgressListener();
      }
    };
  }, [onComplete]);

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'checking':
        return '🔍';
      case 'downloading':
        return '⬇️';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'checking':
        return 'Checking system...';
      case 'downloading':
        return 'Downloading model...';
      case 'completed':
        return 'Ready to use!';
      case 'error':
        return 'Error occurred';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="model-download">
      <div className="model-download-container">
        <div className="model-download-icon">{getStatusIcon()}</div>
        <h1 className="model-download-title">Setting up StudyNest</h1>
        <p className="model-download-status">{getStatusText()}</p>
        
        {progress.message && (
          <p className="model-download-message">{progress.message}</p>
        )}

        {(progress.status === 'downloading' || progress.status === 'checking') && (
          <div className="network-notice">
            <p>⚠️ Please keep your WiFi/LAN connection stable during download</p>
          </div>
        )}

        {progress.status === 'downloading' && progress.progress !== undefined && (
          <div className="model-download-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <span className="progress-text">{progress.progress}%</span>
          </div>
        )}

        {progress.status === 'error' && (
          <div className="model-download-error">
            <p>Please ensure Ollama is installed:</p>
            <a 
              href="https://ollama.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="download-link"
            >
              Download Ollama
            </a>
          </div>
        )}

        {progress.status === 'checking' && (
          <div className="model-download-spinner">
            <div className="spinner" />
          </div>
        )}
      </div>
    </div>
  );
};
