import React from 'react';
import './PromptSuggestions.css';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const suggestions = [
  { icon: '💡', label: 'Brainstorm', prompt: 'Help me brainstorm ideas for...' },
  { icon: '💻', label: 'Code', prompt: 'Write code to...' },
  { icon: '📝', label: 'Summarize', prompt: 'Summarize this text...' },
  { icon: '🎯', label: 'Get advice', prompt: 'Give me advice on...' },
];

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="prompt-suggestions">
      <h1 className="welcome-title">Hello Nester, how can I help you today?</h1>
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-card"
            onClick={() => onSelectPrompt(suggestion.prompt)}
          >
            <span className="suggestion-icon">{suggestion.icon}</span>
            <span className="suggestion-label">{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;
