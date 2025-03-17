import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useOwnOrganization() {
  const queryClient = useQueryClient();

  const {
    data: ownOrganization,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ownOrganization"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("is_own_org", true)
        .single();

      if (error) {
        // If no own org is found, this is not necessarily an error
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }
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
      .channel("own-organization-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "organizations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["ownOrganization"] });
          // Also invalidate related data
          queryClient.invalidateQueries({ queryKey: ["departments"] });
          queryClient.invalidateQueries({ queryKey: ["locations"] });
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
    ownOrganization,
    isLoading,
    error,
  };
}
