import { supabase } from "../supabase";

export interface InterviewPanel {
  id: string;
  name: string;
  department_id: number; // Changed from string to number to match the database schema
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
  return data.map((panel) => {
    console.log("Panel data from DB:", panel);
    return {
      id: panel.id,
      name: panel.name,
      department_id: panel.department_id,
      department_name:  panel.departments?.[0]?.name,
      members: panel.members || [],
      created_at: panel.created_at,
      updated_at: panel.updated_at,
    };
  }) as InterviewPanel[];
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
    department_name:  data.departments?.[0]?.name,
    members: data.members || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as InterviewPanel;
}

export async function createPanel(
  panel: Omit<InterviewPanel, "id" | "created_at" | "updated_at">,
) {
  // Ensure department_id is a valid number or null
  let department_id = null;
  if (panel.department_id !== undefined && panel.department_id !== null) {
    if (typeof panel.department_id === "number") {
      // If it's already a number, use it directly
      department_id = panel.department_id;
    } else if (typeof panel.department_id === "string") {
      // Skip strings that start with org-dept-
      if (typeof panel.department_id === "string" && !(panel.department_id as string).startsWith("org-dept-")) {
        // Try to parse the string as a number
        const parsed = parseInt(panel.department_id, 10);
        if (!isNaN(parsed)) {
          department_id = parsed;
        }
      }
    }
  }

  console.log("Final department_id being sent to database:", department_id);

  // Ensure members is an array, not undefined
  const members = Array.isArray(panel.members) ? panel.members : [];

  const { data, error } = await supabase
    .from("interview_panels")
    .insert({
      name: panel.name,
      department_id: department_id,
      members: members,
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
  // Create an update object with only the fields that are provided
  const updateData: any = {};

  if (updates.name !== undefined) updateData.name = updates.name;

  // Handle department_id specifically to ensure it's a valid number or null
  if (updates.department_id !== undefined) {
    let department_id = null;

    if (updates.department_id !== null) {
      if (typeof updates.department_id === "number") {
        // If it's already a number, use it directly
        department_id = updates.department_id;
      } else if (typeof updates.department_id === "string") {
        // Skip strings that start with org-dept-
        if (typeof updates.department_id === "string" && !(updates.department_id as string).startsWith("org-dept-")) {
          // Try to parse the string as a number
          const parsed = parseInt(updates.department_id, 10);
          if (!isNaN(parsed)) {
            department_id = parsed;
          }
        }
      }
    }

    updateData.department_id = department_id;
    console.log(
      "Final department_id being sent to database for update:",
      department_id,
    );
  }

  if (updates.members !== undefined) updateData.members = updates.members;

  // Always update the updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("interview_panels")
    .update(updateData)
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
