import { supabase } from "../supabase";

export interface Department {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getDepartments() {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }

  console.log("Fetched departments from API:", data);
  return data as Department[];
}

export async function createDepartment(
  department: Omit<Department, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("departments")
    .insert(department)
    .select()
    .single();

  if (error) {
    console.error("Error creating department:", error);
    throw error;
  }

  return data as Department;
}
