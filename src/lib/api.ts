import { supabase } from "../lib/supabaseClient";

export async function fetchRawData(tableName: string) {
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) throw error;
  if (!data) throw new Error("No data returned");
  return data;
}