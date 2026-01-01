'use client';

import React, { useState } from 'react';
import Chat from '@/components/Chat';
import MemoryManager from '@/components/MemoryManager';
import Modal from '@/components/Modal';
import { Database } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import Image from 'next/image';

export default function Home({ sessionId }: { sessionId?: string }) {
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);

  return (
    <main className="h-[100dvh] w-full bg-background flex flex-col overflow-hidden">
      {/* App Header */}
      <header className="h-14 px-6 flex justify-between items-center bg-white border-b border-border shrink-0 z-20">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <div className="relative w-8 h-8">
             <Image
              src="/UniTaskAI_logo.png"
              alt="UniTaskAI Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">Unitask AI</h1>
        </div>
        
        <IconButton
          onClick={() => setIsMemoryOpen(true)}
          variant="ghost"
          icon={<Database className="w-4 h-4" />}
          title="Open Memory"
        />
      </header>

      {/* Main Chat Area - Fills remaining space exactly */}
      <div className="flex-1 min-h-0 w-full flex flex-col">
        <Chat sessionId={sessionId} />
      </div>

      {/* Memory Modal */}
      <Modal 
        isOpen={isMemoryOpen} 
        onClose={() => setIsMemoryOpen(false)} 
        title="Knowledge Base (memory.md)"
      >
        <div className="p-0 h-[70vh]">
          <MemoryManager />
        </div>
      </Modal>
    </main>
  );
}