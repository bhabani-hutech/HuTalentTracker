import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  Skill,
} from "../skills";

export function useSkills(type?: "domain" | "technical" | "soft") {
  const queryClient = useQueryClient();
  const queryKey = type ? ["skills", type] : ["skills"];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getSkills(type),
    staleTime: 300000, // Data stays fresh for 5 minutes (skills change less frequently)
    cacheTime: 3600000, // Cache persists for 1 hour
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Skill> }) =>
      updateSkill(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    skills: data || [],
    isLoading,
    error,
    createSkill: createMutation.mutate,
    updateSkill: updateMutation.mutate,
    deleteSkill: deleteMutation.mutate,
  };
}
