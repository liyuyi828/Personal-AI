'use client';

import { useState, useEffect } from 'react';
import { ChatSession } from '@/lib/model-types';

interface ChatHistoryProps {
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
}

export default function ChatHistory({ onSelectChat, onNewChat }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    if (!window.electronAPI) return;

    try {
      setLoading(true);
      const result = await window.electronAPI.getAllChatSessions();
      if (result.success) {
        setSessions(result.sessions);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!window.electronAPI) return;

    try {
      const name = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const result = await window.electronAPI.createChatSession(name);

      if (result.success && result.session) {
        onSelectChat(result.session.id);
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
    }
  };

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.electronAPI) return;
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const result = await window.electronAPI.deleteChatSession(chatId);
      if (result.success) {
        loadChatSessions();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditName(session.name);
  };

  const handleRename = async (chatId: number) => {
    if (!window.electronAPI || !editName.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const result = await window.electronAPI.updateChatSessionName(chatId, editName.trim());
      if (result.success) {
        loadChatSessions();
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
    } finally {
      setEditingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
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
          Chat History
        </h1>
        <button
          onClick={handleNewChat}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          New Chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading chats...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">No chat history yet</p>
            <button
              onClick={handleNewChat}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Start Your First Chat
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectChat(session.id)}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  {editingId === session.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRename(session.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(session.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-2 py-1 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded border border-blue-500 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <h3 className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session.name}
                    </h3>
                  )}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => startEditing(session, e)}
                      className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Rename"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(session.id, e)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{session.messageCount || 0} messages</span>
                  <span>{formatDate(session.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alternative: Start new chat from empty state button */}
      {sessions.length > 0 && (
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onNewChat}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Continue Last Chat
          </button>
        </div>
      )}
    </div>
  );
}
