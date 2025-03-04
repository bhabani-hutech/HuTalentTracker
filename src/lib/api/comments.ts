import { supabase } from "../supabase";

export interface Comment {
  id?: string;
  item_id: string;
  item_type: "interview" | "candidate";
  comment: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch comments for a specific item
export async function getComments(itemId: string) {
  try {
    const { data, error } = await supabase
      .from("pipeline_comments")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

// Create a new comment
export async function createComment(
  comment: Omit<Comment, "id" | "created_at" | "updated_at">,
) {
  try {
    const { data, error } = await supabase
      .from("pipeline_comments")
      .insert([comment])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

// Update an existing comment
export async function updateComment(id: string, updates: { comment: string }) {
  try {
    const { data, error } = await supabase
      .from("pipeline_comments")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
}

// Delete a comment
export async function deleteComment(id: string) {
  try {
    const { error } = await supabase
      .from("pipeline_comments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}
