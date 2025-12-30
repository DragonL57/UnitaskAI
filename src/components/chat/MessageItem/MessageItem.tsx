'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Message } from '@/context/ChatContext';
import { AgentActionLog } from '../AgentActionLog';

interface MessageItemProps {
  message: Message;
  isLoading: boolean;
  isLast: boolean;
}

export const MessageItem = ({ message, isLoading, isLast }: MessageItemProps) => {
  const hasSteps = message.steps && message.steps.length > 0;
  const shouldShowBubble = message.content || (!hasSteps && isLast && isLoading);

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
      <div className="flex flex-col gap-1.5 max-w-[95%] sm:max-w-[85%]">
        
        {shouldShowBubble && (
          <div className={`px-4 py-2.5 md:px-5 md:py-3 rounded-2xl shadow-sm ${ 
            message.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200/50'
          }`}>
            {message.role === 'assistant' && !message.content && isLoading ? (
              <div className="flex gap-1.5 py-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            ) : (
              <div className={`text-[15px] md:text-[16px] leading-relaxed markdown-content ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    br: () => <br />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {hasSteps && (
          <AgentActionLog 
            steps={message.steps!}
            forceOpen={isLoading && !message.content && isLast} 
          />
        )}
      </div>
    </div>
  );
};
