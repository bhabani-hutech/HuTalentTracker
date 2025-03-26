import { supabase } from "../supabase";

export interface InterviewPanel {
  id: string;
  name: string;
  department_id: string;
  department_name?: string;
  members: string[];
  member_names?: string[];
  created_at?: string;
  updated_at?: string;
}

export async function getPanels() {
  const { data, error } = await supabase
    .from("interview_panels")
    .select(
      `
      id,
      name,
      department_id,
      departments(name),
      members,
      created_at,
      updated_at
    `,
    )
    .order("name");

  if (error) {
    console.error("Error fetching interview panels:", error);
    throw error;
  }

  // Transform the data to match our interface
  return data.map((panel) => ({
    id: panel.id,
    name: panel.name,
    department_id: panel.department_id,
    department_name: panel.departments?.name,
    members: panel.members || [],
    created_at: panel.created_at,
    updated_at: panel.updated_at,
  })) as InterviewPanel[];
}

export async function getPanel(id: string) {
  const { data, error } = await supabase
    .from("interview_panels")
    .select(
      `
      id,
      name,
      department_id,
      departments(name),
      members,
      created_at,
      updated_at
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching interview panel with id ${id}:`, error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    department_id: data.department_id,
    department_name: data.departments?.name,
    members: data.members || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as InterviewPanel;
}

export async function createPanel(
  panel: Omit<InterviewPanel, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("interview_panels")
    .insert({
      name: panel.name,
      department_id: panel.department_id,
      members: panel.members || [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating interview panel:", error);
    throw error;
  }

  return data as InterviewPanel;
}

export async function updatePanel(
  id: string,
  updates: Partial<InterviewPanel>,
) {
  const { data, error } = await supabase
    .from("interview_panels")
    .update({
      name: updates.name,
      department_id: updates.department_id,
      members: updates.members,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating interview panel with id ${id}:`, error);
    throw error;
  }

  return data as InterviewPanel;
}

export async function deletePanel(id: string) {
  const { error } = await supabase
    .from("interview_panels")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting interview panel with id ${id}:`, error);
    throw error;
  }

  return true;
}
