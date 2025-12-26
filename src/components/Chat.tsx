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
      // Prepare history: Map to { role, content } and keep last 10 messages
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          AI Companion
        </h2>
        <div className="flex gap-4">
          <StatusIndicator label="Scheduler" active={activeAgent === 'scheduler'} icon={<Calendar className="w-4 h-4" />} color="bg-green-500" />
          <StatusIndicator label="Researcher" active={activeAgent === 'researcher'} icon={<Search className="w-4 h-4" />} color="bg-purple-500" />
          <StatusIndicator label="Memory" active={activeAgent === 'memory'} icon={<Database className="w-4 h-4" />} color="bg-yellow-500" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-3 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                {m.agent && m.agent !== 'main' && (
                  <span className="text-[10px] mt-2 block opacity-70 font-medium uppercase tracking-wider">
                    Handled by {m.agent}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-5 h-5 text-gray-400" />
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 rounded-tl-none flex items-center gap-2 text-gray-400 italic text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-12 text-gray-800"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
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
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${active ? `${color} text-white` : 'bg-gray-100 text-gray-400'}`}>
      {icon}
      <span>{label}</span>
      {active && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
    </div>
  );
}