import { supabase } from "../supabase";
import { User } from "@/types/database";

export async function createUser(
  associate: Omit<User, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("users")
    .insert([associate])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInterviewers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("role", ["Interviewer", "HR", "Hiring Manager", "Admin"]) // Include all roles that can interview
    .order("name");

  if (error) {
    console.error("Error fetching interviewers:", error);
    throw error;
  }

  if (!Array.isArray(data)) {
    console.error("Expected array of interviewers, got:", data);
    return [];
  }
  console.log("Interviewers:", data);
  return data as User[];
}

export async function deleteUser(id: string) {
  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) throw error;
  return true;
}

export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
export async function updateUser(id: string, updates: Partial<Associate>) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
