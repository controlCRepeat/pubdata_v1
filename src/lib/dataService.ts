// dataService.ts
import { fetchRawData } from "./api";
import { ChartConfig } from "./types";

export function parseYearMonth(dateStr: string): string {
  if (typeof dateStr !== "string") return String(dateStr);
  const [year, month] = dateStr.split(" ");
  if (!month) return dateStr; // fallback
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = months.indexOf(month);
  if (monthIndex === -1) return dateStr;
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export async function fetchAndProcessData(config: ChartConfig) {
  const rawData = await fetchRawData(config.tableName);

  // Use the parseDateFn if defined, else fallback
  const parseDate = config.parseDateFn ?? ((d: string | number) => String(d));

  // Extract categories and uniqueDates
  const categories = Array.from(new Set(rawData.map((d) => String(d[config.categoryKey]))));
  const uniqueDates = Array.from(new Set(rawData.map((d) => parseDate(d[config.dateKey]))));

  // Sort dates (assumes YYYY-MM or YYYY format)
  uniqueDates.sort();

  return {
    data: rawData,
    categories,
    uniqueDates,
  };
}
