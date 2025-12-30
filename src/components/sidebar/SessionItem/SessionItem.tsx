'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { deleteSession, updateSessionTitle } from '@/actions/sessions';
import { useChat, Session } from '@/context/ChatContext';

interface SessionItemProps {
  session: Session;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const SessionItem = ({ session, isMobile, onCloseMobile }: SessionItemProps) => {
  const { refreshSessions } = useChat();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const isActive = pathname === `/sessions/${session.id}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      await deleteSession(session.id);
      if (isActive) {
        router.push('/');
      }
      refreshSessions();
      setIsMenuOpen(false);
    }
  };

  const handleRename = async () => {
    if (editTitle.trim() && editTitle !== session.title) {
      await updateSessionTitle(session.id, editTitle.trim());
      refreshSessions();
    }
    setIsEditing(false);
  };

  return (
    <div 
      onClick={() => {
        if (!isEditing) {
          router.push(`/sessions/${session.id}`);
          if (isMobile && onCloseMobile) onCloseMobile();
        }
      }}
      className={`group flex items-center gap-3 px-3 py-2.5 hover:bg-white hover:shadow-sm rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-100 relative ${
        isActive ? 'bg-white shadow-sm border-gray-100' : ''
      }`}
    >
      <MessageSquare className={`w-4 h-4 shrink-0 ${
        isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'
      }`} />
      
      {isEditing ? (
        <div className="flex-1 flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
          <input
            autoFocus
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="w-full bg-gray-50 border border-indigo-200 rounded px-1.5 py-0.5 text-sm outline-none"
          />
          <button onClick={handleRename} className="p-1 hover:bg-emerald-50 text-emerald-600 rounded">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-rose-50 text-rose-600 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <span className={`flex-1 text-sm truncate font-medium ${
            isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
          }`}>
            {session.title}
          </span>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-opacity"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            
            {isMenuOpen && (
              <div 
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Rename
                </button>
                <button 
                  onClick={handleDelete}
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
  );
};
