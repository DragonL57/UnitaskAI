'use client';

import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw } from 'lucide-react';
import { getMemory, removeMemoryEntry } from '@/actions/memory';
import { MemoryEntry } from '@/agents/memory';

export default function MemoryManager() {
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemory = async () => {
    setIsLoading(true);
    try {
      const data = await getMemory();
      setMemory(data);
    } catch (error) {
      console.error('Error fetching memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const handleDelete = async (key: string) => {
    if (confirm(`Are you sure you want to delete memory for "${key}"?`)) {
      await removeMemoryEntry(key);
      await fetchMemory();
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 mt-8">
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Database className="w-6 h-6 text-yellow-500" />
          Memory Manager
        </h2>
        <button 
          onClick={fetchMemory}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Refresh memory"
        >
          <RefreshCw className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 italic">Loading memory...</div>
        ) : memory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic">No memory entries found.</div>
        ) : (
          <div className="space-y-3">
            {memory.map((entry) => (
              <div key={entry.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">{entry.key}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 uppercase font-bold tracking-tighter">
                      {entry.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value)}
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-2">
                    Updated: {new Date(entry.updatedAt).toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(entry.key)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          Note: This is your personal companion's persistent memory.
        </p>
      </div>
    </div>
  );
}
