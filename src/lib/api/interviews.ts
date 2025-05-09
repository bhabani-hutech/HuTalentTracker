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
// export async function createInterview(
//   interview: Omit<Interview, "id" | "created_at" | "updated_at">,
// ) {
//   // Sanitize data to prevent empty string UUID errors
//   const sanitizedData = {
//     ...interview,
//     job_id: interview.job_id || null,
//     candidate_id: interview.candidate_id || null,
//     interviewer_id: interview.interviewer_id || null,
//     round_id: interview.round_id || null,
//   };

//   // --- Check for Interviewer Time Conflict ---
//   if (sanitizedData.interviewer_id && sanitizedData.date) {
//     const interviewDate = new Date(sanitizedData.date);

//     const startTime = new Date(interviewDate.getTime());
//     const endTime = new Date(interviewDate.getTime() + 60 * 60 * 1000); // +1 hour

//     const formattedStartTime = startTime.toISOString();
//     const formattedEndTime = endTime.toISOString();

//     const { data: existingInterviews, error: conflictError } = await supabase
//       .from("interviews")
//       .select("id, date")
//       .eq("interviewer_id", sanitizedData.interviewer_id)
//       .gte("date", formattedStartTime)
//       .lt("date", formattedEndTime);

//     if (conflictError) {
//       console.error("Error checking interviewer conflicts:", conflictError);
//       throw conflictError;
//     }

//     if (existingInterviews && existingInterviews.length > 0) {
//       const error = new Error(
//         "The selected interviewer is already scheduled at this time."
//       );
//       error.name = "InterviewerConflict";
//       throw error;
//     }
//   }

//   // --- Check for Duplicate Candidate Round ---
//   if (sanitizedData.candidate_id && sanitizedData.round_id) {
//     const { data: existingRounds, error: roundsError } = await supabase
//       .from("interviews")
//       .select("id")
//       .eq("candidate_id", sanitizedData.candidate_id)
//       .eq("round_id", sanitizedData.round_id);

//     if (roundsError) {
//       console.error("Error checking for duplicate rounds:", roundsError);
//       throw roundsError;
//     }

//     if (existingRounds && existingRounds.length > 0) {
//       const error = new Error(
//         "This candidate has already been scheduled for this interview round."
//       );
//       error.name = "DuplicateRound";
//       throw error;
//     }
//   }

//   // --- Create Interview ---
//   const { data, error } = await supabase
//     .from("interviews")
//     .insert([sanitizedData])
//     .select(
//       `
//       *,
//       candidate:candidates!candidate_id(id, name, job_id, stage_id),
//       interviewer:users!interviewer_id(id, name),
//       interview_round:interview_rounds(id, name)
//     `,
//     )
//     .single();

//   if (error) {
//     console.error("Error creating interview:", error);
//     throw error;
//   }

//   return data as Interview;
// }

