import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiAccount, mdiRobotOutline } from '@mdi/js';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Message } from '../../types/chat';
import './ChatMessage.css';
import 'highlight.js/styles/github-dark.css';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

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
        <div className="message-header">
          {!isUser && (
            <button 
              className="copy-button" 
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy message'}
            >
              {copied ? <CheckIcon /> : <ContentCopyIcon />}
            </button>
          )}
        </div>
        <div className="message-text">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <pre className={className}>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="inline-code" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString()}
          {!isUser && message.inferenceTime !== undefined && (
            <span className="inference-time"> • {message.inferenceTime.toFixed(2)}s</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
