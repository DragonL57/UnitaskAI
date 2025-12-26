'use client';

import React, { useState, useEffect } from 'react';
import { Database, FileText, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { getMemory } from '@/actions/memory';

export default function MemoryManager() {
  const [memoryContent, setMemoryContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemory = async () => {
    setIsLoading(true);
    try {
      const data = await getMemory();
      setMemoryContent(data);
    } catch (error) {
      console.error('Error fetching memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white md:shadow-xl md:rounded-2xl overflow-hidden border-x border-b md:border border-gray-200">
      {/* Header */}
      <div className="bg-gray-50/50 p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-white shadow-sm">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tighter">Persistent Memory</h2>
            <p className="text-[10px] text-gray-500 font-medium">memory.md</p>
          </div>
        </div>
        <button 
          onClick={fetchMemory}
          disabled={isLoading}
          className="p-2 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50 active:scale-90"
          title="Refresh memory"
        >
          {isLoading ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <RefreshCw className="w-5 h-5 text-gray-500" />}
        </button>
      </div>

      {/* Markdown Content */}
      <div className="flex-1 overflow-y-auto bg-[#0d1117] p-4 font-mono text-[13px] leading-relaxed">
        {isLoading && !memoryContent ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading database...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {memoryContent ? (
              memoryContent.split('\n').map((line, i) => (
                <div key={i} className="flex gap-4 group">
                  <span className="w-8 text-right text-gray-600 select-none opacity-50 group-hover:opacity-100 transition-opacity">{i + 1}</span>
                  <span className={getLineStyle(line)}>{line || ' '}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Memory is empty.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer / Status */}
      <div className="bg-gray-50 p-3 px-4 flex items-center justify-between border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-2 text-gray-500">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Autonomous Sync Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vercel Blob</span>
        </div>
      </div>
    </div>
  );
}

function getLineStyle(line: string) {
  if (line.startsWith('# ')) return 'text-blue-400 font-bold text-base';
  if (line.startsWith('## ')) return 'text-purple-400 font-bold';
  if (line.startsWith('### ')) return 'text-orange-400 font-bold';
  if (line.startsWith('- ')) return 'text-gray-300';
  if (line.includes('**')) return 'text-green-400';
  return 'text-gray-100';
}
