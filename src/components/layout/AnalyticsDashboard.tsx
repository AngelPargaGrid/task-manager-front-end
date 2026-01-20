import React from 'react';
import type { AnalyticsDashboardProps } from '../../types/analytics.types';
import { KPICard } from '../ui/KPICard';
import { ChartPlaceholder } from '../ui/ChartPlaceholder';
import { DataTable } from '../ui/DataTable';
import { DateRangeSelector } from '../ui/DateRangeSelector';
import { FormSelect } from '../ui/FormSelect';

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  kpis,
  charts,
  tableData,
  filters,
  dateRange,
  isLoading = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your key metrics and performance indicators
          </p>
        </div>

        {/* Filters and Date Range */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            {filters?.map((filter, index) => (
              <div key={index} className="min-w-[150px]">
                <FormSelect
                  label={filter.label}
                  value={filter.value}
                  onChange={filter.onChange}
                  options={filter.options}
                  description=""
                />
              </div>
            ))}
          </div>
          {dateRange && (
            <DateRangeSelector
              startDate={dateRange.start}
              endDate={dateRange.end}
              onChange={dateRange.onChange}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} isLoading={isLoading} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {charts.map((chart) => (
            <ChartPlaceholder
              key={chart.id}
              title={chart.title}
              type={chart.type}
              data={chart.data}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Data Table */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Data Table
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed data view with sorting capabilities
            </p>
          </div>
          <DataTable
            columns={tableData.columns}
            rows={tableData.rows}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

