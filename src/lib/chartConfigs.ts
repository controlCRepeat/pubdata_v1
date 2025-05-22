// chartConfigs.ts
import { ChartConfig } from "./types"
import { parseYearMonth } from "./dataService"

export const chartConfigs: ChartConfig[] = [
    {
      id: "inflation",
      name: "Inflation Over Time",
      tableName: "inflation_data",
      categoryKey: "Category",
      dateKey: "Date",
      valueKey: "Value",
      parseDateFn: (d) => String(d), // dates are ISO strings, no parsing needed
    },
    {
      id: "population",
      name: "Population Over Time",
      tableName: "population_data",
      categoryKey: "Category",
      dateKey: "Date",
      valueKey: "Value",
      parseDateFn: (d) => parseYearMonth(String(d)), // ensure string input
    },
  ];
  