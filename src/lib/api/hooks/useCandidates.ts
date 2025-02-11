import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../candidates";
import { Candidate } from "@/types/database";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useCandidates() {
  const queryClient = useQueryClient();

  const {
    data: candidates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["candidates"],
    queryFn: getCandidates,
  });

  const createMutation = useMutation({
    mutationFn: createCandidate,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["candidates"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Candidate>;
    }) => updateCandidate(id, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["candidates"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["candidates"] }),
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("candidates-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["candidates"] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    candidates,
    isLoading,
    error,
    createCandidate: createMutation.mutate,
    updateCandidate: updateMutation.mutate,
    deleteCandidate: deleteMutation.mutate,
  };
}
