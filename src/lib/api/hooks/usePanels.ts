import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPanels,
  createPanel,
  updatePanel,
  deletePanel,
  InterviewPanel,
} from "../panels";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useUsers } from "./useUsers";

export function usePanels() {
  const queryClient = useQueryClient();
  const { users } = useUsers();

  // Use a ref to prevent multiple subscriptions
  const subscriptionRef = useRef(null);

  const {
    data: panels,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["panels"],
    queryFn: async () => {
      const panelsData = await getPanels();

      // Enhance panels with member names
      if (users && users.length > 0) {
        return panelsData.map((panel) => ({
          ...panel,
          member_names:
            panel.members && panel.members.length > 0
              ? panel.members.map((memberId) => {
                  const user = users.find((u) => u.id === memberId);
                  return user ? user.name : "Unknown User";
                })
              : [],
        }));
      }

      return panelsData;
    },
    enabled: users !== undefined,
  });

  const createMutation = useMutation({
    mutationFn: createPanel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["panels"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<InterviewPanel>;
    }) => updatePanel(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["panels"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePanel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["panels"] }),
  });

  // Set up real-time subscription
  useEffect(() => {
    // Skip if already subscribed
    if (subscriptionRef.current) return;

    const subscription = supabase
      .channel("panels-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interview_panels" },
        () => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ["panels"] });
        },
      )
      .subscribe();

    // Store subscription reference
    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscription.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [queryClient]);

  return {
    panels,
    isLoading,
    error,
    createPanel: createMutation.mutate,
    updatePanel: updateMutation.mutate,
    deletePanel: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
