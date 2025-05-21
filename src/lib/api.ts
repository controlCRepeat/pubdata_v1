// lib/api.ts
import { supabase } from "../lib/supabaseClient";

export async function fetchAndProcessData(tableName: string) {
  const { data, error } = await supabase.from(tableName).select("*");

  if (error) throw error;

  // Extract unique categories
  const categories = Array.from(new Set(data.map((item: any) => item.Category)));

  // Extract unique dates and sort them properly
  const uniqueDates = Array.from(new Set(data.map((item: any) => item.Date))).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return { data, categories, uniqueDates };
}
