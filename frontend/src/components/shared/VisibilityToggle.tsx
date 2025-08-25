'use client';

interface VisibilityToggleProps {
  label: string;
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
}

export default function VisibilityToggle({ label, isPublic, onChange }: VisibilityToggleProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-2 p-1 rounded-lg flex items-center bg-gray-200 relative w-full h-11">
        {/* Sliding purple bar */}
        <span
          className={`absolute top-1 h-9 w-1/2 rounded-md bg-indigo-600 shadow-md transform transition-transform duration-300 ease-in-out
            ${isPublic ? 'translate-x-full' : 'translate-x-0'}`}
          style={{ left: '2px' }}
        />

        {/* Private Button */}
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`w-1/2 h-full rounded-md text-sm font-medium z-10 transition-colors duration-300 cursor-pointer 
            ${!isPublic ? 'text-white' : 'text-gray-700'}`}
        >
          Private
        </button>

        {/* Public Button */}
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`w-1/2 h-full rounded-md text-sm font-medium z-10 transition-colors duration-300 cursor-pointer
            ${isPublic ? 'text-white' : 'text-gray-700'}`}
        >
          Public
        </button>
      </div>
    </div>
  );
}
