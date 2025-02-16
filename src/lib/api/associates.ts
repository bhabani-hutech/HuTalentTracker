import { supabase } from "../supabase";
import { Associate } from "@/types/database";

export async function getAssociates() {
  const { data, error } = await supabase
    .from("associates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createAssociate(
  associate: Omit<Associate, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("users")
    .insert([associate])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAssociate(id: string, updates: Partial<Associate>) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAssociate(id: string) {
  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) throw error;
  return true;
}
