import { supabase } from "../lib/supabaseClient";

export async function fetchRawData<T>(tableName: string): Promise<T[]> {

  const { data, error } = await supabase.from(tableName).select("*");
  if (error) throw error;
  if (!data) throw new Error("No data returned");
  return data;
}