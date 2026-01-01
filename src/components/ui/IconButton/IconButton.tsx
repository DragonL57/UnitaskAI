import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'secondary' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = '', variant = 'ghost', size = 'md', icon, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 disabled:pointer-events-none rounded-xl';
    
    const variants = {
      ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-sm',
      outline: 'bg-background text-muted-foreground hover:text-foreground border border-border shadow-sm hover:bg-muted',
      danger: 'bg-transparent text-destructive hover:bg-destructive/10',
    };

    const sizes = {
      xs: 'w-7 h-7 p-1',
      sm: 'w-8 h-8 p-1.5',
      md: 'w-9 h-9 p-2',
      lg: 'w-12 h-12 p-2.5',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';