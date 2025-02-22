import { supabase } from "../supabase";

export interface PipelineStage {
  id: number;
  name: string;
  description: string;
  stage_order: number;
}

// Fetch pipeline stages from Supabase
export async function getPipelineStages(): Promise<PipelineStage[]> {
  const { data, error } = await supabase
    .from("stages")
    .select("id, stage, description, stage_order")
    .order("stage_order", { ascending: true });

  if (error) {
    console.error("Error fetching pipeline stages:", error);
    throw error;
  }

  return data.map((stage) => ({
    id: stage.id,
    name: stage.stage,
    description: stage.description || "",
    stage_order: stage.stage_order,
  }));
}

// Save pipeline stages to Supabase
export async function savePipelineStages(
  updatedStages: PipelineStage[],
  originalStages: PipelineStage[],
) {
  const updates = updatedStages.filter(
    (stage, index) =>
      !originalStages[index] || // New stage
      stage.name !== originalStages[index].name ||
      stage.description !== originalStages[index].description ||
      stage.stage_order !== originalStages[index].stage_order,
  );

  if (updates.length === 0) {
    console.log("No changes detected, skipping save.");
    return;
  }

  try {
    for (const update of updates) {
      const { error } = await supabase
        .from("stages")
        .update({
          stage: update.name,
          description: update.description,
          stage_order: update.stage_order,
        })
        .eq("id", update.id);

      if (error) throw error;
    }
    console.log("Pipeline stages updated successfully.");
  } catch (error) {
    console.error("Error saving pipeline stages:", error);
    throw error;
  }
}
