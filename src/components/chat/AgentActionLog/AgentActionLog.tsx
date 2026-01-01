'use client';

import React, { useState } from 'react';
import { Zap, Search, FileText, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
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
    <div className="ml-0.5 my-1">
      <button 
        onClick={() => setUserOpened(!userOpened)}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all text-[9px] font-bold uppercase tracking-wider border ${ 
          isOpen 
            ? 'bg-primary/5 border-primary/20 text-primary' 
            : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
        }`}
      >
        <Zap className={`w-2.5 h-2.5 ${forceOpen ? 'animate-pulse' : ''}`} />
        <span>{steps.length} {steps.length === 1 ? 'Step' : 'Steps'}</span>
        {isOpen ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
      </button>
      
      {isOpen && (
        <div className="mt-1 ml-2 p-0.5 space-y-0 border-l border-border/50 animate-in slide-in-from-top-1 duration-200">
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
  const isConsulter = step.text.toLowerCase().includes('consulter');
  const isSearch = step.text.toLowerCase().includes('search') || step.text.toLowerCase().includes('brave') || step.text.toLowerCase().includes('tavily');
  const hasMetadata = step.metadata && (step.metadata.urls?.length || step.metadata.titles?.length);

  const config = {
    thought: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    action: { 
      icon: isConsulter ? MessageSquare : (isSearch ? Search : Zap), 
      color: isConsulter ? 'text-purple-600 dark:text-purple-400' : (isSearch ? 'text-blue-500 dark:text-blue-400' : 'text-indigo-600 dark:text-indigo-400'), 
      bg: isConsulter ? 'bg-purple-50 dark:bg-purple-950/30' : (isSearch ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-indigo-50 dark:bg-indigo-950/30') 
    },
    report: { 
      icon: isConsulter ? MessageSquare : FileText, 
      color: isConsulter ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400', 
      bg: isConsulter ? 'bg-purple-50 dark:bg-purple-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30' 
    }
  }[step.type];

  const Icon = config.icon;
  const isExpandable = step.text.length > 60 || hasMetadata || step.type === 'report';

  return (
    <div className="relative pl-5 py-0.5 group">
      <div className={`absolute left-[-3px] top-[10px] w-1.5 h-1.5 rounded-full border bg-background transition-all z-10 ${ 
        isExpanded ? 'border-primary scale-110' : 'border-border group-hover:border-muted-foreground'
      }`} />

      <div className={`flex flex-col rounded-lg transition-all border ${ 
        isExpanded 
          ? 'bg-muted/30 border-border p-2' 
          : 'bg-transparent border-transparent hover:bg-muted/20 px-1.5 py-0.5'
      }`}>
        <button 
          onClick={() => isExpandable && setIsExpanded(!isExpanded)}
          disabled={!isExpandable}
          className={`flex items-center gap-2 w-full text-left ${isExpandable ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
            <Icon className="w-2.5 h-2.5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-[7px] font-black uppercase tracking-widest px-1 rounded-sm ${config.bg} ${config.color}`}>
                {step.type}
              </span>
              <span className={`text-[10px] font-medium truncate transition-colors ${isExpanded ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.text}
              </span>
            </div>
          </div>
          
          {isExpandable && (
            <ChevronDown className={`w-2.5 h-2.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-2 animate-in fade-in zoom-in-95 duration-200">
            {step.text.length > 60 && (
              <div className="text-[10px] text-muted-foreground leading-relaxed pl-1 bg-background/50 p-1.5 rounded-md border border-border/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {step.text}
                </ReactMarkdown>
              </div>
            )}

            {hasMetadata && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {step.metadata?.urls?.map((url, idx) => {
                  const title = step.metadata?.titles?.[idx] || `Source ${idx + 1}`;
                  return (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-muted text-muted-foreground hover:text-foreground rounded text-[9px] font-bold transition-all border border-border hover:border-primary/20 shadow-sm active:scale-95"
                    >
                      <Search className="w-2.5 h-2.5" />
                      <span className="max-w-[120px] truncate">{title}</span>
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
