import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from "../feedback";
import { InterviewFeedback } from "@/types/database";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useFeedback() {
  const queryClient = useQueryClient();

  const {
    data: feedback,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feedback"],
    queryFn: getFeedback,
    staleTime: 60000, // Data stays fresh for 60 seconds
    cacheTime: 3600000, // Cache persists for 1 hour
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("Error in feedback hook:", error);
    },
  });

  const createMutation = useMutation({
    mutationFn: createFeedback,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedback"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedback"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<InterviewFeedback>;
    }) => {
      // Remove any undefined or null values to prevent database errors
      const cleanUpdates = Object.entries(updates).reduce(
        (acc, [key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            // Filter out nested objects that aren't meant to be columns
            !["candidate", "interviewer", "interview"].includes(key)
          ) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      // Removed console logs to reduce unnecessary operations

      const { data, error } = await supabase
        .from("feedback")
        .update(cleanUpdates)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating feedback:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (error) => {
      console.error("Error in update mutation:", error);
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("feedback-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedback" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["feedback"] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    feedback,
    isLoading,
    error,
    createFeedback: createMutation.mutate,
    updateFeedback: updateMutation.mutate,
    deleteFeedback: deleteMutation.mutate,
  };
}
