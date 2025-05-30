export interface ChartConfig {
    id: string;
    name: string;
    tableName: string;
    categoryKey: string;
    dateKey: string;
    valueKey: string;
    sourceUrl: string;
    sourceLabel: string;
    parseDateFn?: (date: string | number) => string;
    colorGroup?: string; 
    group?: string;
  }
  
  export interface ChartDataset {
    [key: string]: string | number;
  }
  