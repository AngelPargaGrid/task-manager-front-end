import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  id,
}) => {
  const toggleId = id || `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1 mr-4">
        <label
          htmlFor={toggleId}
          className="block text-sm font-medium text-gray-900 dark:text-white mb-1"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={toggleId}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        id={toggleId}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};

