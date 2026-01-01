'use client';

import React from 'react';
import { Message } from '@/context/ChatContext';
import { AgentActionLog } from '../AgentActionLog';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface MessageItemProps {
  message: Message;
  isLoading: boolean;
  isLast: boolean;
}

export const MessageItem = ({ message, isLoading, isLast }: MessageItemProps) => {
  const hasSteps = message.steps && message.steps.length > 0;
  const shouldShowBubble = message.content || (!hasSteps && isLast && isLoading);

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex flex-col gap-2 max-w-[90%] sm:max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
        
        {shouldShowBubble && (
          <div className={`px-4 py-3 md:px-5 md:py-3.5 rounded-2xl shadow-sm break-words overflow-hidden min-w-0 ${ 
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground rounded-br-sm' 
              : 'bg-card text-foreground rounded-bl-sm border border-border'
          }`}>
            {message.role === 'assistant' && !message.content && isLoading ? (
              <div className="flex gap-1.5 py-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></div>
              </div>
            ) : (
              <MarkdownRenderer content={message.content} role={message.role as 'user' | 'assistant'} />
            )}
          </div>
        )}

        {hasSteps && (
          <div className="w-full">
            <AgentActionLog 
              steps={message.steps!}
              forceOpen={isLoading && !message.content && isLast} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
