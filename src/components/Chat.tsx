'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Calendar, Search, Database } from 'lucide-react';
import { sendChatMessage } from '@/actions/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className="flex flex-col flex-1 h-full w-full bg-white overflow-hidden">
      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 bg-white scroll-smooth pb-32">
        <div className="max-w-4xl mx-auto w-full space-y-10">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`flex max-w-[90%] sm:max-w-[85%] gap-4 md:gap-6 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${m.role === 'user' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                  {m.role === 'user' ? <User className="w-5 h-5 md:w-6 md:h-6" /> : <Bot className="w-5 h-5 md:w-6 md:h-6" />}
                </div>
                
                <div className="flex flex-col gap-2.5">
                  <div className={`px-5 py-3.5 md:px-6 md:py-4 rounded-3xl shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none border border-transparent'
                  }`}>
                    {/* Markdown Renderer */}
                    <div className={`text-[15px] md:text-[16px] leading-relaxed font-medium markdown-content ${m.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {m.agent && m.agent !== 'main' && (
                    <div className={`flex items-center gap-1.5 px-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                      <span className="text-[10px] md:text-[11px] uppercase font-black tracking-widest text-gray-400">
                        {m.agent}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] gap-4 items-center animate-in fade-in duration-300">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Bot className="w-5 h-5 text-gray-300" />
                </div>
                <div className="bg-gray-50 px-5 py-3 rounded-full flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-4 pointer-events-auto">
          <div className="flex-1 bg-white rounded-[32px] transition-all duration-300 border border-gray-200 shadow-2xl shadow-indigo-100/50 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/5 group px-2">
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
              placeholder="Message..."
              className="w-full bg-transparent border-none focus:ring-0 outline-none px-6 py-4 md:py-5 resize-none text-[16px] text-gray-800 max-h-48 min-h-[64px] placeholder:text-gray-400 placeholder:font-bold"
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
            className="mb-1 w-14 h-14 md:w-16 md:h-16 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-full flex items-center justify-center transition-all shadow-xl shadow-indigo-200 active:scale-90 shrink-0"
          >
            <Send className="w-6 h-6 md:w-7 md:h-7 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentBadge({ active, color, icon }: { active: boolean; color: string; icon: React.ReactNode }) {
  if (!active) return null;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${color} text-white shadow-lg animate-in zoom-in-95 duration-300 ring-2 ring-white`}>
      {icon}
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
    </div>
  );
}
