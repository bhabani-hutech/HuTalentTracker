import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeedback, createFeedback, updateFeedback } from "../feedback";
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
    onSuccess: (data) => {
      console.log("Feedback data in hook:", data);
    },
    onError: (error) => {
      console.error("Error in feedback hook:", error);
    },
  });

  const createMutation = useMutation({
    mutationFn: createFeedback,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedback"] }),
  });

  const updateMutation = useMutation({
    mutationFn: updateFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      window.location.reload();
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
  };
}
