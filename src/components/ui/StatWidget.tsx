import React from 'react';
import type { StatWidget as StatWidgetType } from '../../types/dashboard.types';

interface StatWidgetProps {
  stat: StatWidgetType;
}

export const StatWidget: React.FC<StatWidgetProps> = ({ stat }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          {stat.icon}
        </div>
        {stat.change && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              stat.change.isPositive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {stat.change.isPositive ? '+' : ''}
            {stat.change.value}%
          </span>
        )}
      </div>
      <div className="mb-1">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {stat.value}
        </p>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
    </div>
  );
};

