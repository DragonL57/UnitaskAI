'use client';

import React from 'react';
import { groupSessionsByDate } from '@/lib/utils';
import { Session } from '@/context/ChatContext';
import { SessionItem } from '../SessionItem';

interface SessionListProps {
  sessions: Session[];
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const SessionList = ({ sessions, isMobile, onCloseMobile }: SessionListProps) => {
  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
      {Object.entries(groupedSessions).map(([group, groupSessions]) => {
        if (groupSessions.length === 0) return null;
        
        return (
          <div key={group} className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group}
            </h3>
            <div className="space-y-1">
              {groupSessions.map((session) => (
                <SessionItem 
                  key={session.id} 
                  session={session} 
                  isMobile={isMobile}
                  onCloseMobile={onCloseMobile}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};