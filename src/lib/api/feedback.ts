import { supabase } from "../supabase";
import { Feedback } from "@/types/database";

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
  return data as Feedback[];
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
  return data as Feedback;
}

export async function createFeedback(
  feedbackData: Omit<Feedback, "id" | "created_at" | "updated_at">,
) {
  console.log("Creating feedback with data:", feedbackData);
  console.log("Creating feedback with data:", feedbackData);
  const { data, error } = await supabase
    .from("feedback")
    .insert([
      {
        interview_id: feedbackData.interview_id,
        candidate_id: feedbackData.candidate_id,
        interviewer_id: feedbackData.interviewer_id,
        technical_skills: feedbackData.technical_skills,
        communication_skills: feedbackData.communication_skills,
        problem_solving: feedbackData.problem_solving,
        experience_fit: feedbackData.experience_fit,
        cultural_fit: feedbackData.cultural_fit,
        strengths: feedbackData.strengths,
        improvements: feedbackData.improvements,
        recommendation: feedbackData.recommendation,
        comments: feedbackData.comments,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Feedback;
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
  updates: Partial<Omit<Feedback, "id" | "created_at" | "updated_at">>;
}) {
  const candidate = updates.candidate;
  const interviewer = updates.interviewer;
  const interview = updates.interview;
  updates.candidate = undefined;
  updates.interviewer = undefined;
  updates.interview = undefined;

  // Filter out undefined values and excluded keys
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(
      ([key, value]) =>
        value !== undefined &&
        !["candidate_id", "interview_id", "interviewer_id"].includes(key),
    ),
  );

  // Check if feedback exists
  const { data: existingFeedback, error: fetchError } = await supabase
    .from("feedback")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Feedback not found:", fetchError);
    throw fetchError;
  }

  // Perform the update
  const { data, error } = await supabase
    .from("feedback")
    .update(filteredUpdates)
    .eq("id", id)
    .select("*")
    .single();

  data.candidate = candidate;
  data.interview = interview;
  data.interviewer = interviewer;

  if (error) {
    console.error("Error updating feedback:", error);
    throw error;
  }

  console.log("Feedback updated successfully:", data);
  return data as Feedback;
}
