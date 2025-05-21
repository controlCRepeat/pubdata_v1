import { supabase } from "./supabaseClient";

function parseYearMonth(dateStr: string) {
  const [year, monthStr] = dateStr.split(" ");
  const monthMap: Record<string, number> = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };
  return parseInt(year) * 100 + (monthMap[monthStr] || 0);
}

export async function fetchAndProcessData(tableName: string) {
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) throw error;
  
  // Extract unique categories and dates
  const categories = Array.from(new Set(data.map((d: any) => d.Category)));

  const uniqueDates = Array.from(new Set(data.map((d: any) => d.Date))).sort(
    (a, b) => parseYearMonth(a) - parseYearMonth(b)
  );

  return { data, categories, uniqueDates };
}