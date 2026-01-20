import React from 'react';
import type { KPICard as KPICardType } from '../../types/analytics.types';

interface KPICardProps {
  kpi: KPICardType;
  isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          {kpi.icon}
        </div>
        {kpi.trend && (
          <div
            className={`flex items-center gap-1 ${
              kpi.trend === 'up'
                ? 'text-green-500'
                : kpi.trend === 'down'
                ? 'text-red-500'
                : 'text-gray-500'
            }`}
          >
            {kpi.trend === 'up' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            )}
            {kpi.trend === 'down' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            )}
            {kpi.trend === 'stable' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14"
                />
              </svg>
            )}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        {kpi.title}
      </h3>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {kpi.value}
      </p>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium ${
            kpi.change.isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {kpi.change.isPositive ? '+' : ''}
          {kpi.change.value}%
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          vs {kpi.change.period}
        </span>
      </div>
    </div>
  );
};

