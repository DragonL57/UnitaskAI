'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Settings
} from 'lucide-react';
import { getSessions } from '@/actions/sessions';
import { useChat, Session } from '@/context/ChatContext';
import { IconButton } from '@/components/ui/IconButton';
import { NewChatButton } from './sidebar/NewChatButton';
import { SearchBox } from './sidebar/SearchBox';
import { SessionList } from './sidebar/SessionList';

export default function Sidebar() {
  const { 
    sessions, 
    setSessions, 
  } = useChat();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const loadSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      setSessions(data as Session[]);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [setSessions]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadSessions();

    const handleRefresh = () => loadSessions();
    window.addEventListener('refresh-sessions', handleRefresh);
    return () => window.removeEventListener('refresh-sessions', handleRefresh);
  }, [loadSessions]);

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'relative border-r border-gray-100'}
          ${isOpen ? 'w-72 translate-x-0' : isMobile ? '-translate-x-full w-72' : 'w-0 translate-x-0'}
          h-full bg-gray-50 flex flex-col transition-all duration-300 ease-out overflow-hidden
        `}
      >
        <div className="p-4 flex flex-col h-full w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <NewChatButton isMobile={isMobile} onCloseMobile={() => setIsOpen(false)} />
            {!isMobile && (
              <IconButton
                onClick={() => setIsOpen(false)}
                icon={<PanelLeftClose className="w-4 h-4" />}
                title="Close Sidebar"
                className="ml-2"
              />
            )}
          </div>

          {/* Search */}
          <SearchBox value={searchQuery} onChange={setSearchQuery} />

          {/* Sessions List */}
          <SessionList 
            sessions={filteredSessions} 
            isMobile={isMobile} 
            onCloseMobile={() => setIsOpen(false)} 
          />

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white rounded-xl text-sm text-gray-500 hover:text-gray-900 transition-all">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </aside>

      {/* Floating Toggle Button (when closed or on mobile) */}
      {(!isOpen || isMobile) && (
        <IconButton
          onClick={() => setIsOpen(true)}
          variant="outline"
          icon={<PanelLeftOpen className="w-4 h-4" />}
          className={`fixed top-2.5 left-4 z-30 ${isMobile && isOpen ? 'hidden' : ''}`}
        />
      )}
    </>
  );
}