import React from 'react';
import type { ChartData } from '../../types/analytics.types';

interface ChartPlaceholderProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartData;
  isLoading?: boolean;
}

export const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({
  title,
  type,
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  // Generate mock chart visualization
  const maxValue = Math.max(...data.datasets.flatMap((d) => d.data));
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-indigo-500',
  ];

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {data.labels.map((label, index) => {
              const value = data.datasets[0]?.data[index] || 0;
              const height = (value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-64">
                    <div
                      className={`w-full ${colors[index % colors.length]} rounded-t transition-all hover:opacity-80`}
                      style={{ height: `${height}%` }}
                      title={`${label}: ${value}`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case 'line':
      case 'area':
        return (
          <div className="h-64 relative px-4 py-2">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              {data.datasets.map((dataset, datasetIndex) => {
                const points = data.labels
                  .map((_, index) => {
                    const value = dataset.data[index] || 0;
                    const x = (index / (data.labels.length - 1)) * 400;
                    const y = 200 - (value / maxValue) * 200;
                    return `${x},${y}`;
                  })
                  .join(' ');

                return (
                  <g key={datasetIndex}>
                    {type === 'area' && (
                      <polygon
                        points={`0,200 ${points} 400,200`}
                        fill={dataset.color || '#3B82F6'}
                        fillOpacity="0.2"
                      />
                    )}
                    <polyline
                      points={points}
                      fill="none"
                      stroke={dataset.color || '#3B82F6'}
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-0 left-4 right-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
              {data.labels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          </div>
        );

      case 'pie':
        const total = data.datasets[0]?.data.reduce((a, b) => a + b, 0) || 1;
        let currentAngle = 0;
        return (
          <div className="h-64 flex items-center justify-center">
            <svg className="w-48 h-48" viewBox="0 0 100 100">
              {data.datasets[0]?.data.map((value, index) => {
                const percentage = (value / total) * 100;
                const angle = (percentage / 100) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                currentAngle = endAngle;

                const startAngleRad = (startAngle * Math.PI) / 180;
                const endAngleRad = (endAngle * Math.PI) / 180;

                const x1 = 50 + 50 * Math.cos(startAngleRad - Math.PI / 2);
                const y1 = 50 + 50 * Math.sin(startAngleRad - Math.PI / 2);
                const x2 = 50 + 50 * Math.cos(endAngleRad - Math.PI / 2);
                const y2 = 50 + 50 * Math.sin(endAngleRad - Math.PI / 2);

                const largeArc = angle > 180 ? 1 : 0;

                return (
                  <g key={index}>
                    <title>{`${data.labels[index]}: ${value} (${percentage.toFixed(1)}%)`}</title>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={data.datasets[0]?.color || colors[index % colors.length].replace('bg-', '')}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </g>
                );
              })}
            </svg>
            <div className="ml-8 space-y-2">
              {data.labels.map((label, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded ${colors[index % colors.length]}`}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div className="h-64 flex items-center justify-center text-gray-500">Chart type not supported</div>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="relative">
        {renderChart()}
        <div className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
          {type.toUpperCase()} Chart
        </div>
      </div>
      {data.datasets.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: dataset.color || '#3B82F6' }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {dataset.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

