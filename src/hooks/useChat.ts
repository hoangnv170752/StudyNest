import { useState, useCallback } from 'react';
import { Message, Conversation } from '../types/chat';

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentConversation = useCallback(() => {
    return conversations.find(conv => conv.id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  const createNewConversation = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const newConv: Conversation = {
      id: `${timestamp}-${random}`,
      title: 'New conversation',
      messages: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    return newConv.id;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    let conversationId = currentConversationId;
    
    if (!conversationId) {
      conversationId = createNewConversation();
    }

    const timestamp = Date.now();
    const userMessage: Message = {
      id: `msg-${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
      role: 'user',
      content,
      timestamp
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, userMessage];
        return {
          ...conv,
          messages: updatedMessages,
          title: conv.messages.length === 0 ? content.slice(0, 50) : conv.title,
          updatedAt: Date.now()
        };
      }
      return conv;
    }));

    setIsLoading(true);

    setTimeout(() => {
      const timestamp = Date.now();
      const assistantMessage: Message = {
        id: `msg-${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: 'This is a placeholder response. Connect your local LLM to get real responses!',
        timestamp
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, assistantMessage],
            updatedAt: Date.now()
          };
        }
        return conv;
      }));

      setIsLoading(false);
    }, 1000);
  }, [currentConversationId, createNewConversation]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  return {
    conversations,
    currentConversation: getCurrentConversation(),
    currentConversationId,
    isLoading,
    sendMessage,
    createNewConversation,
    deleteConversation,
    selectConversation
  };
};
