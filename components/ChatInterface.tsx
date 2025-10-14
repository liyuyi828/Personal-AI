'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<boolean>(false);
  const currentAssistantMessageRef = useRef<string>('');
  const currentMessageIdRef = useRef<string>('');

  useEffect(() => {
    // Check if we're in Electron environment
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Check Ollama status
      checkOllamaStatus();

      // Setup message chunk listener
      window.electronAPI.onMessageChunk((chunk: string) => {
        currentAssistantMessageRef.current += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];

          if (lastMessage && lastMessage.id === currentMessageIdRef.current) {
            lastMessage.content = currentAssistantMessageRef.current;
            return newMessages;
          } else {
            return [
              ...newMessages,
              {
                id: currentMessageIdRef.current,
                role: 'assistant' as const,
                content: currentAssistantMessageRef.current,
                timestamp: new Date(),
              },
            ];
          }
        });
      });

      return () => {
        if (window.electronAPI) {
          window.electronAPI.removeMessageChunkListener();
        }
      };
    }
  }, []);

  const checkOllamaStatus = async () => {
    if (window.electronAPI) {
      const status = await window.electronAPI.checkOllamaStatus();
      setOllamaStatus(status);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !window.electronAPI) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Reset assistant message
    currentAssistantMessageRef.current = '';
    currentMessageIdRef.current = (Date.now() + 1).toString();

    try {
      const result = await window.electronAPI.sendMessage(content.trim());

      if (!result.success) {
        console.error('Error sending message:', result.error);
        // Add error message
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Error: ${result.error}`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (typeof window !== 'undefined' && !window.electronAPI) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">This app must be run in Electron environment</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Personal AI
        </h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${ollamaStatus ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {ollamaStatus ? 'Ollama Connected' : 'Ollama Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <MessageInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}