export interface ChartConfig {
    id: string;
    name: string;
    tableName: string;
    categoryKey: string;
    dateKey: string;
    valueKey: string;
    parseDateFn?: (date: string | number) => string;
  }
  
  export interface ChartDataset {
    [key: string]: string | number;
  }
  