import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Interview } from "@/types/database";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Function to fetch all interviews
const fetchInterviews = async () => {
  try {
    const { data, error } = await supabase.from("interviews").select(
      `
        *,
        candidate:candidates!candidate_id(id, name, position, email),
        interviewer:users!interviewer_id(id, name, email)
        `,
    );

    if (error) {
      console.error("Error fetching interviews:", error);
      throw new Error(error.message);
    }

    console.log("Fetched interviews data:", data);
    return data || []; // Always return an array
  } catch (err) {
    console.error("Unexpected error in fetchInterviews:", err);
    return [];
  }
};

// Function to fetch a specific interview by ID
const fetchInterviewById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching interview with ID ${id}:`, error);
      throw new Error(error.message);
    }

    console.log(`Fetched interview data for ID ${id}:`, data);
    return data || null;
  } catch (err) {
    console.error(`Unexpected error in fetchInterviewById for ID ${id}:`, err);
    return null;
  }
};

// Main hook that uses React Query
export function useInterviews(interviewId?: string) {
  const queryClient = useQueryClient();

  // React Query to get all interviews
  const {
    data: interviews = [], // Default to empty array
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interviews"],
    queryFn: fetchInterviews,
    refetchOnWindowFocus: false, // Optional: prevents unnecessary refetching
  });

  // React Query to get specific interview by ID
  const {
    data: interviewById = null,
    isLoading: isLoadingInterviewById,
    error: interviewByIdError,
  } = useQuery({
    queryKey: ["interview", interviewId],
    queryFn: () => fetchInterviewById(interviewId as string),
    enabled: !!interviewId, // Only run if interviewId is truthy
  });

  // Create Interview
  const createMutation = useMutation({
    mutationFn: async (newInterview: Partial<Interview>) => {
      const { data, error } = await supabase
        .from("interviews")
        .insert(newInterview);

      if (error) {
        console.error("Error creating interview:", error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      console.log("Interview created, refetching...");
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });

  // Update Interview
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Interview>;
    }) => {
      const { data, error } = await supabase
        .from("interviews")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Error updating interview:", error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      console.log("Interview updated, refetching...");
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });

  // Delete Interview
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("interviews")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting interview:", error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      console.log("Interview deleted, refetching...");
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });

  // Real-time subscription to listen for database changes
  useEffect(() => {
    const subscription = supabase
      .channel("interviews-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interviews" },
        (payload) => {
          console.log("Realtime update received:", payload);
          queryClient.invalidateQueries({ queryKey: ["interviews"] });

          // Also invalidate specific interview if ID matches
          if (interviewId) {
            queryClient.invalidateQueries({
              queryKey: ["interview", interviewId],
            });
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, interviewId]);

  console.log("Loading state:", isLoading);
  console.log("Error state:", error);
  console.log("Interviews data:", interviews);
  console.log("Interview by ID:", interviewById);

  return {
    interviews,
    interviewById,
    isLoading,
    isLoadingInterviewById,
    error,
    interviewByIdError,
    createInterview: createMutation.mutate,
    updateInterview: updateMutation.mutate,
    deleteInterview: deleteMutation.mutate,
  };
}
