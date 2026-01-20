import React, { useState, useRef, useEffect } from 'react';
import type { DateRange } from '../../types/analytics.types';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onChange: (range: DateRange) => void;
  isLoading?: boolean;
}

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 },
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onChange,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStart, setLocalStart] = useState(
    startDate.toISOString().split('T')[0]
  );
  const [localEnd, setLocalEnd] = useState(endDate.toISOString().split('T')[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalStart(startDate.toISOString().split('T')[0]);
    setLocalEnd(endDate.toISOString().split('T')[0]);
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePresetClick = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onChange({ start, end });
    setIsOpen(false);
  };

  const handleApply = () => {
    const start = new Date(localStart);
    const end = new Date(localEnd);
    onChange({ start, end });
    setIsOpen(false);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Quick Presets
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.days}
                    onClick={() => handlePresetClick(preset.days)}
                    className="px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Custom Range
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={localStart}
                    onChange={(e) => setLocalStart(e.target.value)}
                    max={localEnd}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={localEnd}
                    onChange={(e) => setLocalEnd(e.target.value)}
                    min={localStart}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

