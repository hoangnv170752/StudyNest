import React from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button 
      className="theme-toggle" 
      onClick={onToggle}
      aria-label="Toggle theme"
    >
      <div className={`toggle-track ${theme === 'dark' ? 'dark' : 'light'}`}>
        <div className="toggle-thumb">
          {theme === 'light' ? '☀️' : '🌙'}
        </div>
      </div>
      <span className="toggle-label">
        {theme === 'light' ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};

export default ThemeToggle;
