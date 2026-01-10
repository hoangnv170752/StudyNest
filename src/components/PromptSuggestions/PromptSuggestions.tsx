import React, { useState, useEffect } from 'react';
import './PromptSuggestions.css';
import { suggestions } from './promptSuggestionsData';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  const [username, setUsername] = useState('Nester');

  useEffect(() => {
    const savedUsername = localStorage.getItem('studynest_username') || 'Nester';
    setUsername(savedUsername);

    const handleStorageChange = () => {
      const updatedUsername = localStorage.getItem('studynest_username') || 'Nester';
      setUsername(updatedUsername);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="prompt-suggestions">
      <h1 className="welcome-title">Hello {username}, how can I help you today?</h1>
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
