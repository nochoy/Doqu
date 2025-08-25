'use client';

import { ComponentProps } from 'react';

type SelectVariant = 'category' | 'difficulty';

interface SelectProps extends ComponentProps<'select'> {
  label: string;
  variant: SelectVariant;
}

const categories = [
  'Arts',
  'Biology',
  'Chemistry',
  'Computers',
  'English',
  'Fun',
  'Geography',
  'History',
  'Mathematics',
  'Physics',
  'Science',
  'Social Studies',
];
const difficultyOptions = [
  { value: 1, label: '1 (Easiest)' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5 (Hardest)' },
];

export default function Select({ label, id, variant, ...props }: SelectProps) {
  let options;

  if (variant === 'category') {
    options = (
      <>
        <option value="" disabled>
          Select a category
        </option>
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </>
    );
  } else if (variant === 'difficulty') {
    options = difficultyOptions.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ));
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        {...props}
      >
        {options}
      </select>
    </div>
  );
}
