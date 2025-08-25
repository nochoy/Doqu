'use client';

import { ComponentProps } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends ComponentProps<'select'> {
  label: string;
  options: SelectOption[];
}

export default function Select({ label, id, options, className, ...props }: SelectProps) {
  const selectId = id;

  return (
    <div>
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-foreground mb-1 text-left"
      >
        {label}
      </label>
      <select
        id={selectId}
        className={`block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${className ?? ''}`}
        {...props}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
