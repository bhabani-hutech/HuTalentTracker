import { supabase } from "../supabase";

export type Interview = {
  id: string;
  candidate_id?: string;
  interviewer_id?: string;
  round_id?: string;
  job_id?: string; // Added job_id property
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
    position?: string; // Added position property
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

  // --- Check for Interviewer Time Conflict ---
  if (sanitizedData.interviewer_id && sanitizedData.date) {
    const interviewDate = new Date(sanitizedData.date);

    const startTime = new Date(interviewDate.getTime());
    const endTime = new Date(interviewDate.getTime() + 60 * 60 * 1000); // +1 hour

    const formattedStartTime = startTime.toISOString();
    const formattedEndTime = endTime.toISOString();

    const { data: existingInterviews, error: conflictError } = await supabase
      .from("interviews")
      .select("id, date")
      .eq("interviewer_id", sanitizedData.interviewer_id)
      .gte("date", formattedStartTime)
      .lt("date", formattedEndTime);

    if (conflictError) {
      console.error("Error checking interviewer conflicts:", conflictError);
      throw conflictError;
    }

    if (existingInterviews && existingInterviews.length > 0) {
      const error = new Error(
        "The selected interviewer is already scheduled at this time."
      );
      error.name = "InterviewerConflict";
      throw error;
    }
  }

  // --- Check for Duplicate Candidate Round ---
  if (sanitizedData.candidate_id && sanitizedData.round_id) {
    const { data: existingRounds, error: roundsError } = await supabase
      .from("interviews")
      .select("id")
      .eq("candidate_id", sanitizedData.candidate_id)
      .eq("round_id", sanitizedData.round_id);

    if (roundsError) {
      console.error("Error checking for duplicate rounds:", roundsError);
      throw roundsError;
    }

    if (existingRounds && existingRounds.length > 0) {
      const error = new Error(
        "This candidate has already been scheduled for this interview round."
      );
      error.name = "DuplicateRound";
      throw error;
    }
  }

  // --- Create Interview ---
  const { data, error } = await supabase
    .from("interviews")
    .insert([sanitizedData])
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

  // Check for interviewer time conflicts if interviewer_id and date are being updated
  if (
    (sanitizedData.interviewer_id || sanitizedData.date) &&
    (sanitizedData.interviewer_id || sanitizedData.date)
  ) {
    // Get the current interview data to determine if interviewer or date is changing
    const { data: currentInterview, error: fetchError } = await supabase
      .from("interviews")
      .select("interviewer_id, date")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching current interview:", fetchError);
      throw fetchError;
    }

    const interviewerChanged =
      sanitizedData.interviewer_id &&
      sanitizedData.interviewer_id !== currentInterview.interviewer_id;
    const dateChanged =
      sanitizedData.date && sanitizedData.date !== currentInterview.date;

    // Only check for conflicts if interviewer or date is changing
    if (interviewerChanged || dateChanged) {
      const interviewDate = new Date(
        sanitizedData.date || currentInterview.date,
      );
      const interviewerId =
        sanitizedData.interviewer_id || currentInterview.interviewer_id;

      // Create a time window of 1 hour (typical interview duration)
      const startTime = new Date(interviewDate.getTime());
      const endTime = new Date(interviewDate.getTime() + 60 * 60 * 1000); // Add 1 hour

      // Format dates for comparison
      const formattedStartTime = startTime.toISOString();
      const formattedEndTime = endTime.toISOString();

      // Check for existing interviews for this interviewer in the same time slot
      const { data: existingInterviews, error: conflictError } = await supabase
        .from("interviews")
        .select("id, date")
        .eq("interviewer_id", interviewerId)
        .gte("date", formattedStartTime)
        .lt("date", formattedEndTime)
        .neq("id", id); // Exclude the current interview

      if (conflictError) {
        console.error(
          "Error checking for interviewer conflicts:",
          conflictError,
        );
        throw conflictError;
      }

      if (existingInterviews && existingInterviews.length > 0) {
        const error = new Error(
          "The selected interviewer is already scheduled at this time.",
        );
        error.name = "InterviewerConflict";
        throw error;
      }
    }

    // Check for duplicate rounds if candidate_id or round_id is changing
    if (
      (sanitizedData.candidate_id || sanitizedData.round_id) &&
      sanitizedData.round_id
    ) {
      const { data: currentData, error: currentError } = await supabase
        .from("interviews")
        .select("candidate_id, round_id")
        .eq("id", id)
        .single();

      if (currentError) {
        console.error("Error fetching current interview data:", currentError);
        throw currentError;
      }

      const candidateId =
        sanitizedData.candidate_id || currentData.candidate_id;
      const roundId = sanitizedData.round_id;

      if (
        roundId !== currentData.round_id ||
        sanitizedData.candidate_id !== currentData.candidate_id
      ) {
        const { data: existingRounds, error: roundsError } = await supabase
          .from("interviews")
          .select("id, round_id")
          .eq("candidate_id", candidateId)
          .eq("round_id", roundId)
          .neq("id", id); // Exclude the current interview

        if (roundsError) {
          console.error("Error checking for duplicate rounds:", roundsError);
          throw roundsError;
        }

        if (existingRounds && existingRounds.length > 0) {
          const error = new Error(
            "This candidate has already been scheduled for this interview round.",
          );
          error.name = "DuplicateRound";
          throw error;
        }
      }
    }
  }

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
  console.log(data);
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
