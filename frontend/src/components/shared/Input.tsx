'use client';

import { ComponentProps, forwardRef } from 'react';

interface InputProps extends ComponentProps<'input'> {
  label: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className, ...props },
  ref
) {
  const inputId = id;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1 text-left">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`
          bg-card
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
          placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground 
          border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base 
          shadow-xs transition-[color,box-shadow] outline-none 
          disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
          focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 
          aria-invalid:border-destructive
          ${className ?? ''}`}
        {...props}
      />
    </div>
  );
});

export default Input;
