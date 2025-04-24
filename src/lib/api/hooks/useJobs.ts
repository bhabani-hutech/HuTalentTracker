import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, createJob, updateJob, deleteJob } from "../jobs";
import { Job } from "@/types/database";
import { useEffect, useRef } from "react";
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
    staleTime: 300000, // Data stays fresh for 5 minutes
    cacheTime: 3600000, // Cache persists for 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    onError: (error) => {
      console.error("Error in job hook:", error);
    },
  });

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    onError: (error) => {
      console.error("Error creating job:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Job> }) =>
      updateJob(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      console.error("Error updating job:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    onError: (error) => {
      console.error("Error deleting job:", error);
    },
  });

  // Use a ref to prevent multiple subscriptions
  const subscriptionRef = useRef(null);

  // Set up real-time subscription
  useEffect(() => {
    if (subscriptionRef.current) return;
    const subscription = supabase
      .channel("jobs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscription.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [queryClient]);

  // ✅ Function to get a single job from cached jobs array
  const getJobByIdFromCache = (id: string | undefined) => {
    return jobs?.find((job) => job.id === id);
  };

  return {
    jobs,
    isLoading,
    queryError,
    createJob: createMutation.mutate,
    createJobError: createMutation.error,
    updateJob: updateMutation.mutate,
    updateJobError: updateMutation.error,
    deleteJob: deleteMutation.mutate,
    deleteJobError: deleteMutation.error,
    getJobByIdFromCache, // Exported utility function
  };
}
