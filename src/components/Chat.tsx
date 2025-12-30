'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Zap, ChevronUp, ChevronDown, Search, FileText, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import { getMessages, createSession } from '@/actions/sessions';
import { useChat, Message, OrchestrationStep } from '@/context/ChatContext';

export default function Chat({ sessionId, onNewMessage }: { sessionId?: string, onNewMessage?: () => void }) {
  const { 
    messages, 
    setMessages, 
    isLoading, 
    setIsLoading, 
    refreshSessions 
  } = useChat();
  
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      getMessages(sessionId).then((dbMessages) => {
        if (dbMessages && dbMessages.length > 0) {
          setMessages(dbMessages.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            agent: 'main' as const
          })).reverse());
        } else {
          setMessages([]);
        }
        setIsLoading(false);
      });
    } else {
      setMessages([]);
    }
  }, [sessionId, setMessages, setIsLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let currentSessionId = sessionId;

    // Create session if it doesn't exist
    if (!currentSessionId) {
      const session = await createSession();
      currentSessionId = session.id;
      router.push(`/sessions/${session.id}`);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const initialAssistantId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = { id: initialAssistantId, role: 'assistant', content: '', agent: 'main', steps: [] };
    setMessages(prev => [...prev, initialAssistantMessage]);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history, sessionId: currentSessionId }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error('Failed to fetch from API');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

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
                
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  
                  // Logic to decide if we need a new bubble for chronological ordering
                  let needsNew = false;
                  
                  if (event.type === 'chunk' && lastMsg.steps && lastMsg.steps.length > 0) {
                    needsNew = true;
                  } 
                  else if ((event.type === 'thought' || event.type === 'action' || event.type === 'report') && lastMsg.content) {
                    needsNew = true;
                  }
                  else if (event.type === 'agent' && event.name !== lastMsg.agent && (lastMsg.content || (lastMsg.steps && lastMsg.steps.length > 0))) {
                    needsNew = true;
                  }

                  if (needsNew) {
                    const newId = (Date.now() + Math.random()).toString();
                    const newMsg: Message = { 
                      id: newId, 
                      role: 'assistant', 
                      content: event.type === 'chunk' ? event.text : '', 
                      agent: event.type === 'agent' ? event.name : lastMsg.agent, 
                      steps: (event.type === 'thought' || event.type === 'action' || event.type === 'report') 
                        ? [{ type: event.type, text: event.text, metadata: event.metadata }]
                        : []
                    };
                    return [...prev, newMsg];
                  } else {
                    return prev.map((m, idx) => {
                      if (idx !== prev.length - 1) return m;
                      
                      const updated = { ...m };
                      if (event.type === 'agent') {
                        updated.agent = event.name;
                      } else if (event.type === 'thought' || event.type === 'action' || event.type === 'report') {
                        updated.steps = [...(m.steps || []), { 
                          type: event.type, 
                          text: event.text, 
                          metadata: event.metadata 
                        }];
                      } else if (event.type === 'chunk') {
                        updated.content = m.content + event.text;
                      }
                      return updated;
                    });
                  }
                });
              } catch {
                // Ignore incomplete JSON chunks
              }
            }
          }
        }
      }

      if (onNewMessage) onNewMessage();
      refreshSessions();

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error sending message:', error);
        setMessages(prev => prev.map(m => 
          m.id === initialAssistantId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-4" ref={scrollRef}>
          {messages.map((m) => {
            const hasSteps = m.steps && m.steps.length > 0;
            const shouldShowBubble = m.content || (!hasSteps && messages.length > 0 && m.id === messages[messages.length - 1].id && isLoading);

            return (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                <div className="flex flex-col gap-1.5 max-w-[95%] sm:max-w-[85%]">
                  
                  {shouldShowBubble && (
                    <div className={`px-4 py-2.5 md:px-5 md:py-3 rounded-2xl shadow-sm ${ 
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200/50'
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

                  {hasSteps && (
                    <ActionLog 
                      steps={m.steps!}
                      forceOpen={isLoading && !m.content && m.id === messages[messages.length - 1].id} 
                    />
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
          {isLoading ? (
            <button
              onClick={handleStop}
              className="mb-1 w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="mb-1 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionLog({ steps, forceOpen }: { steps: OrchestrationStep[], forceOpen?: boolean }) {
  const [userOpened, setUserOpened] = React.useState(false);
  const isOpen = forceOpen || userOpened;

  return (
    <div className="ml-1 my-1">
      <button 
        onClick={() => setUserOpened(!userOpened)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full transition-all text-[9px] font-bold uppercase tracking-wider border ${ 
          isOpen 
            ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
            : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
        }`}
      >
        <Zap className={`w-2.5 h-2.5 ${forceOpen ? 'animate-pulse' : ''}`} />
        <span>{steps.length} {steps.length === 1 ? 'Step' : 'Steps'} Background</span>
        {isOpen ? <ChevronUp className="w-2.5 h-2.5 ml-0.5" /> : <ChevronDown className="w-2.5 h-2.5 ml-0.5" />}
      </button>
      
      {isOpen && (
        <div className="mt-2 ml-2.5 p-0.5 space-y-0.5 border-l-2 border-gray-100 animate-in slide-in-from-top-1 duration-200">
          {steps.map((step, i) => (
            <CollapsibleStep key={i} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsibleStep({ step }: { step: OrchestrationStep }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isDelegation = step.text.includes('➔');
  const hasMetadata = step.metadata && (step.metadata.urls?.length || step.metadata.titles?.length);

  const config = {
    thought: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    action: { 
      icon: isDelegation ? Zap : Search, 
      color: isDelegation ? 'text-indigo-600' : 'text-blue-500', 
      bg: isDelegation ? 'bg-indigo-50' : 'bg-blue-50' 
    },
    report: { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  }[step.type];

  const Icon = config.icon;
  const isExpandable = step.text.length > 60 || hasMetadata || step.type === 'report';

  return (
    <div className="relative pl-6 py-1 group">
      <div className={`absolute left-[-5px] top-[14px] w-2 h-2 rounded-full border-2 bg-white transition-all z-10 ${ 
        isExpanded ? 'border-indigo-500 scale-110' : 'border-gray-200 group-hover:border-gray-400'
      }`} />

      <div className={`flex flex-col rounded-xl transition-all border ${ 
        isExpanded 
          ? 'bg-gray-50/30 border-gray-100 p-2.5' 
          : 'bg-transparent border-transparent hover:bg-gray-50/50 px-2 py-1'
      }`}>
        <button 
          onClick={() => isExpandable && setIsExpanded(!isExpanded)}
          disabled={!isExpandable}
          className={`flex items-center gap-3 w-full text-left ${isExpandable ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
            <Icon className="w-3 h-3" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[7px] font-black uppercase tracking-widest px-1 rounded ${config.bg} ${config.color}`}>
                {step.type}
              </span>
              <span className={`text-[11px] font-medium truncate transition-colors ${isExpanded ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.text}
              </span>
            </div>
          </div>
          
          {isExpandable && (
            <ChevronDown className={`w-3 h-3 text-gray-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </button>

        {isExpanded && (
          <div className="mt-2.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
            {step.text.length > 60 && (
              <div className="text-[11px] text-gray-600 leading-relaxed pl-1 bg-white/50 p-2 rounded-lg border border-gray-100/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {step.text}
                </ReactMarkdown>
              </div>
            )}

            {hasMetadata && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {step.metadata?.urls?.map((url, idx) => {
                  const title = step.metadata?.titles?.[idx] || `Source ${idx + 1}`;
                  return (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg text-[10px] font-bold transition-all border border-gray-100 hover:border-indigo-100 shadow-xs active:scale-95"
                    >
                      <Search className="w-3 h-3" />
                      <span className="max-w-[150px] truncate">{title}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}