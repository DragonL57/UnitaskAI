import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', icon, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-gray-100/50 border border-transparent 
            focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5
            rounded-xl text-sm outline-none transition-all
            ${icon ? 'pl-10 pr-4' : 'px-4'} 
            py-2.5 text-gray-800 placeholder:text-gray-400
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
