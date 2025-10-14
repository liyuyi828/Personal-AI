'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import FormattedMessage from './FormattedMessage';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Welcome to Personal AI
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Start a conversation with your local AI assistant
          </p>
        </div>
      </div>
    );
  }

  messages.map(({ content }) => content).forEach((text) => console.log(text))

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-3 ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
            }`}
          >
            {message.role === 'user' ? (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            ) : (
              <FormattedMessage content={message.content} />
            )}
            <div
              className={`text-xs mt-1 ${
                message.role === 'user'
                  ? 'text-blue-100'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}