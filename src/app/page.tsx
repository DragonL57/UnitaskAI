'use client';

import React, { useState } from 'react';
import Chat from '@/components/Chat';
import MemoryManager from '@/components/MemoryManager';
import { MessageSquare, Database } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'memory'>('chat');

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header - Fixed on mobile, compact */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 md:py-6 flex justify-between items-center shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight leading-none">Unitask AI</h1>
          <p className="hidden md:block mt-1 text-sm text-gray-500">Your multi-agent chatbot companion.</p>
        </div>
        
        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('chat')}
            className={`p-2 rounded-md transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`p-2 rounded-md transition-all ${activeTab === 'memory' ? 'bg-white shadow-sm text-yellow-600' : 'text-gray-500'}`}
          >
            <Database className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full md:p-6 gap-6">
        
        {/* Chat Section */}
        <div className={`flex-1 flex flex-col h-full ${activeTab !== 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <Chat />
        </div>

        {/* Memory Section */}
        <div className={`flex-1 flex flex-col h-full overflow-y-auto ${activeTab !== 'memory' ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 md:px-0">
            <MemoryManager />
          </div>
          <footer className="mt-auto py-6 text-center text-xs text-gray-400">
            Built for personal use. Powered by Poe API.
          </footer>
        </div>

      </div>
    </main>
  );
}
