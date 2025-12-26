'use client';

import React, { useState } from 'react';
import Chat from '@/components/Chat';
import MemoryManager from '@/components/MemoryManager';
import Modal from '@/components/Modal';
import { Database, Sparkles, Calendar, Search } from 'lucide-react';

export default function Home() {
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  // Note: activeAgent state is currently local to Home but needs to be shared with Chat or moved
  const [activeAgent, _setActiveAgent] = useState<'scheduler' | 'researcher' | 'memory' | 'main' | null>(null);

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
          <div className="flex gap-2">
            <AgentBadge active={activeAgent === 'scheduler'} color="bg-emerald-500" icon={<Calendar className="w-3.5 h-3.5" />} label="Scheduler" />
            <AgentBadge active={activeAgent === 'researcher'} color="bg-purple-500" icon={<Search className="w-3.5 h-3.5" />} label="Researcher" />
            <AgentBadge active={activeAgent === 'memory'} color="bg-amber-500" icon={<Database className="w-3.5 h-3.5" />} label="Memory" />
          </div>

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

function AgentBadge({ active, color, icon, label }: { active: boolean; color: string; icon: React.ReactNode; label: string }) {
  if (!active) return null;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${color} text-white shadow-lg animate-in slide-in-from-top-4 duration-500 ring-2 ring-white/50`}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
    </div>
  );
}
