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
        className={`block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${className ?? ''}`}
        {...props}
      />
    </div>
  );
});

export default Input;
