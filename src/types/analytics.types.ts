export interface KPICard {
  id: string;
  title: string;
  value: string | number;
  change: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface TableRow {
  [key: string]: string | number | React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AnalyticsDashboardProps {
  kpis: KPICard[];
  charts: {
    id: string;
    title: string;
    type: 'line' | 'bar' | 'pie' | 'area';
    data: ChartData;
  }[];
  tableData: {
    columns: TableColumn[];
    rows: TableRow[];
  };
  filters?: {
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  dateRange?: {
    start: Date;
    end: Date;
    onChange: (range: DateRange) => void;
  };
  isLoading?: boolean;
}

