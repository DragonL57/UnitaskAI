'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  role: 'user' | 'assistant';
}

export const MarkdownRenderer = ({ content, role }: MarkdownRendererProps) => {
  return (
    <div className={`text-[15px] md:text-[16px] leading-relaxed markdown-content ${role === 'user' ? 'text-primary-foreground' : 'text-foreground'}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          br: () => <br />,
          // Add custom components for code blocks if needed in future
          code({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className;
            
            if (isInline) {
              return (
                <code className="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <div className="relative my-4 rounded-lg overflow-hidden border border-border bg-muted/30">
                {/* Optional: Add a header for the code block here (copy button, language label) */}
                <div className="overflow-x-auto p-4">
                  <code className={`font-mono text-sm ${className}`} {...props}>
                    {children}
                  </code>
                </div>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
