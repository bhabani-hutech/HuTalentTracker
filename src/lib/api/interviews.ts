import { supabase } from "../supabase";

export type Interview = {
  id: string;
  interviewee_name: string;
  interviewer: string;
  date_time: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  created_at?: string;
  updated_at?: string;
};

export async function getInterviews() {
  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .order("date_time", { ascending: true });

  if (error) throw error;
  return data as Interview[];
}

export async function createInterview(
  interview: Omit<Interview, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("interviews")
    .insert([interview])
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
