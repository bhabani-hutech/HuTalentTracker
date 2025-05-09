import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to handle automatic candidate movement between stages based on interview progress
 */
export function useCandidateMovement() {
  const queryClient = useQueryClient();

  // Listen for interview creation/updates to move candidates automatically
  // Using a ref to prevent multiple subscriptions
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Skip if already subscribed
    if (subscriptionRef.current) return;
    const handleInterviewChange = async (payload: any) => {
      try {
        // Get the interview details
        const { data: interview, error: interviewError } = await supabase
          .from("interviews")
          .select("id, candidate_id, round_id, interview_rounds(name)")
          .eq("id", payload.new.id)
          .single();

        if (interviewError) throw interviewError;
        if (!interview || !interview.candidate_id) return;

        // Get the candidate's current stage
        const { data: candidate, error: candidateError } = await supabase
          .from("candidates")
          .select("id, stage_id, stages(stage)")
          .eq("id", interview.candidate_id)
          .single();

        if (candidateError) throw candidateError;

        // Get all stages to determine the appropriate stage to move to
        const { data: stages, error: stagesError } = await supabase
          .from("stages")
          .select("id, stage, stage_order")
          .order("stage_order", { ascending: true });

        if (stagesError) throw stagesError;

        // Determine the appropriate stage based on the interview round
        let targetStage = null;
        const roundName = interview.interview_rounds?.[0]?.name?.toLowerCase() || "";

        if (roundName.includes("screen")) {
          // Screening round - move to Shortlisted
          targetStage = stages.find(
            (s) =>
              s.stage.toLowerCase().includes("shortlist") ||
              s.stage_order === 2, // Typically the second stage
          );
        } else if (roundName.includes("1st") || roundName.includes("first")) {
          // 1st Technical round
          targetStage = stages.find(
            (s) =>
              s.stage.toLowerCase().includes("1st technical") ||
              s.stage.toLowerCase().includes("first technical") ||
              s.stage_order === 3, // Typically the third stage
          );
        } else if (roundName.includes("2nd") || roundName.includes("second")) {
          // 2nd Technical round
          targetStage = stages.find(
            (s) =>
              s.stage.toLowerCase().includes("2nd technical") ||
              s.stage.toLowerCase().includes("second technical") ||
              s.stage_order === 4, // Typically the fourth stage
          );
        } else if (roundName.includes("final") || roundName.includes("hr")) {
          // Final or HR round
          targetStage = stages.find(
            (s) =>
              s.stage.toLowerCase().includes("final") ||
              s.stage.toLowerCase().includes("hr") ||
              s.stage_order === 5, // Typically the fifth stage
          );
        }

        // If we found a target stage and it's different from the current stage
        if (targetStage && targetStage.id !== candidate.stage_id) {
          // Generate a move comment
          const moveReason = `Automatically moved to ${targetStage.stage} after ${interview.interview_rounds?.[0]?.name || "an interview round"} was scheduled.`;

          // Update the candidate's stage
          const { error: updateError } = await supabase
            .from("candidates")
            .update({
              stage_id: targetStage.id,
              move_reason: moveReason,
              updated_at: new Date().toISOString(),
            })
            .eq("id", candidate.id);

          if (updateError) throw updateError;

          // Add a comment to the pipeline_comments table
          await supabase.from("pipeline_comments").insert({
            item_id: candidate.id,
            item_type: "candidate",
            comment: moveReason,
            created_at: new Date().toISOString(),
          });

          // Invalidate queries to refresh UI
          queryClient.invalidateQueries({ queryKey: ["candidates"] });
          queryClient.invalidateQueries({ queryKey: ["interviews"] });
        }
      } catch (error) {
        console.error("Error in automatic candidate movement:", error);
      }
    };

    // Subscribe to interview changes
    const interviewSubscription = supabase
      .channel("interview-changes-for-movement")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "interviews" },
        handleInterviewChange,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "interviews" },
        handleInterviewChange,
      )
      .subscribe();

    // Also handle resume uploads (move to screening)
    const handleCandidateCreate = async (payload: any) => {
      try {
        // Only proceed if this is a new candidate (resume upload)
        if (!payload.new || !payload.new.id) return;

        // Get the screening stage
        const { data: stages, error: stagesError } = await supabase
          .from("stages")
          .select("id, stage, stage_order")
          .order("stage_order", { ascending: true });

        if (stagesError) throw stagesError;

        // Find the screening stage (usually the first stage)
        const screeningStage = stages.find(
          (s) =>
            s.stage.toLowerCase().includes("screen") || s.stage_order === 1, // First stage
        );

        if (!screeningStage) return;

        // If the candidate doesn't already have a stage_id, set it to screening
        if (!payload.new.stage_id) {
          const moveReason = `Automatically moved to ${screeningStage.stage} after resume upload.`;

          // Update the candidate's stage
          const { error: updateError } = await supabase
            .from("candidates")
            .update({
              stage_id: screeningStage.id,
              move_reason: moveReason,
              updated_at: new Date().toISOString(),
            })
            .eq("id", payload.new.id);

          if (updateError) throw updateError;

          // Add a comment to the pipeline_comments table
          await supabase.from("pipeline_comments").insert({
            item_id: payload.new.id,
            item_type: "candidate",
            comment: moveReason,
            created_at: new Date().toISOString(),
          });

          // Invalidate queries to refresh UI
          queryClient.invalidateQueries({ queryKey: ["candidates"] });
        }
      } catch (error) {
        console.error(
          "Error in automatic candidate movement after creation:",
          error,
        );
      }
    };

    // Subscribe to candidate creation
    const candidateSubscription = supabase
      .channel("candidate-changes-for-movement")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "candidates" },
        handleCandidateCreate,
      )
      .subscribe();

    // Store subscription references
    subscriptionRef.current = {
      interviewSubscription,
      candidateSubscription,
    };

    // Cleanup subscriptions on unmount
    return () => {
      if (subscriptionRef.current) {
        interviewSubscription.unsubscribe();
        candidateSubscription.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [queryClient]);

  return null; // This hook doesn't return anything, it just sets up the listeners
}
