'use client';

import React, { useState, useEffect } from 'react';
import { Database, FileText, Loader2 } from 'lucide-react';
import { getMemory } from '@/actions/memory';

export default function MemoryManager() {
  const [memoryContent, setMemoryContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemory = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await getMemory();
      setMemoryContent(data);
    } catch (error) {
      console.error('Error fetching memory:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMemory();

    // Auto-refresh every 5 seconds to show newest memory
    const interval = setInterval(() => {
      fetchMemory(false); // Don't show loading spinner for background refreshes
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 mt-8">
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Database className="w-6 h-6 text-yellow-500" />
          Memory File (memory.md)
        </h2>
        {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
      </div>

      <div className="relative group">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow">
            Auto-refreshing...
          </div>
        </div>
        <pre className="p-4 bg-gray-900 text-gray-100 text-sm font-mono overflow-x-auto min-h-[200px] whitespace-pre-wrap">
          {isLoading && !memoryContent ? 'Loading...' : memoryContent || '(Empty file)'}
        </pre>
      </div>

      <div className="bg-gray-50 p-3 flex items-center gap-2 text-gray-500 border-t border-gray-100">
        <FileText className="w-4 h-4" />
        <p className="text-[10px] uppercase tracking-widest font-medium">
          The Memory Agent autonomously edits this file. View updates here in real-time.
        </p>
      </div>
    </div>
  );
}
