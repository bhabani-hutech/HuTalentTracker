import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
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

  // Use a ref to prevent multiple subscriptions
  const subscriptionRef = useRef(null);

  // Set up real-time subscription
  useEffect(() => {
    // Skip if already subscribed
    if (subscriptionRef.current) return;
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
    organizations,
    ownOrganization,
    isLoading: isLoading || isLoadingOwnOrg,
    error,
  };
}
