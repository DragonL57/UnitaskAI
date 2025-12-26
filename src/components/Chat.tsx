'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Calendar, Search, Database } from 'lucide-react';
import { sendChatMessage } from '@/actions/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: 'scheduler' | 'researcher' | 'memory' | 'main';
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your AI companion. How can I help you today?', agent: 'main' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'scheduler' | 'researcher' | 'memory' | 'main' | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setActiveAgent('main');

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const result = await sendChatMessage(input, history);
      
      const botMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: result.content,
        agent: result.agent
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API keys and try again.'
      }]);
    } finally {
      setIsLoading(false);
      setActiveAgent(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white md:shadow-xl md:rounded-2xl overflow-hidden border-x border-b md:border border-gray-200">
      {/* Header Info - Compact for mobile */}
      <div className="bg-gray-50/50 p-3 md:p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-semibold text-gray-700 hidden sm:inline">Active Agents</span>
        </div>
        <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <StatusIndicator label="Schedule" active={activeAgent === 'scheduler'} icon={<Calendar className="w-3.5 h-3.5" />} color="bg-green-500" />
          <StatusIndicator label="Search" active={activeAgent === 'researcher'} icon={<Search className="w-3.5 h-3.5" />} color="bg-purple-500" />
          <StatusIndicator label="Memory" active={activeAgent === 'memory'} icon={<Database className="w-3.5 h-3.5" />} color="bg-yellow-500" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-white scroll-smooth">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex max-w-[90%] sm:max-w-[80%] gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className="flex flex-col gap-1">
                <div className={`p-3 md:p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                  <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
                {m.agent && m.agent !== 'main' && (
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${m.role === 'user' ? 'text-right' : 'text-left'} text-gray-400 mt-1 px-1`}>
                    {m.agent}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex max-w-[80%] gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-400" />
              </div>
              <div className="bg-gray-100 p-3 rounded-2xl flex items-center gap-2 text-gray-400 text-sm italic">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input - Sticky at bottom */}
      <div className="p-3 md:p-4 bg-white border-t border-gray-200 shrink-0">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Type your message..."
              className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 resize-none text-[15px] text-gray-800 max-h-32"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ label, active, icon, color }: { label: string; active: boolean; icon: React.ReactNode; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-500 ${active ? `${color} text-white shadow-sm ring-4 ring-white/20` : 'bg-white text-gray-400 border border-gray-100'}`}>
      {icon}
      <span className={active ? 'block' : 'hidden sm:block'}>{label}</span>
      {active && <span className="w-1 h-1 bg-white rounded-full animate-pulse" />}
    </div>
  );
}
