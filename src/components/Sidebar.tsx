'use client';

import React, { useState, useEffect } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Plus, 
  MessageSquare, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSessions, createSession, deleteSession, updateSessionTitle } from '@/actions/sessions';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const router = useRouter();

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
  }, []);

  const loadSessions = async () => {
    const data = await getSessions();
    setSessions(data);
  };

  const handleNewChat = async () => {
    const session = await createSession();
    router.push(`/sessions/${session.id}`);
    if (isMobile) setIsOpen(false);
    loadSessions();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${isOpen ? 'w-72' : 'w-0'}
          h-full bg-gray-50 border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out overflow-hidden
        `}
      >
        <div className="p-4 flex flex-col h-full w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleNewChat}
              className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-all active:scale-95 text-sm font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
            {!isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="ml-2 p-2.5 hover:bg-gray-200 text-gray-400 rounded-xl transition-colors"
                title="Close Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Placeholder */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100/50 border-transparent focus:bg-white focus:border-indigo-100 rounded-lg text-xs outline-none transition-all"
            />
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 -mr-2 scrollbar-thin">
            {sessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => {
                  router.push(`/sessions/${session.id}`);
                  if (isMobile) setIsOpen(false);
                }}
                className="group flex items-center gap-3 px-3 py-2.5 hover:bg-white hover:shadow-sm rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-100"
              >
                <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                <span className="flex-1 text-sm text-gray-600 truncate group-hover:text-gray-900 font-medium">
                  {session.title}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-opacity">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

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
        <button
          onClick={() => setIsOpen(true)}
          className={`
            fixed top-2.5 left-4 z-30 p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-gray-600 rounded-xl shadow-sm transition-all hover:bg-gray-50
            ${isMobile && isOpen ? 'hidden' : 'block'}
          `}
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
