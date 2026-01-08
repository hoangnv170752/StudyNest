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

  const sendMessage = useCallback(async (content: string, model: string = 'llama3.2', deepThinking: boolean = false) => {
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
      let response: string;
      const currentConv = conversations.find(conv => conv.id === conversationId);
      const conversationHistory = currentConv?.messages || [];

      if (model.startsWith('crane:')) {
        console.log('[useChat] Using Crane service for model:', model);
        
        // Extract model name from crane:ModelName format
        const modelName = model.replace('crane:', '');
        
        // Get full model info to get the absolute path
        const modelInfo = await window.electron.crane.getModelInfo(model);
        if (!modelInfo) {
          throw new Error(`Model not found: ${model}`);
        }
        
        const modelPath = modelInfo.path;
        console.log('[useChat] Model path:', modelPath);

        // Ensure Crane service is running
        if (window.electron?.crane) {
          const isRunning = await window.electron.crane.isRunning();
          
          if (!isRunning) {
            console.log('[useChat] Starting Crane service...');
            const startResult = await window.electron.crane.start();
            
            if (!startResult.success) {
              throw new Error(`Failed to start Crane service: ${startResult.error}`);
            }
          }

          // Initialize model if needed
          console.log('[useChat] Initializing Crane model with path:', modelPath);
          const initResult = await window.electron.crane.initialize(modelPath);
          
          if (!initResult.success) {
            throw new Error(`Failed to initialize model: ${initResult.error}`);
          }

          // Build messages array for Crane (include conversation history + current message)
          const messages = [
            ...conversationHistory.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: content
            }
          ];

          console.log('[useChat] Sending chat request to Crane with', messages.length, 'messages');
          const craneResponse = await window.electron.crane.chat({
            model: modelName,
            messages,
            temperature: deepThinking ? 0.9 : 0.7,
            max_tokens: deepThinking ? 4096 : 2048
          });

          response = craneResponse.message?.content || '';
          console.log('[useChat] Received response from Crane');
        } else {
          throw new Error('Crane service not available');
        }
      } else {
        // Use Ollama for non-crane models
        console.log('[useChat] Using Ollama for model:', model);
        
        const llmClient = createLLMClient({
          name: model,
          endpoint: 'http://localhost:11434/api/generate',
          temperature: deepThinking ? 0.9 : 0.7,
          maxTokens: deepThinking ? 4096 : 2048
        });

        response = await llmClient.sendMessage(content, conversationHistory);
      }
      
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

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    const updatedAt = Date.now();
    
    if (window.electron?.db) {
      try {
        await window.electron.db.updateConversation(id, newTitle, updatedAt);
      } catch (error) {
        console.error('Failed to rename conversation in DB:', error);
      }
    }
    
    setConversations(prev => prev.map(conv => 
      conv.id === id 
        ? { ...conv, title: newTitle, updatedAt }
        : conv
    ));
  }, []);

  return {
    conversations,
    currentConversation: getCurrentConversation(),
    currentConversationId,
    isLoading,
    sendMessage,
    createNewConversation,
    deleteConversation,
    selectConversation,
    renameConversation
  };
};
