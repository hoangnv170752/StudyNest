import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiMessageText, mdiTrashCanOutline, mdiCoffee, mdiPencil } from '@mdi/js';
import { Conversation } from '../../types/chat';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import DonationModal from '../DonationModal/DonationModal';
import AuthorModal from '../AuthorModal/AuthorModal';
import HowToUseModal from '../HowToUseModal/HowToUseModal';
import SettingsModal from '../SettingsModal/SettingsModal';
import './Sidebar.css';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  theme,
  onThemeToggle
}) => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isHowToUseModalOpen, setIsHowToUseModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [username, setUsername] = useState('Nester');

  useEffect(() => {
    const savedUsername = localStorage.getItem('studynest_username') || 'Nester';
    setUsername(savedUsername);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedUsername = localStorage.getItem('studynest_username') || 'Nester';
      setUsername(savedUsername);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRenameStart = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      onRenameConversation(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-button" onClick={onNewConversation}>
          <Icon path={mdiPlus} size={0.8} />
          New chat
        </button>
      </div>

      <div className="conversations-list">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
            onClick={() => renamingId !== conv.id && onSelectConversation(conv.id)}
          >
            <Icon path={mdiMessageText} size={0.7} className="conversation-icon" />
            {renamingId === conv.id ? (
              <input
                type="text"
                className="conversation-rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameSubmit(conv.id);
                  } else if (e.key === 'Escape') {
                    handleRenameCancel();
                  }
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="conversation-title">{conv.title}</div>
            )}
            <button
              className="rename-conversation"
              onClick={(e) => handleRenameStart(e, conv)}
            >
              <Icon path={mdiPencil} size={0.6} />
            </button>
            <button
              className="delete-conversation"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
            >
              <Icon path={mdiTrashCanOutline} size={0.6} />
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="theme-toggle-container">
          <span className="theme-label">Theme</span>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
        <button 
          className="info-link"
          onClick={() => setIsSettingsModalOpen(true)}
        >
          Settings
        </button>
         <button 
          className="donation-button"
          onClick={() => setIsDonationModalOpen(true)}
          aria-label="Support with coffee"
        >
          <Icon path={mdiCoffee} size={0.9} className="donation-icon" />
          <span className="donation-label">Support with Coffee</span>
        </button>
        <div className="model-info">
          <button 
            className="info-link"
            onClick={() => setIsAuthorModalOpen(true)}
          >
            Who is the author?
          </button>
          <button 
            className="info-link"
            onClick={() => setIsHowToUseModalOpen(true)}
          >
            How to use
          </button>
        </div>
      </div>

      <DonationModal 
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
      <AuthorModal 
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
      />
      <HowToUseModal 
        isOpen={isHowToUseModalOpen}
        onClose={() => setIsHowToUseModalOpen(false)}
      />
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          const savedUsername = localStorage.getItem('studynest_username') || 'Nester';
          setUsername(savedUsername);
        }}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />
    </div>
  );
};

export default Sidebar;
