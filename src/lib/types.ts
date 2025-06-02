export interface DataRow {
  [key: string]: string | number | null;
}

export interface ChartConfig<T extends DataRow = DataRow> {
  id: string;
  name: string;
  tableName: string;
  categoryKey: keyof T;
  dateKey: keyof T;
  valueKey: keyof T;
  sourceUrl: string;
  sourceLabel?: string;
  parseDateFn?: (d: T[keyof T]) => string;
  group?: string;
  filterFn?: (row: T) => boolean;
}
  
export interface ChartDataset {
  [key: string]: string | number;
}
 