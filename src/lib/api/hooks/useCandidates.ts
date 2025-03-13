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

  const { data, isLoading, error } = useQuery({
    queryKey: ["candidates"],
    queryFn: getCandidates,
    staleTime: 30000, // Data stays fresh for 30 seconds
    cacheTime: 3600000, // Cache persists for 1 hour
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    onError: (error) => {
      console.error("Error fetching candidates:", error);
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      // Only invalidate interviews when explicitly creating a candidate
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Candidate>;
    }) => updateCandidate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("candidates-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        () => {
          // Only invalidate candidates query, not interviews on every change
          queryClient.invalidateQueries({ queryKey: ["candidates"] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    data,
    isLoading,
    error,
    createCandidate: createCandidateMutation.mutate,
    updateCandidate: updateMutation.mutate,
    deleteCandidate: deleteMutation.mutate,
  };
}
