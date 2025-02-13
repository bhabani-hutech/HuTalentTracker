import { supabase } from "../supabase";
import { Candidate } from "@/types/database";

export async function getCandidates() {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }

  return data as Candidate[];
}

export async function createCandidate(
  candidate: Omit<Candidate, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("candidates")
    .insert([candidate])
    .select()
    .single();

  if (error) {
    console.error("Error creating candidate:", error);
    throw error;
  }

  return data as Candidate;
}

export async function updateCandidate(
  id: string,
  updates: Partial<Omit<Candidate, "id" | "created_at" | "updated_at">>,
) {
  const { data, error } = await supabase
    .from("candidates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating candidate:", error);
    throw error;
  }

  return data as Candidate;
}

export async function deleteCandidate(id: string) {
  const { error } = await supabase.from("candidates").delete().eq("id", id);

  if (error) {
    console.error("Error deleting candidate:", error);
    throw error;
  }

  return true;
}
