import { supabase } from "../supabase";

export type Interview = {
  id: string;
  candidate_id?: string;
  interviewer_id?: string;
  round_id?: string;
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
    jobs?: {
      id: string;
      title: string;
    };
    stages?: {
      id: string;
      stage: string;
    };
  };
  interviewer?: {
    id: string;
    name: string;
  };
  interview_round?: {
    id: number;
    name: string;
  };
};

/**
 * Fetch all interviews with candidate, interviewer, job title, and stage
 */
export async function getInterviews() {
  try {
    const { data, error } = await supabase
      .from("interviews")
      .select(
        `
        *,
        candidate:candidates!candidate_id(
          id, name, job_id, stage_id, 
          jobs:jobs!job_id(id, title),
          stages:stages!stage_id(id, stage)
        ),
        interviewer:users!interviewer_id(id, name),
        interview_round:interview_rounds!round_id(id, name)
      `,
      )
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching interviews:", error);
      throw error;
    }

    return data as Interview[];
  } catch (error) {
    console.error("Unexpected error in getInterviews:", error);
    return [] as Interview[];
  }
}

/**
 * Create a new interview
 */
export async function createInterview(
  interview: Omit<Interview, "id" | "created_at" | "updated_at">,
) {
  // Sanitize data to prevent empty string UUID errors
  const sanitizedData = {
    ...interview,
    job_id: interview.job_id || null,
    candidate_id: interview.candidate_id || null,
    interviewer_id: interview.interviewer_id || null,
    round_id: interview.round_id || null,
  };

  const { data, error } = await supabase
    .from("interviews")
    .insert([sanitizedData])
    .select(
      `
      *,
      candidate:candidates!candidate_id(id, name, job_id, stage_id),
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
  // Sanitize data to prevent empty string UUID errors
  const sanitizedData = {
    ...updates,
    job_id: updates.job_id || null,
    candidate_id: updates.candidate_id || null,
    interviewer_id: updates.interviewer_id || null,
    round_id: updates.round_id || null,
  };

  console.log("Updating interview with sanitized data:", sanitizedData);

  const { data, error } = await supabase
    .from("interviews")
    .update(sanitizedData)
    .eq("id", id)
    .select(
      `
      *,
      candidate:candidates!candidate_id(id, name, job_id, stage_id),
      interviewer:users!interviewer_id(id, name),
      interview_round:interview_rounds(id, name)
    `,
    )
    .single();

  if (error) {
    console.error("Error updating interview:", error);
    throw error;
  }
console.log(data)
  return data as Interview;
}

/**
 * Delete an interview by ID
 */
export async function deleteInterview(id: string) {
  // console.log("Deleting interview with ID:", id);

  const { error } = await supabase.from("interviews").delete().eq("id", id);

  if (error) {
    console.error("Error deleting interview:", error);
    throw error;
  }

  return true;
}
