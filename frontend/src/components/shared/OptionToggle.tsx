'use client';

import React, { useId, useRef } from 'react';

interface OptionToggleProps {
  label: string;
  optionOne: string;
  optionTwo: string;
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OptionToggle({
  label,
  optionOne,
  optionTwo,
  selectedValue,
  onChange,
  disabled,
}: OptionToggleProps) {
  const labelId = useId();
  const isOptionOneSelected = selectedValue === optionOne;
  const btn1Ref = useRef<HTMLButtonElement>(null);
  const btn2Ref = useRef<HTMLButtonElement>(null);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIsOptionOne = !isOptionOneSelected;
      onChange(isOptionOneSelected ? optionOne : optionTwo);
      (nextIsOptionOne ? btn1Ref : btn2Ref).current?.focus();
    }
  };
  return (
    <div>
      <label id={labelId} className="block text-sm font-medium text-foreground text-left">
        {label}
      </label>
      <div
        className="mt-2 p-1 rounded-lg flex items-center bg-background relative w-full h-11"
        role="radiogroup"
        aria-orientation="horizontal"
        aria-labelledby={labelId}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
      >
        {/* Sliding bar */}
        <span
          aria-hidden="true"
          className={`absolute top-1 left-1 h-9 w-1/2 rounded-md bg-primary shadow-md transform transition-transform duration-300 ease-in-out
            ${isOptionOneSelected ? 'translate-x-0' : 'translate-x-full'}`}
        />

        {/* Button 1 */}
        <button
          ref={btn1Ref}
          type="button"
          role="radio"
          aria-checked={isOptionOneSelected}
          aria-disabled={disabled || undefined}
          tabIndex={isOptionOneSelected ? 0 : -1}
          onClick={() => {
            if (selectedValue !== optionOne && !disabled) onChange(optionOne);
          }}
          disabled={disabled}
          className={`w-1/2 h-full rounded-md text-sm font-medium z-10 transition-colors duration-300 cursor-pointer 
            disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
            ${!isOptionOneSelected ? 'text-muted-foreground' : 'text-primary-foreground'}`}
        >
          {optionOne}
        </button>

        {/* Button 2 */}
        <button
          ref={btn2Ref}
          type="button"
          role="radio"
          aria-checked={!isOptionOneSelected}
          aria-disabled={disabled || undefined}
          tabIndex={!isOptionOneSelected ? 0 : -1}
          onClick={() => {
            if (selectedValue !== optionTwo && !disabled) onChange(optionTwo);
          }}
          disabled={disabled}
          className={`w-1/2 h-full rounded-md text-sm font-medium z-10 transition-colors duration-300 cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
            ${isOptionOneSelected ? 'text-muted-foreground' : 'text-primary-foreground'}`}
        >
          {optionTwo}
        </button>
      </div>
    </div>
  );
}
