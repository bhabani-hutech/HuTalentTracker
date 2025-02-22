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
    job_id?: string;
    stage_id?: string;
    job?: {
      id: string;
      title: string;
    };
    stage?: {
      id: string;
      stage: string;
    };
  };
  interviewer?: {
    id: string;
    name: string;
  };
};

/**
 * Fetch all interviews with candidate, interviewer, job title, and stage
 */
export async function getInterviews() {
  console.log("1. IN INTERVIEW getInterviews");

  const { data, error } = await supabase
    .from("interviews")
    .select(
      `
      *,
      candidate:candidates!candidate_id(
        id, name, job_id, stage_id,
        job:jobs!job_id(id, title),
        stage:stages!stage_id(id, stage)
      ),
      interviewer:users!interviewer_id(id, name)
    `,
    )
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching interviews:", error);
    throw error;
  }

  console.log("3. IN INTERVIEW getInterviews", data);
  return data as Interview[];
}

/**
 * Create a new interview
 */
export async function createInterview(
  interview: Omit<Interview, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("interviews")
    .insert([interview])
    .select(
      `
      *,
      candidate:candidates!candidate_id(
        id, name, job_id, stage_id,
        job:jobs!job_id(id, title),
        stage:stages!stage_id(id, stage)
      ),
      interviewer:users!interviewer_id(id, name)
    `,
    )
    .single();

  if (error) {
    console.error("Error creating interview:", error);
    throw error;
  }

  return data as Interview;
}

/**
 * Update an interview by ID
 */
export async function updateInterview(
  id: string,
  updates: Partial<Omit<Interview, "id" | "created_at" | "updated_at">>,
) {
  console.log("IN INTERVIEW updateInterview");
  console.log("Updating interview with ID:", id, "with updates:", updates);

  const { data, error } = await supabase
    .from("interviews")
    .update(updates)
    .eq("id", id)
    .select(
      `
      *,
      candidate:candidates!candidate_id(
        id, name, job_id, stage_id,
        job:jobs!job_id(id, title),
        stage:stages!stage_id(id, stage)
      ),
      interviewer:users!interviewer_id(id, name)
    `,
    )
    .single();

  if (error) {
    console.error("Error updating interview:", error);
    throw error;
  }

  return data as Interview;
}

/**
 * Delete an interview by ID
 */
export async function deleteInterview(id: string) {
  const { error } = await supabase.from("interviews").delete().eq("id", id);

  if (error) {
    console.error("Error deleting interview:", error);
    throw error;
  }

  return true;
}
