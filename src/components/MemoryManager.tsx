'use client';

import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, FileText } from 'lucide-react';
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
    <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 mt-8">
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Database className="w-6 h-6 text-yellow-500" />
          Memory File (memory.md)
        </h2>
        <button 
          onClick={fetchMemory}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Refresh memory"
        >
          <RefreshCw className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative group">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow">
            Read-only View
          </div>
        </div>
        <pre className="p-4 bg-gray-900 text-gray-100 text-sm font-mono overflow-x-auto min-h-[200px] whitespace-pre-wrap">
          {isLoading ? 'Loading...' : memoryContent || '(Empty file)'}
        </pre>
      </div>

      <div className="bg-gray-50 p-3 flex items-center gap-2 text-gray-500 border-t border-gray-100">
        <FileText className="w-4 h-4" />
        <p className="text-[10px] uppercase tracking-widest font-medium">
          The Memory Agent autonomously edits this file based on your conversations.
        </p>
      </div>
    </div>
  );
}