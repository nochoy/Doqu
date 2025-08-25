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
        className={`block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${className ?? ''}`}
        {...props}
      />
    </div>
  );
});

export default Textarea;
