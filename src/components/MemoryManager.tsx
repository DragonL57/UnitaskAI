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
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Action Bar */}
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-gray-500">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Autonomous Learning Active</span>
        </div>
        <button 
          onClick={fetchMemory}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50 active:scale-90 text-xs font-bold text-gray-600"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Refresh</span>
        </button>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 overflow-y-auto bg-[#0d1117] font-mono text-[13px] leading-relaxed p-6">
        {isLoading && !memoryContent ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="font-bold uppercase tracking-[0.2em] text-[10px]">Accessing Vercel Blob...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {memoryContent ? (
              memoryContent.split('\n').map((line, i) => (
                <div key={i} className="flex gap-6 group hover:bg-white/5 transition-colors">
                  <span className="w-8 text-right text-gray-600 select-none opacity-40 font-bold">{i + 1}</span>
                  <span className={getLineStyle(line)}>{line || ' '}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Memory is empty.</p>
            )}
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="bg-white p-4 flex items-center justify-between border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2 text-gray-400">
          <FileText className="w-4 h-4" />
          <p className="text-[10px] uppercase tracking-widest font-black">
            Personal Knowledge Base
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Cloud Sync</span>
        </div>
      </div>
    </div>
  );
}

function getLineStyle(line: string) {
  if (line.startsWith('# ')) return 'text-indigo-400 font-black text-base';
  if (line.startsWith('## ')) return 'text-purple-400 font-bold';
  if (line.startsWith('### ')) return 'text-blue-400 font-bold';
  if (line.startsWith('- ')) return 'text-gray-300';
  if (line.includes('**')) return 'text-amber-400';
  return 'text-gray-100';
}