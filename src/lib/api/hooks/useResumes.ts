import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResumes, createResume, deleteResume, Resume } from "../resumes";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useResumes() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["resumes"],
    queryFn: getResumes,
  });

  const createMutation = useMutation({
    mutationFn: createResume,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resumes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resumes"] }),
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("resumes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resumes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["resumes"] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    resumes: data,
    isLoading,
    error,
    createResume: createMutation.mutate,
    deleteResume: deleteMutation.mutate,
  };
}
