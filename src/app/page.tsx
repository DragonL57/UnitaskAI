'use client';

import React, { useState } from 'react';
import Chat from '@/components/Chat';
import MemoryManager from '@/components/MemoryManager';
import Modal from '@/components/Modal';
import { Database, Sparkles } from 'lucide-react';

export default function Home() {
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);

  return (
    <main className="h-screen w-full bg-white flex flex-col overflow-hidden">
      {/* Fixed Header with Proper Boundary */}
      <header className="h-16 px-6 flex justify-between items-center z-30 bg-white border-b border-gray-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tighter">Unitask AI</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMemoryOpen(true)}
            className="flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-amber-500 rounded-xl border border-gray-100 transition-all active:scale-95 shadow-sm"
            title="Open Memory"
          >
            <Database className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area - Occupies remaining space below header */}
      <div className="flex-1 w-full flex flex-col overflow-hidden bg-white">
        <Chat />
      </div>

      {/* Memory Modal */}
      <Modal 
        isOpen={isMemoryOpen} 
        onClose={() => setIsMemoryOpen(false)} 
        title="Knowledge Base (memory.md)"
      >
        <div className="p-0 h-[75vh]">
          <MemoryManager />
        </div>
      </Modal>
    </main>
  );
}