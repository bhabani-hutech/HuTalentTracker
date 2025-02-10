import { supabase } from "../supabase";
import { Candidate } from "@/types/database";

export async function getCandidates() {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Candidate[];
}

export async function getCandidateById(id: string) {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Candidate;
}

export async function createCandidate(
  candidateData: Omit<Candidate, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("candidates")
    .insert([candidateData])
    .select()
    .single();

  if (error) throw error;
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

  if (error) throw error;
  return data as Candidate;
}

export async function deleteCandidate(id: string) {
  const { error } = await supabase.from("candidates").delete().eq("id", id);

  if (error) throw error;
  return true;
}
