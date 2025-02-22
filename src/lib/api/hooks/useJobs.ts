import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, createJob, updateJob, deleteJob } from "../jobs";
import { Job } from "@/types/database";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useJobs() {
  const queryClient = useQueryClient();

  const {
    data: jobs,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
    onSuccess: (data) => {
      console.log("Job data in hook:", data);
    },
    onError: (error) => {
      console.error("Error in job hook:", error);
    },
  });

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    onError: (error) => {
      console.error("Error creating job:", error);
      // Handle error (e.g., show a toast)
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Job> }) =>
      updateJob(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    onError: (error) => {
      console.error("Error updating job:", error);
      // Handle error (e.g., show a toast)
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    onError: (error) => {
      console.error("Error deleting job:", error);
      // Handle error (e.g., show a toast)
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("jobs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    jobs,
    isLoading,
    queryError,
    createJob: createMutation.mutate,
    createJobIsLoading: createMutation.isLoading,
    createJobError: createMutation.error,
    updateJob: updateMutation.mutate,
    updateJobIsLoading: updateMutation.isLoading,
    updateJobError: updateMutation.error,
    deleteJob: deleteMutation.mutate,
    deleteJobIsLoading: deleteMutation.isLoading,
    deleteJobError: deleteMutation.error,
  };
}
