'use client';

import React, { useRef, useEffect } from 'react';
import { Message } from '@/context/ChatContext';
import { MessageItem } from '../MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth">
      <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-4" ref={scrollRef}>
        {messages.map((m, index) => (
          <MessageItem 
            key={m.id} 
            message={m} 
            isLoading={isLoading} 
            isLast={index === messages.length - 1} 
          />
        ))}
      </div>
    </div>
  );
};
