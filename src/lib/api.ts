import { supabase } from "../lib/supabaseClient";

export async function fetchAndProcessData(tableName: string) {
  // Tell Supabase the expected return type
  const { data, error } = await supabase
    .from(tableName)
    .select("*");

  if (error) throw error;
  if (!data) throw new Error("No data returned");

  // `data` is now InflationData[]
  const categories = Array.from(new Set(data.map((item) => item.Category)));

  const uniqueDates = Array.from(new Set(data.map((item) => item.Date))).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return { data, categories, uniqueDates };
}