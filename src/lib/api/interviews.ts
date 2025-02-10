import { supabase } from "../supabase";
import { Interview } from "@/types/database";

export async function getInterviews() {
  const { data, error } = await supabase
    .from("interviews")
    .select(
      `
      *,
      candidates (*),
      users (*)
    `,
    )
    .order("date", { ascending: true });

  if (error) throw error;
  return data as Interview[];
}

export async function getInterviewById(id: string) {
  const { data, error } = await supabase
    .from("interviews")
    .select(
      `
      *,
      candidates (*),
      users (*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Interview;
}

export async function createInterview(
  interviewData: Omit<Interview, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("interviews")
    .insert([interviewData])
    .select()
    .single();

  if (error) throw error;
  return data as Interview;
}

export async function updateInterview(
  id: string,
  updates: Partial<Omit<Interview, "id" | "created_at" | "updated_at">>,
) {
  const { data, error } = await supabase
    .from("interviews")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Interview;
}

export async function deleteInterview(id: string) {
  const { error } = await supabase.from("interviews").delete().eq("id", id);

  if (error) throw error;
  return true;
}
