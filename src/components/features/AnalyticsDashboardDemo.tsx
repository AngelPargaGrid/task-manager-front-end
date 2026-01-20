import { useState, useEffect } from 'react';
import { AnalyticsDashboard } from '../layout/AnalyticsDashboard';
import type {
  KPICard,
  TableColumn,
  TableRow,
  DateRange,
} from '../../types/analytics.types';

export const AnalyticsDashboardDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Simulate loading state
  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  useEffect(() => {
    simulateLoading();
  }, [dateRange, selectedRegion, selectedCategory]);

  const kpis: KPICard[] = [
    {
      id: '1',
      title: 'Total Revenue',
      value: '$124,567',
      change: { value: 12.5, isPositive: true, period: 'last month' },
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: '2',
      title: 'Active Users',
      value: '8,234',
      change: { value: 8.2, isPositive: true, period: 'last week' },
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: '3',
      title: 'Conversion Rate',
      value: '3.24%',
      change: { value: -2.1, isPositive: false, period: 'last month' },
      trend: 'down',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: '4',
      title: 'Avg. Order Value',
      value: '$156.78',
      change: { value: 0.5, isPositive: true, period: 'last month' },
      trend: 'stable',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
  ];

  const charts = [
    {
      id: '1',
      title: 'Revenue Trend',
      type: 'line' as const,
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: [45000, 52000, 48000, 61000, 55000, 67000],
            color: '#3B82F6',
          },
        ],
      },
    },
    {
      id: '2',
      title: 'User Growth',
      type: 'area' as const,
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'New Users',
            data: [1200, 1900, 1500, 2100, 1800, 2400],
            color: '#10B981',
          },
        ],
      },
    },
    {
      id: '3',
      title: 'Sales by Category',
      type: 'bar' as const,
      data: {
        labels: ['Electronics', 'Clothing', 'Food', 'Books', 'Toys'],
        datasets: [
          {
            label: 'Sales',
            data: [45000, 32000, 28000, 15000, 12000],
            color: '#8B5CF6',
          },
        ],
      },
    },
    {
      id: '4',
      title: 'Traffic Sources',
      type: 'pie' as const,
      data: {
        labels: ['Organic', 'Direct', 'Social', 'Email', 'Referral'],
        datasets: [
          {
            label: 'Traffic',
            data: [35, 25, 20, 12, 8],
            color: '#F59E0B',
          },
        ],
      },
    },
  ];

  const tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'product', label: 'Product', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'sales', label: 'Sales', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
  ];

  const tableRows: TableRow[] = [
    {
      id: '#001',
      product: 'Wireless Headphones',
      category: 'Electronics',
      sales: 234,
      revenue: '$35,100',
      status: (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded-full">
          Active
        </span>
      ),
    },
    {
      id: '#002',
      product: 'Smart Watch',
      category: 'Electronics',
      sales: 189,
      revenue: '$28,350',
      status: (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded-full">
          Active
        </span>
      ),
    },
    {
      id: '#003',
      product: 'Running Shoes',
      category: 'Clothing',
      sales: 456,
      revenue: '$45,600',
      status: (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded-full">
          Active
        </span>
      ),
    },
    {
      id: '#004',
      product: 'Coffee Maker',
      category: 'Food',
      sales: 123,
      revenue: '$12,300',
      status: (
        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
          Pending
        </span>
      ),
    },
    {
      id: '#005',
      product: 'Programming Book',
      category: 'Books',
      sales: 678,
      revenue: '$13,560',
      status: (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded-full">
          Active
        </span>
      ),
    },
    {
      id: '#006',
      product: 'Action Figure',
      category: 'Toys',
      sales: 345,
      revenue: '$6,900',
      status: (
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-xs rounded-full">
          Inactive
        </span>
      ),
    },
  ];

  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'north', label: 'North America' },
    { value: 'south', label: 'South America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food' },
    { value: 'books', label: 'Books' },
    { value: 'toys', label: 'Toys' },
  ];

  return (
    <AnalyticsDashboard
      kpis={kpis}
      charts={charts}
      tableData={{
        columns: tableColumns,
        rows: tableRows,
      }}
      filters={[
        {
          label: 'Region',
          options: regionOptions,
          value: selectedRegion,
          onChange: setSelectedRegion,
        },
        {
          label: 'Category',
          options: categoryOptions,
          value: selectedCategory,
          onChange: setSelectedCategory,
        },
      ]}
      dateRange={{
        start: dateRange.start,
        end: dateRange.end,
        onChange: setDateRange,
      }}
      isLoading={isLoading}
    />
  );
};

