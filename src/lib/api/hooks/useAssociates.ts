import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAssociates,
  createAssociate,
  updateAssociate,
  deleteAssociate,
} from "../associates";
import { Associate } from "@/types/database";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useAssociates() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["associates"],
    queryFn: getAssociates,
  });

  const createMutation = useMutation({
    mutationFn: createAssociate,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["associates"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Associate>;
    }) => updateAssociate(id, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["associates"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssociate,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["associates"] }),
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("associates-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "associates" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["associates"] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    associates: data,
    isLoading,
    error,
    createAssociate: createMutation.mutate,
    updateAssociate: updateMutation.mutate,
    deleteAssociate: deleteMutation.mutate,
  };
}
