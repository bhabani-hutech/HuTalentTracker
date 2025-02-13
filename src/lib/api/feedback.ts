import { supabase } from "../supabase";
import { Feedback } from "@/types/database";

export async function getFeedback() {
  const { data, error } = await supabase
    .from("feedback")
    .select(
      `
      *,
      interview:interview_id(id, date),
      candidate:candidate_id(id, name, position),
      interviewer:interviewer_id(id, name)
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
  const { data, error } = await supabase
    .from("feedback")
    .insert([feedbackData])
    .select(
      `
      *,
      interview:interview_id(id, date),
      candidate:candidate_id(id, name, position),
      interviewer:interviewer_id(id, name)
    `,
    )
    .single();

  if (error) throw error;
  return data as Feedback;
}

export async function updateFeedback({
  id,
  updates,
}: {
  id: string;
  updates: Partial<Omit<Feedback, "id" | "created_at" | "updated_at">>;
}) {
  // Filter out undefined values
  const filteredUpdates: Record<string, unknown> = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined),
  );

  // Check if feedback exists
  const { data: existingFeedback, error: fetchError } = await supabase
    .from("feedback")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existingFeedback) {
    console.error("Feedback not found or error fetching it:", fetchError);
    throw new Error("Feedback not found.");
  }

  // Perform the update
  const { data, error } = await supabase
    .from("feedback")
    .update(filteredUpdates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating feedback:", error);
    throw new Error("Failed to update feedback.");
  }

  console.log("Feedback updated successfully:", data);
  return data as Feedback;
}
