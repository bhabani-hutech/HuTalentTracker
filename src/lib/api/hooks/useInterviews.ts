import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from "../interviews";
import { Interview } from "@/types/database";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useInterviews() {
  const queryClient = useQueryClient();

  const {
    data: interviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interviews"],
    queryFn: getInterviews,
  });

  const createMutation = useMutation({
    mutationFn: createInterview,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["interviews"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Interview>;
    }) => updateInterview(id, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["interviews"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInterview,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["interviews"] }),
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("interviews-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interviews" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["interviews"] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    interviews,
    isLoading,
    error,
    createInterview: createMutation.mutate,
    updateInterview: updateMutation.mutate,
    deleteInterview: deleteMutation.mutate,
  };
}
