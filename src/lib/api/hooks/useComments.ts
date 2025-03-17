import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  Comment,
} from "../comments";

export function useComments(itemId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["comments", itemId];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => (itemId ? getComments(itemId) : Promise.resolve([])),
    enabled: !!itemId,
    staleTime: 300000, // 5 minutes
    cacheTime: 3600000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const createMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { comment: string };
    }) => updateComment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    comments: data || [],
    isLoading,
    error,
    createComment: createMutation.mutate,
    updateComment: updateMutation.mutate,
    deleteComment: deleteMutation.mutate,
  };
}
