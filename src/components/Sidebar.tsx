'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Plus, 
  MessageSquare, 
  Search, 
  MoreVertical, 
  Settings,
  Trash2,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { getSessions, createSession, deleteSession, updateSessionTitle } from '@/actions/sessions';
import { groupSessionsByDate } from '@/lib/utils';
import { useChat, Session } from '@/context/ChatContext';

export default function Sidebar() {
  const { 
    sessions, 
    setSessions, 
    refreshSessions 
  } = useChat();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    loadSessions();
  }, [pathname, loadSessions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewChat = async () => {
    const session = await createSession();
    router.push(`/sessions/${session.id}`);
    router.refresh();
    if (isMobile) setIsOpen(false);
    refreshSessions();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      await deleteSession(id);
      if (pathname === `/sessions/${id}`) {
        router.push('/');
      }
      refreshSessions();
      setMenuOpenId(null);
    }
  };

  const startEditing = (e: React.MouseEvent, session: Session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  const handleRename = async (id: string) => {
    if (editTitle.trim()) {
      await updateSessionTitle(id, editTitle.trim());
      setEditingSessionId(null);
      refreshSessions();
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSessions = groupSessionsByDate(filteredSessions);

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

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100/50 border-transparent focus:bg-white focus:border-indigo-100 rounded-lg text-xs outline-none transition-all"
            />
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin">
            {Object.entries(groupedSessions).map(([group, sessions]) => {
              if (sessions.length === 0) return null;
              
              return (
                <div key={group} className="mb-6">
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group}
                  </h3>
                  <div className="space-y-1">
                    {sessions.map((session) => (
                      <div 
                        key={session.id}
                        onClick={() => {
                          if (editingSessionId !== session.id) {
                            router.push(`/sessions/${session.id}`);
                            if (isMobile) setIsOpen(false);
                          }
                        }}
                        className={`group flex items-center gap-3 px-3 py-2.5 hover:bg-white hover:shadow-sm rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-100 relative ${
                          pathname === `/sessions/${session.id}` ? 'bg-white shadow-sm border-gray-100' : ''
                        }`}
                      >
                        <MessageSquare className={`w-4 h-4 shrink-0 ${
                          pathname === `/sessions/${session.id}` ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'
                        }`} />
                        
                        {editingSessionId === session.id ? (
                          <div className="flex-1 flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleRename(session.id);
                                if (e.key === 'Escape') setEditingSessionId(null);
                              }}
                              className="w-full bg-gray-50 border border-indigo-200 rounded px-1.5 py-0.5 text-sm outline-none"
                            />
                            <button onClick={() => handleRename(session.id)} className="p-1 hover:bg-emerald-50 text-emerald-600 rounded">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingSessionId(null)} className="p-1 hover:bg-rose-50 text-rose-600 rounded">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className={`flex-1 text-sm truncate font-medium ${
                              pathname === `/sessions/${session.id}` ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                            }`}>
                              {session.title}
                            </span>
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(menuOpenId === session.id ? null : session.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-opacity"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                              
                              {menuOpenId === session.id && (
                                <div 
                                  ref={menuRef}
                                  className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <button 
                                    onClick={(e) => startEditing(e, session)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Rename
                                  </button>
                                  <button 
                                    onClick={(e) => handleDelete(e, session.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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