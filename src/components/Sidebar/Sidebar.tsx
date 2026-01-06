import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiMessageText, mdiTrashCanOutline, mdiCoffee } from '@mdi/js';
import { Conversation } from '../../types/chat';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import DonationModal from '../DonationModal/DonationModal';
import AuthorModal from '../AuthorModal/AuthorModal';
import HowToUseModal from '../HowToUseModal/HowToUseModal';
import './Sidebar.css';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  theme,
  onThemeToggle
}) => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isHowToUseModalOpen, setIsHowToUseModalOpen] = useState(false);

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
            onClick={() => onSelectConversation(conv.id)}
          >
            <Icon path={mdiMessageText} size={0.7} className="conversation-icon" />
            <div className="conversation-title">{conv.title}</div>
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
        <button 
          className="donation-button"
          onClick={() => setIsDonationModalOpen(true)}
          aria-label="Support with coffee"
        >
          <span className="donation-icon">☕</span>
          <span className="donation-label">Support with Coffee</span>
        </button>
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
    </div>
  );
};

export default Sidebar;
