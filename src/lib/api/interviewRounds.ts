import { supabase } from "../supabase";
import { useQuery } from "@tanstack/react-query";

export interface InterviewRound {
  id: number;
  name: string;
  description: string;
  round_order: number;
  duration: number;
}

// Fetch pipeline rounds from Supabase using react-query
export function useInterviewRounds() {
  return useQuery({
    queryKey: ["interviewRounds"],
    queryFn: async () => {
      console.log("Fetching interview rounds...");
      const { data, error } = await supabase
        .from("interview_rounds")
        .select("id, name, description, duration, round_order")
        .order("round_order", { ascending: true });

      if (error) {
        console.error("Error fetching interview rounds:", error);
        throw error;
      }

      console.log("1 Interview rounds data:", data);

      return data.map((apiRound) => ({
        id: apiRound.id,
        name: apiRound.name,
        description: apiRound.description || "",
        round_order: apiRound.round_order,
        duration: apiRound.duration,
      })) as InterviewRound[];
    },
    // onSuccess: (data) => {
    //   console.log("Interview rounds fetched successfully:", data);
    // },
    // onError: (error) => {
    //   console.error("Error in interviewRounds query:", error);
    // },
  });
}

// Save pipeline rounds to Supabase
export async function saveInterviewRound(
  updatedRounds: InterviewRound[],
  originalRounds: InterviewRound[],
) {
  const updates = updatedRounds.filter((round, index) => {
    const originalRound = originalRounds[index];

    if (!originalRound) {
      return true; // New round
    }

    return (
      round.name !== originalRound.name ||
      round.description !== originalRound.description ||
      round.duration !== originalRound.duration ||
      round.round_order !== originalRound.round_order
    );
  });

  if (updates.length === 0) {
    console.log("No changes detected, skipping save.");
    return;
  }

  try {
    for (const update of updates) {
      const { error } = await supabase.from("interview_rounds").upsert({
        id: update.id,
        name: update.name,
        description: update.description,
        duration: update.duration,
        round_order: update.round_order,
      });

      if (error) {
        console.error("Error updating interview round:", error);
        throw error;
      }
    }
    console.log("Interview rounds updated successfully.");
  } catch (error) {
    console.error("Error saving interview rounds:", error);
    throw error;
  }
}
