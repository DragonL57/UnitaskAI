'use client';

import React, { useState } from 'react';
import { Zap, Search, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { OrchestrationStep } from '@/context/ChatContext';

interface AgentActionLogProps {
  steps: OrchestrationStep[];
  forceOpen?: boolean;
}

export const AgentActionLog = ({ steps, forceOpen }: AgentActionLogProps) => {
  const [userOpened, setUserOpened] = useState(false);
  const isOpen = forceOpen || userOpened;

  return (
    <div className="ml-1 my-1">
      <button 
        onClick={() => setUserOpened(!userOpened)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full transition-all text-[9px] font-bold uppercase tracking-wider border ${ 
          isOpen 
            ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
            : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
        }`}
      >
        <Zap className={`w-2.5 h-2.5 ${forceOpen ? 'animate-pulse' : ''}`} />
        <span>{steps.length} {steps.length === 1 ? 'Step' : 'Steps'} Background</span>
        {isOpen ? <ChevronUp className="w-2.5 h-2.5 ml-0.5" /> : <ChevronDown className="w-2.5 h-2.5 ml-0.5" />}
      </button>
      
      {isOpen && (
        <div className="mt-2 ml-2.5 p-0.5 space-y-0.5 border-l-2 border-gray-100 animate-in slide-in-from-top-1 duration-200">
          {steps.map((step, i) => (
            <CollapsibleStep key={i} step={step} />
          ))}
        </div>
      )}
    </div>
  );
};

function CollapsibleStep({ step }: { step: OrchestrationStep }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDelegation = step.text.includes('➔');
  const hasMetadata = step.metadata && (step.metadata.urls?.length || step.metadata.titles?.length);

  const config = {
    thought: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    action: { 
      icon: isDelegation ? Zap : Search, 
      color: isDelegation ? 'text-indigo-600' : 'text-blue-500', 
      bg: isDelegation ? 'bg-indigo-50' : 'bg-blue-50' 
    },
    report: { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  }[step.type];

  const Icon = config.icon;
  const isExpandable = step.text.length > 60 || hasMetadata || step.type === 'report';

  return (
    <div className="relative pl-6 py-1 group">
      <div className={`absolute left-[-5px] top-[14px] w-2 h-2 rounded-full border-2 bg-white transition-all z-10 ${ 
        isExpanded ? 'border-indigo-500 scale-110' : 'border-gray-200 group-hover:border-gray-400'
      }`} />

      <div className={`flex flex-col rounded-xl transition-all border ${ 
        isExpanded 
          ? 'bg-gray-50/30 border-gray-100 p-2.5' 
          : 'bg-transparent border-transparent hover:bg-gray-50/50 px-2 py-1'
      }`}>
        <button 
          onClick={() => isExpandable && setIsExpanded(!isExpanded)}
          disabled={!isExpandable}
          className={`flex items-center gap-3 w-full text-left ${isExpandable ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
            <Icon className="w-3 h-3" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[7px] font-black uppercase tracking-widest px-1 rounded ${config.bg} ${config.color}`}>
                {step.type}
              </span>
              <span className={`text-[11px] font-medium truncate transition-colors ${isExpanded ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.text}
              </span>
            </div>
          </div>
          
          {isExpandable && (
            <ChevronDown className={`w-3 h-3 text-gray-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </button>

        {isExpanded && (
          <div className="mt-2.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
            {step.text.length > 60 && (
              <div className="text-[11px] text-gray-600 leading-relaxed pl-1 bg-white/50 p-2 rounded-lg border border-gray-100/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {step.text}
                </ReactMarkdown>
              </div>
            )}

            {hasMetadata && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {step.metadata?.urls?.map((url, idx) => {
                  const title = step.metadata?.titles?.[idx] || `Source ${idx + 1}`;
                  return (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg text-[10px] font-bold transition-all border border-gray-100 hover:border-indigo-100 shadow-xs active:scale-95"
                    >
                      <Search className="w-3 h-3" />
                      <span className="max-w-[150px] truncate">{title}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
