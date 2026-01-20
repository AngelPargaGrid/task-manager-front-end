import React, { useState } from 'react';
import type { TableColumn, TableRow } from '../../types/analytics.types';

interface DataTableProps {
  columns: TableColumn[];
  rows: TableRow[];
  isLoading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  isLoading = false,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue);
    const bStr = String(bValue);
    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <svg
                        className={`w-4 h-4 ${
                          sortDirection === 'asc' ? '' : 'transform rotate-180'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedRows.length > 0 ? (
              sortedRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

