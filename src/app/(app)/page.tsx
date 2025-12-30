'use client';

import React, { useState } from 'react';
import Chat from '@/components/Chat';
import MemoryManager from '@/components/MemoryManager';
import Modal from '@/components/Modal';
import { Database, Sparkles } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

export default function Home({ sessionId }: { sessionId?: string }) {
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);

  return (
    <main className="h-[100dvh] w-full bg-white flex flex-col overflow-hidden">
      {/* App Header */}
      <header className="h-14 px-6 flex justify-between items-center bg-white border-b border-gray-100 shrink-0 z-20">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <div className="bg-indigo-600 p-1 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-black text-gray-900 tracking-tighter">Unitask AI</h1>
        </div>
        
        <IconButton
          onClick={() => setIsMemoryOpen(true)}
          variant="secondary"
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