export async function createInterview(interviewData) {
  try {
    const sanitizedData = {
      ...interviewData,
      date: new Date(interviewData.date).toISOString(), // ensure date format
    };

    console.log("🟡 Step 1: Payload to insert:", sanitizedData);

    const formattedStartTime = sanitizedData.date;
    const formattedEndTime = new Date(new Date(sanitizedData.date).getTime() + 30 * 60 * 1000).toISOString(); // +30 mins
    
    // 🔍 Panel schedule conflict check
    if (sanitizedData.type) {
      const { data: panelConflicts, error: panelError } = await supabase
        .from("interviews")
        .select("id")
        .eq("candidate_id", sanitizedData.candidate_id)
      //  .eq("interviewer_id", sanitizedData.interviewer_id)
        .eq("date", formattedStartTime)  // check if date is greater than or equal to the start time
        //.lt("date", formattedEndTime);    // check if date is less than the end time
        const { data: interviwerConflicts, error: interviwerError } = await supabase
        .from("interviews")
        .select("id")
        .eq("interviewer_id", sanitizedData.interviewer_id)
    
        .eq("date", formattedStartTime)  
    
      if (panelError) {
        console.error("❌ Panel schedule check error:", panelError);
        throw panelError;
      }
    
      // If there are any conflicts, throw an error
      if (panelConflicts && panelConflicts.length > 0) {
        const conflictError = new Error("The selected candidate is already scheduled for a round with another panel member at the same time.");
        conflictError.name = "PanelScheduleConflict";
        throw conflictError;
      }
      if (interviwerConflicts && interviwerConflicts.length > 0) {
        const conflictError = new Error("The selected interviewer is already scheduled for a round with another candidate at the same time.");
        conflictError.name = "InterviewerScheduleConflict";
        throw conflictError;
      }
    }
    

    // ✅ Insert into interviews
    const { data, error } = await supabase
      .from("interviews")
      .insert([sanitizedData])
      .select()
      .single();

    console.log("🟢 Step 2: Insert result:", { data, error });

    if (error) {
      console.error("❌ Insert failed:", error.message);
      throw error;
    }

    if (!data) {
      throw new Error("⚠️ No data returned from insert. Possibly blocked by RLS or missing required fields.");
    }

    return data;
  } catch (error) {
    console.error("🚨 Interview creation error:", error);
    throw error;
  }
}




/**
 * Update an interview by ID
 */
export async function updateInterview(
  id: string,
  updates: Partial<Omit<Interview, "id" | "created_at" | "updated_at">>
) {
  try {
    const sanitizedData = {
      ...updates,
      date: updates.date ? new Date(updates.date).toISOString() : undefined,
      job_id: updates.job_id || null,
      candidate_id: updates.candidate_id || null,
      interviewer_id: updates.interviewer_id || null,
      round_id: updates.round_id || null,
    };

    console.log("🟡 Step 1: Sanitized update data:", sanitizedData);

    const { data: currentInterview, error: fetchError } = await supabase
      .from("interviews")
      .select("interviewer_id, date, candidate_id, round_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("❌ Fetch current interview error:", fetchError);
      throw fetchError;
    }

    const dateToUse = sanitizedData.date || currentInterview.date;
    const interviewerToUse = sanitizedData.interviewer_id || currentInterview.interviewer_id;
    const candidateToUse = sanitizedData.candidate_id || currentInterview.candidate_id;
    const roundToUse = sanitizedData.round_id || currentInterview.round_id;

    // ⏰ Check for interviewer schedule conflicts (within 1-hour window)
    const startTime = new Date(dateToUse);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const { data: conflicts, error: conflictError } = await supabase
      .from("interviews")
      .select("id")
      .eq("interviewer_id", interviewerToUse)
      .gte("date", startTime.toISOString())
      .lt("date", endTime.toISOString())
      .neq("id", id);

    if (conflictError) {
      console.error("❌ Conflict check error:", conflictError);
      throw conflictError;
    }

    if (conflicts.length > 0) {
      throw new Error("The interviewer is already scheduled during this time.");
    }

    // 🔁 Check for duplicate candidate+round
    if (
      candidateToUse !== currentInterview.candidate_id ||
      roundToUse !== currentInterview.round_id
    ) {
      const { data: duplicateRounds, error: roundError } = await supabase
        .from("interviews")
        .select("id")
        .eq("candidate_id", candidateToUse)
        .eq("round_id", roundToUse)
        .neq("id", id);

      if (roundError) {
        console.error("❌ Round duplication check error:", roundError);
        throw roundError;
      }

      if (duplicateRounds.length > 0) {
        throw new Error("This candidate already has this round scheduled.");
      }
    }

    // ✅ Perform update
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
      `
      )
      .single();

    if (error) {
      console.error("❌ Update failed:", error.message);
      throw error;
    }

    console.log("🟢 Interview successfully updated:", data);
    return data as Interview;
  } catch (error) {
    console.error("🚨 Interview update error:", error);
    throw error;
  }
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
