import { supabase } from "../supabase";
import { InterviewFeedback } from "@/types/database";

export async function getFeedback() {
  const { data, error } = await supabase
    .from("feedback")
    .select(
      `
      *,
      interview:interviews!interview_id(*),
      candidate:candidates!candidate_id(*),
      interviewer:users!interviewer_id(*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching feedback:", error);
    throw error;
  }

  console.log("Feedback data:", data);
  return data as InterviewFeedback[];
}

export async function getFeedbackById(id: string) {
  const { data, error } = await supabase
    .from("feedback")
    .select(
      `
      *,
      interviews (*),
      candidates (*),
      users (*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as InterviewFeedback;
}

export async function createFeedback(feedback: Omit<InterviewFeedback, "id">) {
  try {
    const { candidate, interviewer, interview, ...cleanFeedback } = feedback as any;

    console.log("Creating feedback with data:", cleanFeedback);

    // 1. Fetch the interview date & time of the candidate
    const { data: interviewData, error: interviewError } = await supabase
      .from("interviews")  // Assuming interview table is "interviews"
      .select("interview_date_time") // Adjust the field name if needed
      .eq("id", feedback.interview_id) // Assuming feedback has interviewId
      .single();

    if (interviewError) {
      console.error("Error fetching interview data:", interviewError);
      throw interviewError;
    }

    if (!interviewData) {
      throw new Error("Interview not found for the candidate.");
    }

    const interviewDateTime = new Date(interviewData.interview_date_time);
    const currentDateTime = new Date();

    // 2. Validate current time vs interview time
    if (currentDateTime < interviewDateTime) {
      throw new Error("Cannot submit feedback before the interview date & time.");
    }

    // 3. Insert feedback if validation passed
    const { data, error } = await supabase
      .from("feedback")
      .insert([cleanFeedback])
      .select()
      .single();

    if (error) {
      console.error("Error creating feedback:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createFeedback:", error);
    throw error;
  }
}


export async function deleteFeedback(id: string) {
  const { error } = await supabase.from("feedback").delete().eq("id", id);

  if (error) {
    console.error("Error deleting feedback:", error);
    throw error;
  }

  return true;
}
export async function updateFeedback({
  id,
  updates,
}: {
  id: string;
  updates: Partial<Omit<InterviewFeedback, "id" | "created_at" | "updated_at">>;
}) {
  try {
    // Filter out nested objects that aren't meant to be columns
    const { candidate, interviewer, interview, ...cleanUpdates } =
      updates as any;

    // Filter out undefined values and excluded keys
    const filteredUpdates = Object.fromEntries(
      Object.entries(cleanUpdates).filter(
        ([key, value]) => value !== undefined,
      ),
    );

    console.log("Updating feedback with ID:", id);
    console.log("Clean updates:", filteredUpdates);

    // 1. Fetch the interview_id linked to this feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback")
      .select("interview_id") // Assuming feedback table has interview_id
      .eq("id", id)
      .single();

    if (feedbackError) {
      console.error("Error fetching feedback record:", feedbackError);
      throw feedbackError;
    }

    if (!feedbackData) {
      throw new Error("Feedback not found.");
    }

    // 2. Fetch the interview date & time
    const { data: interviewData, error: interviewError } = await supabase
      .from("interviews") // Assuming table name is "interviews"
      .select("interview_date_time") // Adjust if the column name is different
      .eq("id", feedbackData.interview_id)
      .single();

    if (interviewError) {
      console.error("Error fetching interview data:", interviewError);
      throw interviewError;
    }

    if (!interviewData) {
      throw new Error("Interview not found for this feedback.");
    }

    const interviewDateTime = new Date(interviewData.interview_date_time);
    const currentDateTime = new Date();

    // 3. Validate current time vs interview time
    if (currentDateTime < interviewDateTime) {
      throw new Error("Cannot update feedback before the interview date & time.");
    }

    // 4. Perform the update
    const { data, error } = await supabase
      .from("feedback")
      .update(filteredUpdates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating feedback:", error);
      throw error;
    }

    console.log("Feedback updated successfully:", data);
    return data as InterviewFeedback;
  } catch (error) {
    console.error("Error in updateFeedback:", error);
    throw error;
  }
}

