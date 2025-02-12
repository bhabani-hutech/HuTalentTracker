import { supabase } from "../supabase";
import { User } from "@/types/database";

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
