// chartConfigs.ts
import { ChartConfig } from "./types"
import { parseYearMonth } from "./dataService"

// chartConfigs.ts
export const chartConfigs: ChartConfig[] = [
  {
    id: "marriages",
    name: "Marriages Over Time",
    tableName: "marriages",
    categoryKey: "Category",
    dateKey: "Date",
    valueKey: "Value",
    sourceUrl: "https://tablebuilder.singstat.gov.sg/table/TS/M830101",
    sourceLabel: "Department of Statistics Singapore - Marriages",
    parseDateFn: (d) => parseYearMonth(String(d)),
    group: "family", // shared group
  },
  {
    id: "divorces",
    name: "Divorces Over Time",
    tableName: "divorces",
    categoryKey: "Category",
    dateKey: "Date",
    valueKey: "Value",
    sourceUrl: "https://tablebuilder.singstat.gov.sg/table/TS/M830201",
    sourceLabel: "Department of Statistics Singapore - Divorces",
    parseDateFn: (d) => parseYearMonth(String(d)),
    group: "family", // same group as marriages
  },
  {
    id: "households",
    name: "Number of Households Over Time",
    tableName: "num_households",
    categoryKey: "Category",
    dateKey: "Date",
    valueKey: "Value",
    sourceUrl: "https://tablebuilder.singstat.gov.sg/table/TS/M810371",
    sourceLabel: "Department of Statistics Singapore - Households",
    parseDateFn: (d) => parseYearMonth(String(d)),
    group: "housing", // different group
  },
]
