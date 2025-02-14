import { supabase } from "../supabase";

export type Interview = {
  id: string;
  candidate_id?: string;
  interviewer_id?: string;
  date: string;
  type: string;
  status:
    | "Rejected in screening"
    | "Rejected -1"
    | "Rejected in -2"
    | "HR round"
    | "Cleared"
    | "Offered";
  feedback?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
  candidate?: {
    id: string;
    name: string;
    position: string;
  };
  interviewer?: {
    id: string;
    name: string;
  };
};

export async function getInterviews() {
  const { data, error } = await supabase
    .from("interviews")
    .select(
      `
      *,
      candidate:candidates!candidate_id(id, name, position, email),
      interviewer:users!interviewer_id(id, name, email)
    `,
    )
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching interviews:", error);
    throw error;
  }

  return data as Interview[];
}

export async function createInterview(
  interview: Omit<Interview, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("interviews")
    .insert([interview])
    .select(
      `
      *,
      candidate:candidate_id(id, name, position),
      interviewer:interviewer_id(id, name)
    `,
    )
    .single();

  if (error) {
    console.error("Error creating interview:", error);
    throw error;
  }

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
    .select(
      `
      *,
      candidate:candidate_id(id, name, position),
      interviewer:interviewer_id(id, name)
    `,
    )
    .single();

  if (error) {
    console.error("Error updating interview:", error);
    throw error;
  }

  return data as Interview;
}

export async function deleteInterview(id: string) {
  const { error } = await supabase.from("interviews").delete().eq("id", id);

  if (error) {
    console.error("Error deleting interview:", error);
    throw error;
  }

  return true;
}
