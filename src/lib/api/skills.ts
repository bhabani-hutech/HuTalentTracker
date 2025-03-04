import { supabase } from "../supabase";

export interface Skill {
  id?: number;
  name: string;
  category?: string;
  skill_type: "domain" | "technical" | "soft";
  skill_order?: number;
}

// Fetch all skills or filter by type
export async function getSkills(type?: "domain" | "technical" | "soft") {
  try {
    let query = supabase.from("skills").select("*");

    if (type) {
      query = query.eq("skill_type", type);
    }

    const { data, error } = await query.order("skill_order", {
      ascending: true,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
}

// Create a new skill
export async function createSkill(skill: Omit<Skill, "id">) {
  try {
    const { data, error } = await supabase
      .from("skills")
      .insert([skill])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creating skill:", error);
    throw error;
  }
}

// Update an existing skill
export async function updateSkill(id: number, updates: Partial<Skill>) {
  try {
    const { data, error } = await supabase
      .from("skills")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating skill:", error);
    throw error;
  }
}

// Delete a skill
export async function deleteSkill(id: number) {
  try {
    const { error } = await supabase.from("skills").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
}
