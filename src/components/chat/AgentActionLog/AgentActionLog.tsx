'use client';

import React, { useState } from 'react';
import { Zap, Search, FileText, ChevronDown, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="my-3 max-w-2xl mx-auto">
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <button 
          onClick={() => setUserOpened(!userOpened)}
          aria-expanded={isOpen}
          className={`flex items-center justify-between w-full px-4 py-3 transition-colors ${ 
            isOpen 
              ? 'bg-muted/30 text-foreground' 
              : 'hover:bg-muted/50 text-muted-foreground'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Zap className={`w-4 h-4 ${forceOpen ? 'animate-pulse' : ''}`} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Agent Activity</div>
              <div className="text-[11px] text-muted-foreground font-medium">
                {steps.length} {steps.length === 1 ? 'Step' : 'Steps'} Processed
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden bg-muted/10">
            <div className="border-t border-border divide-y divide-border/50">
              {steps.map((step, i) => (
                <AccordionStep key={i} step={step} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function AccordionStep({ step }: { step: OrchestrationStep }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Analyze step type for styling
  const text = step.text.toLowerCase();
  const isConsulter = text.includes('consulter');
  const isApproved = isConsulter && text.includes('approve');
  const isCritique = isConsulter && (text.includes('critique') || text.includes('reject') || text.includes('feedback'));
  const isSearch = text.includes('search') || text.includes('brave') || text.includes('tavily');
  const hasMetadata = step.metadata && (step.metadata.urls?.length || step.metadata.titles?.length);
  const isLongText = step.text.length > 80;

  // Determine Icon and Accent Color
  let Icon = Zap;
  let iconClass = "text-primary";
  
  if (isConsulter) {
    if (isApproved) {
      Icon = CheckCircle;
      iconClass = "text-emerald-600 dark:text-emerald-500";
    } else if (isCritique) {
      Icon = AlertCircle;
      iconClass = "text-amber-600 dark:text-amber-500";
    } else {
      Icon = MessageSquare;
      iconClass = "text-violet-600 dark:text-violet-500";
    }
  } else if (isSearch) {
    Icon = Search;
    iconClass = "text-blue-500 dark:text-blue-400";
  } else if (step.type === 'report') {
    Icon = FileText;
    iconClass = "text-foreground";
  }

  const isExpandable = isLongText || hasMetadata || step.type === 'report';

  return (
    <div className={`transition-colors ${isExpanded ? 'bg-background' : 'hover:bg-muted/30'}`}>
      <button 
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
        disabled={!isExpandable}
        aria-expanded={isExpanded}
        className={`w-full px-4 py-3 flex items-start gap-3 text-left ${isExpandable ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className={`mt-0.5 shrink-0 ${iconClass}`}>
           <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded-sm">
              {step.type}
            </span>
            <span className="text-xs text-muted-foreground font-medium truncate">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className={`text-sm leading-relaxed transition-colors ${isExpanded ? 'text-foreground' : 'text-muted-foreground'}`}>
             {isLongText ? (
               <span className="line-clamp-1">{step.text}</span>
             ) : (
               step.text
             )}
          </div>
        </div>
        
        {isExpandable && (
           <ChevronDown className={`w-4 h-4 text-muted-foreground/50 shrink-0 transition-transform duration-200 mt-1 ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Expanded Content */}
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 pl-[3.25rem] space-y-3">
            {isLongText && (
              <div className="text-xs text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-3 rounded-md border border-border/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {step.text}
                </ReactMarkdown>
              </div>
            )}

            {hasMetadata && (
              <div className="flex flex-wrap gap-2">
                {step.metadata?.urls?.map((url, idx) => {
                  const title = step.metadata?.titles?.[idx] || `Source ${idx + 1}`;
                  return (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-muted text-muted-foreground hover:text-foreground rounded-md text-xs font-medium transition-all border border-border shadow-sm hover:shadow-md"
                    >
                      <Search className="w-3.5 h-3.5 opacity-70" />
                      <span className="max-w-[200px] truncate">{title}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
