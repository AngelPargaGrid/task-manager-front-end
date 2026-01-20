import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  description?: string;
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  id,
  description,
  placeholder,
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="mb-4">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          border-gray-300 dark:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

