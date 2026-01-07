import React, { useState, useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import { 
  mdiArrowUp, 
  mdiPaperclip, 
  mdiWeb, 
  mdiCodeBraces, 
  mdiFileDocument,
  mdiMicrophone,
  mdiStop,
  mdiChevronDown,
  mdiDownload,
  mdiCheckCircle
} from '@mdi/js';
import { Switch, FormControlLabel } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string, model?: string, deepThinking?: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  isGenerating?: boolean;
  onStopGeneration?: () => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  deepThinking?: boolean;
  onDeepThinkingChange?: (enabled: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled = false,
  placeholder = "Ask anything",
  isGenerating = false,
  onStopGeneration,
  selectedModel = '',
  onModelChange,
  deepThinking = false,
  onDeepThinkingChange
}) => {
  const [input, setInput] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([]);
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      console.log('ChatInput: Checking for ollama API...', window.electron?.ollama);
      if (window.electron?.ollama) {
        try {
          console.log('ChatInput: Fetching models...');
          const models = await window.electron.ollama.listModels();
          console.log('ChatInput: Received models:', models);
          
          // Convert model names to display format
          const formattedModels = models.map((modelName: string) => ({
            id: modelName,
            name: formatModelName(modelName)
          }));
          
          console.log('ChatInput: Formatted models:', formattedModels);
          setAvailableModels(formattedModels);
          
          // Set first available model as default if not already selected
          if (formattedModels.length > 0 && onModelChange && !selectedModel) {
            onModelChange(formattedModels[0].id);
          }
        } catch (error) {
          console.error('Failed to fetch models:', error);
        }
      } else {
        console.log('ChatInput: window.electron.ollama not available');
      }
    };

    fetchModels();
    const interval = setInterval(fetchModels, 10000);
    return () => clearInterval(interval);
  }, [onModelChange, selectedModel]);
  
  const formatModelName = (modelName: string): string => {
    const cleanName = modelName.replace(':latest', '');
    
    const parts = cleanName.split(':');
    const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    
    if (parts.length > 1) {
      return `${baseName} ${parts[1].toUpperCase()}`;
    }
    
    return baseName;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim(), selectedModel, deepThinking);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleModelSelect = (modelId: string) => {
    if (onModelChange) {
      onModelChange(modelId);
    }
    setShowModelDropdown(false);
  };

  const getModelName = (modelId: string) => {
    return availableModels.find(m => m.id === modelId)?.name || formatModelName(modelId);
  };

  const isModelAvailable = (modelId: string) => {
    // Model is available if it exists in the list (since we only show installed models)
    return true;
  };

  const handleDownloadModel = async (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.electron?.ollama) {
      setDownloadingModels(prev => new Set(prev).add(modelId));
      try {
        await window.electron.ollama.pullModel(modelId);
        // Refresh model list
        const models = await window.electron.ollama.listModels();
        const formattedModels = models.map((modelName: string) => ({
          id: modelName,
          name: formatModelName(modelName)
        }));
        setAvailableModels(formattedModels);
      } catch (error) {
        console.error('Failed to download model:', error);
      } finally {
        setDownloadingModels(prev => {
          const next = new Set(prev);
          next.delete(modelId);
          return next;
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-wrapper">
          <div className="model-controls">
            <div className="model-selector-container" ref={dropdownRef}>
              <button
                type="button"
                className="model-selector-button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                title="Select model"
              >
                <span className="model-name">{getModelName(selectedModel)}</span>
                <Icon path={mdiChevronDown} size={0.7} />
              </button>
            {showModelDropdown && (
              <div className="model-dropdown">
                {availableModels.length > 0 ? (
                  availableModels.map((model) => {
                    const downloading = downloadingModels.has(model.id);
                    return (
                      <div
                        key={model.id}
                        className={`model-option-wrapper ${selectedModel === model.id ? 'active' : ''}`}
                      >
                        <button
                          type="button"
                          className="model-option"
                          onClick={() => handleModelSelect(model.id)}
                        >
                          <span className="model-option-name">{model.name}</span>
                          <Icon path={mdiCheckCircle} size={0.7} className="model-available-icon" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="model-option-wrapper">
                    <div className="model-option" style={{ opacity: 0.6, cursor: 'default' }}>
                      <span className="model-option-name">No models installed</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
            <div className="deep-thinking-toggle">
              <FormControlLabel
                control={
                  <Switch
                    checked={deepThinking}
                    onChange={(e) => onDeepThinkingChange?.(e.target.checked)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'var(--color-primary)',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'var(--color-primary)',
                      },
                    }}
                  />
                }
                label={
                  <span className="deep-thinking-label">
                    <PsychologyIcon sx={{ fontSize: 16 }} />
                    {deepThinking ? 'Deep Thinking' : 'Normal'}
                  </span>
                }
                sx={{
                  margin: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  },
                }}
              />
            </div>
          </div>
          {/* <div className="input-actions-left">
            <button 
              type="button" 
              className="action-button"
              title="Attach file"
            >
              <Icon path={mdiPaperclip} size={0.85} />
            </button>
            <button 
              type="button" 
              className="action-button"
              title="Browse web"
            >
              <Icon path={mdiWeb} size={0.85} />
            </button>
            <button 
              type="button" 
              className="action-button"
              title="Code interpreter"
            >
              <Icon path={mdiCodeBraces} size={0.85} />
            </button>
            <button 
              type="button" 
              className="action-button"
              title="Create document"
            >
              <Icon path={mdiFileDocument} size={0.85} />
            </button>
            <div className="model-selector">5.2</div>
          </div> */}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="chat-textarea"
            rows={1}
          />

          <div className="input-actions-right">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="stop-button"
                title="Stop generating"
              >
                <Icon path={mdiStop} size={0.9} />
              </button>
            ) : (
              <>
                {/* <button 
                  type="button" 
                  className="action-button voice-button"
                  title="Voice input"
                >
                  <Icon path={mdiMicrophone} size={0.9} />
                </button> */}
                <button
                  type="submit"
                  disabled={!input.trim() || disabled}
                  className="send-button"
                  title="Send message"
                >
                  <Icon path={mdiArrowUp} size={0.85} />
                </button>
              </>
            )}
          </div>
        </div>
      </form>
      <div className="input-footer">
        StudyNest can make mistakes. Consider checking important information.
      </div>
    </div>
  );
};

export default ChatInput;
