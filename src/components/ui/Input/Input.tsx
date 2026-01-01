import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', icon, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-muted/30 border border-transparent 
            focus:bg-background focus:border-border focus:ring-4 focus:ring-primary/5
            rounded-xl text-sm outline-none transition-all
            ${icon ? 'pl-10 pr-4' : 'px-4'} 
            py-2.5 text-foreground placeholder:text-muted-foreground
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';