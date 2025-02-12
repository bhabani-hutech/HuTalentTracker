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
