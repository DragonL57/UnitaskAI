'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, ChevronDown, ChevronUp, Zap, Search, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface OrchestrationStep {
  type: 'thought' | 'action' | 'report';
  text: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: 'scheduler' | 'researcher' | 'memory' | 'main';
  steps?: OrchestrationStep[];
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your AI companion. How can I help you today?', agent: 'main' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReceivingContent, setIsReceivingContent] = useState(false);
  
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
    setIsReceivingContent(false);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = { id: assistantMessageId, role: 'assistant', content: '', agent: 'main', steps: [] };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history })
      });

      if (!response.ok) throw new Error('Failed to fetch from API');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullContent = '';

      if (!reader) throw new Error('No reader found');

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const rawChunk = decoder.decode(value, { stream: !done });
          const lines = rawChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('__EVENT__:')) {
              try {
                const event = JSON.parse(line.replace('__EVENT__:', ''));
                
                if (event.type === 'agent') {
                  setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, agent: event.name } : m));
                } else if (event.type === 'thought' || event.type === 'action' || event.type === 'report') {
                  setMessages(prev => prev.map(m => 
                    m.id === assistantMessageId 
                      ? { ...m, steps: [...(m.steps || []), { type: event.type, text: event.text }] } 
                      : m
                  ));
                } else if (event.type === 'chunk') {
                  // As soon as we get the first chunk, we are receiving the actual response
                  setIsReceivingContent(true);
                  fullContent += event.text;
                  setMessages(prev => prev.map(m => 
                    m.id === assistantMessageId ? { ...m, content: fullContent } : m
                  ));
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m
      ));
    } finally {
      setIsLoading(false);
      setIsReceivingContent(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-10" ref={scrollRef}>
          {messages.map((m) => {
            const hasSteps = m.steps && m.steps.length > 0;
            // Only show bubble if it has content OR if it's the current loading message and has NO steps yet
            const shouldShowBubble = m.content || (!hasSteps && m.id === messages[messages.length - 1].id && isLoading);

            return (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className="flex flex-col gap-3 max-w-[95%] sm:max-w-[85%]">
                  
                  {/* Steps Log - Auto expanded if loading and NOT receiving final content */}
                  {hasSteps && (
                    <ActionLog 
                      steps={m.steps!}
                      forceOpen={isLoading && !isReceivingContent && m.id === messages[messages.length - 1].id} 
                    />
                  )}

                  {shouldShowBubble && (
                    <div className={`px-5 py-3.5 md:px-6 md:py-4 rounded-3xl shadow-sm ${ 
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none border border-transparent'
                    }`}>
                      {m.role === 'assistant' && !m.content && isLoading ? (
                        <div className="flex gap-1.5 py-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                      ) : (
                        <div className={`text-[15px] md:text-[16px] leading-relaxed markdown-content ${m.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              br: () => <br />,
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {m.agent && m.agent !== 'main' && m.content && (
                    <div className={`flex items-center gap-1.5 px-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                        {m.agent}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 bg-gray-100/80 rounded-3xl transition-all border border-transparent focus-within:bg-white focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-500/5 group px-2">
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
              className="w-full bg-transparent border-none focus:ring-0 outline-none px-6 py-4 resize-none text-[16px] text-gray-800 max-h-40 min-h-[56px]"
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
            className="mb-1 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionLog({ steps, forceOpen }: { steps: OrchestrationStep[], forceOpen?: boolean }) {
  const [userOpened, setUserOpened] = useState(false);
  const isOpen = forceOpen || userOpened;

  return (
    <div className="ml-2 mb-1">
      <button 
        onClick={() => setUserOpened(!userOpened)}
        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isOpen ? 'text-indigo-500' : 'text-gray-400 hover:text-indigo-500'}`}
      >
        <Zap className={`w-3 h-3 ${forceOpen ? 'animate-pulse' : ''}`} />
        <span>{steps.length} Steps Taken</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-indigo-100 animate-in slide-in-from-top-2 duration-300">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {step.type === 'thought' && <Zap className="w-3 h-3 text-amber-400" />}
                {step.type === 'action' && <Search className="w-3 h-3 text-blue-400" />}
                {step.type === 'report' && <FileText className="w-3 h-3 text-green-400" />}
                <span className="text-[9px] font-bold uppercase text-gray-400">{step.type}</span>
              </div>
              <div className="text-xs text-gray-600 leading-normal pl-5 pr-2 py-2 bg-gray-50 rounded-lg border border-gray-100 markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {step.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}