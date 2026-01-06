import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiMessageText, mdiTrashCanOutline } from '@mdi/js';
import { Conversation } from '../../types/chat';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
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
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <div className="model-info">
          <span className="model-label">Local LLM</span>
          <span className="model-status">● Ready</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
