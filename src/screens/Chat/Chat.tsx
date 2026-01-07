import React, { useRef, useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatMessage from '../../components/ChatMessage/ChatMessage';
import ChatInput from '../../components/ChatInput/ChatInput';
import PromptSuggestions from '../../components/PromptSuggestions/PromptSuggestions';
import { useChat } from '../../hooks/useChat';
import { useTheme } from '../../hooks/useTheme';
import './Chat.css';

const Chat: React.FC = () => {
  const {
    conversations,
    currentConversation,
    currentConversationId,
    isLoading,
    sendMessage,
    createNewConversation,
    deleteConversation,
    selectConversation,
    renameConversation
  } = useChat();

  const { theme, toggleTheme } = useTheme();
  const [selectedModel, setSelectedModel] = useState('');
  const [deepThinking, setDeepThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSendMessage = (content: string, model?: string, isDeepThinking?: boolean) => {
    if (!currentConversationId) {
      createNewConversation();
    }
    sendMessage(content, model || selectedModel, isDeepThinking);
  };

  const handlePromptSelect = (prompt: string) => {
    // Just populate the input, don't send immediately
    const chatInput = document.querySelector('.chat-textarea') as HTMLTextAreaElement;
    if (chatInput) {
      chatInput.value = prompt;
      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
      chatInput.focus();
    }
  };

  return (
    <div className="chat-layout">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      
      <div className="chat-main">
        <div className="chat-messages">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <PromptSuggestions onSelectPrompt={handlePromptSelect} />
          ) : (
            <>
              {currentConversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="loading-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isLoading}
          isGenerating={isLoading}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          deepThinking={deepThinking}
          onDeepThinkingChange={setDeepThinking}
        />
      </div>
    </div>
  );
};

export default Chat;
