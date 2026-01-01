'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getMessages, createSession, getSession } from '@/actions/sessions';
import { useChat, Message } from '@/context/ChatContext';
import { MessageList } from './chat/MessageList';
import { InputArea } from './chat/InputArea';

export default function Chat({ sessionId, onNewMessage }: { sessionId?: string, onNewMessage?: () => void }) {
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    refreshSessions
  } = useChat();

  const [input, setInput] = React.useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      getSession(sessionId).then((session) => {
        if (!session) {
          router.push('/');
          setIsLoading(false);
          return;
        }

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
      });
    } else {
      setMessages([]);
    }
  }, [sessionId, setMessages, setIsLoading, router]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    // If called via event (e.g. from InputArea form submission), overrideInput might be the event object
    // We need to check if it's a string
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;

    if (!textToSend.trim() || isLoading) return;

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      const session = await createSession();
      currentSessionId = session.id;
      router.push(`/sessions/${session.id}`);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
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
        body: JSON.stringify({ message: textToSend, history, sessionId: currentSessionId }),
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
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        onEmptyAction={(text) => handleSend(text)}
      />
      <InputArea 
        input={input} 
        setInput={setInput} 
        isLoading={isLoading} 
        onSend={() => handleSend()} 
        onStop={handleStop} 
      />
    </div>
  );
}
