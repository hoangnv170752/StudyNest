import React, { useState, useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import { 
  mdiArrowUp, 
  mdiPaperclip, 
  mdiWeb, 
  mdiCodeBraces, 
  mdiFileDocument,
  mdiMicrophone,
  mdiStop
} from '@mdi/js';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isGenerating?: boolean;
  onStopGeneration?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled = false,
  placeholder = "Ask anything",
  isGenerating = false,
  onStopGeneration
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
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
