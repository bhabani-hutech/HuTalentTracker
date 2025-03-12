import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useOwnOrganization } from "./useOwnOrganization";

export function useOrganizations() {
  const queryClient = useQueryClient();
  const { ownOrganization, isLoading: isLoadingOwnOrg } = useOwnOrganization();

  const {
    data: organizations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("organizations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "organizations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    organizations,
    ownOrganization,
    isLoading: isLoading || isLoadingOwnOrg,
    error,
  };
}
