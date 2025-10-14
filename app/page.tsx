'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ChatHistory from '@/components/ChatHistory';

export default function Home() {
  const [currentView, setCurrentView] = useState<'history' | 'chat'>('history');
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>(undefined);

  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
    setCurrentView('chat');
  };

  const handleNewChat = () => {
    setSelectedChatId(undefined);
    setCurrentView('chat');
  };

  const handleBackToHistory = () => {
    setCurrentView('history');
    setSelectedChatId(undefined);
  };

  if (currentView === 'history') {
    return <ChatHistory onSelectChat={handleSelectChat} onNewChat={handleNewChat} />;
  }

  return (
    <ChatInterface
      chatId={selectedChatId}
      onBackToHistory={handleBackToHistory}
    />
  );
}