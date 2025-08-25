'use client';

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
  const isOptionOneSelected = selectedValue === optionOne;
  return (
    <div>
      <label className="block text-sm font-medium text-foreground text-left">{label}</label>
      <div
        className="mt-2 p-1 rounded-lg flex items-center bg-muted relative w-full h-11"
        role="radiogroup"
        aria-label={label}
      >
        {/* Sliding bar */}
        <span
          className={`absolute top-1 h-9 w-1/2 rounded-md bg-primary shadow-md transform transition-transform duration-300 ease-in-out
            ${isOptionOneSelected ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ left: '2px' }}
        />

        {/* Button 1 */}
        <button
          type="button"
          onClick={() => {
            if (selectedValue !== optionOne && !disabled) onChange(optionOne);
          }}
          disabled={disabled}
          className={`w-1/2 h-full rounded-md text-sm font-medium z-10 transition-colors duration-300 cursor-pointer 
            ${!isOptionOneSelected ? 'text-muted-foreground' : 'text-primary-foreground'}`}
        >
          {optionOne}
        </button>

        {/* Button 2 */}
        <button
          type="button"
          onClick={() => {
            if (selectedValue !== optionTwo && !disabled) onChange(optionTwo);
          }}
          disabled={disabled}
          className={`w-1/2 h-full rounded-md text-sm font-medium z-10 transition-colors duration-300 cursor-pointer
            ${isOptionOneSelected ? 'text-muted-foreground' : 'text-primary-foreground'}`}
        >
          {optionTwo}
        </button>
      </div>
    </div>
  );
}
