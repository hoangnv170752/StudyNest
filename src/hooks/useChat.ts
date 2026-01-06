import { useState, useCallback, useEffect } from 'react';
import { Message, Conversation } from '../types/chat';
import { createLLMClient } from '../utils/llm';

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    if (!window.electron?.db) return;
    
    try {
      const dbConversations = await window.electron.db.getAllConversations();
      const conversationsWithMessages = await Promise.all(
        dbConversations.map(async (conv) => {
          const messages = await window.electron.db.getMessages(conv.id);
          return {
            ...conv,
            messages: messages.map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp
            }))
          };
        })
      );
      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  const getCurrentConversation = useCallback(() => {
    return conversations.find(conv => conv.id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  const createNewConversation = useCallback(async () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const newConv: Conversation = {
      id: `${timestamp}-${random}`,
      title: 'New conversation',
      messages: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    if (window.electron?.db) {
      try {
        await window.electron.db.createConversation(newConv);
      } catch (error) {
        console.error('Failed to create conversation in DB:', error);
      }
    }
    
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    return newConv.id;
  }, []);

  const sendMessage = useCallback(async (content: string, model: string = 'llama3.2') => {
    let conversationId = currentConversationId;
    
    if (!conversationId) {
      conversationId = await createNewConversation();
    }

    const timestamp = Date.now();
    const userMessage: Message = {
      id: `msg-${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
      role: 'user',
      content,
      timestamp
    };

    if (window.electron?.db) {
      try {
        await window.electron.db.createMessage({
          ...userMessage,
          conversationId: conversationId!
        });
      } catch (error) {
        console.error('Failed to save user message to DB:', error);
      }
    }

    const newTitle = content.slice(0, 50);
    const updatedAt = Date.now();

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, userMessage];
        const title = conv.messages.length === 0 ? newTitle : conv.title;
        
        if (window.electron?.db && conv.messages.length === 0) {
          window.electron.db.updateConversation(conversationId!, title, updatedAt);
        }
        
        return {
          ...conv,
          messages: updatedMessages,
          title,
          updatedAt
        };
      }
      return conv;
    }));

    setIsLoading(true);

    try {
      const llmClient = createLLMClient({
        name: model,
        endpoint: 'http://localhost:11434/api/generate',
        temperature: 0.7,
        maxTokens: 2048
      });

      const response = await llmClient.sendMessage(content);
      
      const assistantTimestamp = Date.now();
      const assistantMessage: Message = {
        id: `msg-${assistantTimestamp}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: response,
        timestamp: assistantTimestamp
      };

      if (window.electron?.db) {
        try {
          await window.electron.db.createMessage({
            ...assistantMessage,
            conversationId: conversationId!
          });
        } catch (error) {
          console.error('Failed to save assistant message to DB:', error);
        }
      }

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
    } catch (error) {
      console.error('Failed to get LLM response:', error);
      
      const errorTimestamp = Date.now();
      const errorMessage: Message = {
        id: `msg-${errorTimestamp}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure Ollama is running (ollama serve).',
        timestamp: errorTimestamp
      };

      if (window.electron?.db) {
        try {
          await window.electron.db.createMessage({
            ...errorMessage,
            conversationId: conversationId!
          });
        } catch (err) {
          console.error('Failed to save error message to DB:', err);
        }
      }

      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMessage],
            updatedAt: Date.now()
          };
        }
        return conv;
      }));
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, createNewConversation]);

  const deleteConversation = useCallback(async (id: string) => {
    if (window.electron?.db) {
      try {
        await window.electron.db.deleteConversation(id);
      } catch (error) {
        console.error('Failed to delete conversation from DB:', error);
      }
    }
    
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
