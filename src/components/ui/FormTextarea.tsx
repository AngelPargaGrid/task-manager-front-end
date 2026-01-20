import React from 'react';

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  id?: string;
  description?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  id,
  description,
}) => {
  const textareaId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="mb-4">
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-3 py-2 border rounded-lg
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          border-gray-300 dark:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-y
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : undefined}
      />
      {error && (
        <p
          id={`${textareaId}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

