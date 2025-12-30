'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface OrchestrationStep {
  type: 'thought' | 'action' | 'report';
  text: string;
  metadata?: {
    urls?: string[];
    titles?: string[];
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: 'scheduler' | 'researcher' | 'memory' | 'main';
  steps?: OrchestrationStep[];
}

export interface Session {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentSessionId: string | undefined;
  setCurrentSessionId: (id: string | undefined) => void;
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  refreshSessions: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const [sessions, setSessions] = useState<Session[]>([]);

  const refreshSessions = useCallback(() => {
    window.dispatchEvent(new CustomEvent('refresh-sessions'));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        isLoading,
        setIsLoading,
        currentSessionId,
        setCurrentSessionId,
        sessions,
        setSessions,
        refreshSessions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
