// dataService.ts
import { fetchRawData } from "./api";
import { ChartConfig, DataRow } from "./types";

export function parseYearMonth(dateStr: string): string {
  if (typeof dateStr !== "string") return String(dateStr);
  const [year, month] = dateStr.split(" ");
  if (!month) return dateStr;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = months.indexOf(month);
  if (monthIndex === -1) return dateStr;

  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export async function fetchAndProcessData<T extends DataRow>(config: ChartConfig<T>) {
  const rawData = await fetchRawData<T>(config.tableName);

  const parseDate = config.parseDateFn ?? ((d: unknown) => String(d));

  const filteredData = config.filterFn ? rawData.filter(config.filterFn) : rawData;

  const categories = Array.from(
    new Set(filteredData.map((d) => String(d[config.categoryKey])))
  );

  const uniqueDates = Array.from(
    new Set(filteredData.map((d) => parseDate(d[config.dateKey])))
  ).sort();

  return {
    data: filteredData,
    categories,
    uniqueDates,
  };
}
