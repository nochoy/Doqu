'use client';

import { ComponentProps } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends ComponentProps<'select'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  labelClassName?: string;
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

      <div className="relative">
        <select
          id={selectId}
          className={`
            block w-full appearance-none px-3 py-2 bg-card border border-input rounded-md shadow-xs transition-[color,box-shadow]
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
            pr-8
            file:text-foreground placeholder:text-muted-foreground 
            selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input 
            flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs 
            transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent 
            file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed 
            disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 
            focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 
            aria-invalid:border-destructive
            ${className ?? ''}
          `}
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
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
          <CaretDownIcon size={20} />
        </div>
      </div>
    </div>
  );
}
