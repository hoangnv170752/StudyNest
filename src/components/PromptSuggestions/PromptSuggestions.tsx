import React from 'react';
import './PromptSuggestions.css';
import { suggestions } from './promptSuggestionsData';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="prompt-suggestions">
      <h1 className="welcome-title">Hello Nester, how can I help you today?</h1>
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => {
          const IconComponent = suggestion.icon;
          return (
            <button
              key={index}
              className="suggestion-card"
              onClick={() => onSelectPrompt(suggestion.prompt)}
            >
              <span className="suggestion-icon">
                <IconComponent />
              </span>
              <span className="suggestion-label">{suggestion.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PromptSuggestions;
