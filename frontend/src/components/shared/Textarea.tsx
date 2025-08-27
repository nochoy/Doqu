'use client';

import { ComponentProps, forwardRef } from 'react';

interface TextareaProps extends ComponentProps<'textarea'> {
  label: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, id, className, ...props },
  ref
) {
  const textareaId = id;
  return (
    <div>
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-foreground mb-1 text-left"
      >
        {label}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        className={`
          block bg-card focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
          placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground 
          border-input flex h-30 w-full rounded-md border bg-transparent px-3 py-2 text-base 
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

export default Textarea;
