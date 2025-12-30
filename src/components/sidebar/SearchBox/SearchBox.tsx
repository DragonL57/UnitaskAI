'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBox = ({ value, onChange }: SearchBoxProps) => {
  return (
    <div className="mb-4">
      <Input 
        placeholder="Search chats..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={<Search className="w-4 h-4" />}
      />
    </div>
  );
};
