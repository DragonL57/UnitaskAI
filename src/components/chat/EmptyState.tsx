'use client';

import React from 'react';
import { Sparkles, MessageSquare, Calendar, Search } from 'lucide-react';
import Image from 'next/image';

interface EmptyStateProps {
  onActionClick: (text: string) => void;
}

export const EmptyState = ({ onActionClick }: EmptyStateProps) => {
  const actions = [
    {
      icon: <Search className="w-4 h-4 text-primary" />,
      title: 'Research a Topic',
      description: 'Deep dive with citations.',
      prompt: 'Research the latest advancements in solid state batteries.'
    },
    {
      icon: <Calendar className="w-4 h-4 text-primary" />,
      title: 'Plan Schedule',
      description: 'Organize your week.',
      prompt: 'Help me plan my schedule for next week based on my goals.'
    },
    {
      icon: <MessageSquare className="w-4 h-4 text-primary" />,
      title: 'Draft Content',
      description: 'Emails, articles, code.',
      prompt: 'Draft a professional email to follow up on a job application.'
    },
    {
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      title: 'Brainstorm Ideas',
      description: 'Creative concepts.',
      prompt: 'Brainstorm 5 unique marketing ideas for a new coffee shop.'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 relative w-16 h-16">
        <Image
          src="/UniTaskAI_logo.png"
          alt="UniTaskAI Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      
      <h2 className="text-xl font-bold text-foreground mb-2">
        How can I help you today?
      </h2>
      
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        I&apos;m your personal AI companion. Ask me anything, or choose a task below.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action.prompt)}
            className="group flex items-start gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all hover:-translate-y-0.5 text-left"
          >
            <div className="p-2 bg-secondary/50 rounded-lg group-hover:bg-primary/10 transition-colors shrink-0">
              {action.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
