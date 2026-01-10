import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeToggle
}) => {
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('studynest_username') || 'Nester';
    setUsername(savedUsername);
    setTempUsername(savedUsername);
  }, [isOpen]);

  const handleSave = () => {
    const finalUsername = tempUsername.trim() || 'Nester';
    setUsername(finalUsername);
    localStorage.setItem('studynest_username', finalUsername);
    onClose();
  };

  const handleCancel = () => {
    setTempUsername(username);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="close-button" onClick={handleCancel}>
            <Icon path={mdiClose} size={1} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <label className="settings-label">Username</label>
            <p className="settings-description">
              This name will be displayed in your greeting message
            </p>
            <input
              type="text"
              className="settings-input"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
            />
            <p className="settings-preview">
              Preview: <strong>Hello {tempUsername.trim() || 'Nester'}!</strong>
            </p>
          </div>

          <div className="settings-section">
            <label className="settings-label">Theme</label>
            <p className="settings-description">
              Choose your preferred color scheme
            </p>
            <div className="theme-toggle-wrapper">
              <span className="theme-option-label">Light</span>
              <ThemeToggle theme={theme} onToggle={onThemeToggle} />
              <span className="theme-option-label">Dark</span>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-button secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="settings-button primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
