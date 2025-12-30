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
    <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0">
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <div className="flex-1 bg-gray-100/80 rounded-3xl transition-all border border-transparent focus-within:bg-white focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-500/5 group px-2">
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
            placeholder="Message..."
            className="w-full bg-transparent border-none focus:ring-0 outline-none px-6 py-4 resize-none text-[16px] text-gray-800 max-h-40 min-h-[56px]"
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
            className="mb-1 w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0"
          />
        ) : (
          <IconButton
            onClick={onSend}
            disabled={!input.trim()}
            variant="ghost"
            icon={<Send className="w-5 h-5 ml-0.5" />}
            className="mb-1 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0"
          />
        )}
      </div>
    </div>
  );
};
