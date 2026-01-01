'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/actions/sessions';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/Button';

interface NewChatButtonProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const NewChatButton = ({ isMobile, onCloseMobile }: NewChatButtonProps) => {
  const router = useRouter();
  const { refreshSessions } = useChat();

  const handleNewChat = async () => {
    const session = await createSession();
    router.push(`/sessions/${session.id}`);
    router.refresh();
    if (isMobile && onCloseMobile) onCloseMobile();
    refreshSessions();
  };

  return (
    <Button
      onClick={handleNewChat}
      variant="primary"
      className="flex-1"
    >
      <Plus className="w-4 h-4 mr-2" />
      New Chat
    </Button>
  );
};
