'use client';

import React from 'react';
import { Send, Square } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onStop: () => void;
}

export const InputArea = ({ input, setInput, isLoading, onSend, onStop }: InputAreaProps) => {
  return (
    <div className="p-4 md:p-6 bg-background border-t border-border shrink-0">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        <div className="flex-1 bg-muted/50 rounded-[28px] transition-all border border-transparent focus-within:bg-card focus-within:border-border focus-within:ring-4 focus-within:ring-primary/5 group px-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="How can I help you today?"
            className="w-full bg-transparent border-none focus:ring-0 outline-none px-4 py-3.5 md:px-5 md:py-4 resize-none text-[16px] text-foreground placeholder:text-muted-foreground max-h-60 min-h-[52px] scrollbar-none"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>
        {isLoading ? (
          <IconButton
            onClick={onStop}
            variant="ghost"
            icon={<Square className="w-5 h-5 fill-current" />}
            className="mb-1 w-[52px] h-[52px] bg-foreground text-background hover:opacity-90 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
          />
        ) : (
          <IconButton
            onClick={onSend}
            disabled={!input.trim()}
            variant="ghost"
            icon={<Send className="w-5 h-5" />}
            className="mb-1 w-[52px] h-[52px] bg-primary disabled:bg-muted disabled:text-muted-foreground text-primary-foreground hover:opacity-90 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
          />
        )}
      </div>
    </div>
  );
};