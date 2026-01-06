import React from 'react';
import Icon from '@mdi/react';
import { mdiAccount, mdiRobotOutline } from '@mdi/js';
import { Message } from '../../types/chat';
import './ChatMessage.css';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">
        <Icon 
          path={isUser ? mdiAccount : mdiRobotOutline} 
          size={1}
          className="avatar-icon"
        />
      </div>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
