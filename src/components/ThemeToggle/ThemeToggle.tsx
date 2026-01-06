import React from 'react';
import Icon from '@mdi/react';
import { mdiWhiteBalanceSunny, mdiMoonWaningCrescent } from '@mdi/js';
import './ThemeToggle.css';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <label className="theme-toggle-wrapper">
      <input 
        className="toggle-checkbox" 
        type="checkbox" 
        checked={theme === 'dark'}
        onChange={onToggle}
        aria-label="Toggle theme"
      />
      <div className="toggle-slot">
        <div className="sun-icon-wrapper">
          <Icon path={mdiWhiteBalanceSunny} className="sun-icon" />
        </div>
        <div className="toggle-button"></div>
        <div className="moon-icon-wrapper">
          <Icon path={mdiMoonWaningCrescent} className="moon-icon" />
        </div>
      </div>
    </label>
  );
};

export default ThemeToggle;
