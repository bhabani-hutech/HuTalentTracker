import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useOwnOrganization } from "./useOwnOrganization";

interface Location {
  id: string | number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export function useLocations() {
  const queryClient = useQueryClient();
  const { ownOrganization, isLoading: isLoadingOrg } = useOwnOrganization();

  const {
    data: locations,
    isLoading: isLoadingLocs,
    error,
  } = useQuery({
    queryKey: ["locations", ownOrganization?.id],
    queryFn: async () => {
      // If we have an own organization with locations, use those
      if (
        ownOrganization?.locations &&
        Array.isArray(ownOrganization.locations)
      ) {
        return ownOrganization.locations.map((loc, index) => ({
          id: `org-loc-${index}`,
          name: loc.name,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          country: loc.country,
          postal_code: loc.postal_code,
          from_organization: true,
          // Format a display address for convenience
          display_address: [
            loc.address,
            loc.city,
            loc.state,
            loc.country,
            loc.postal_code,
          ]
            .filter(Boolean)
            .join(", "),
        }));
      }

      // Otherwise, fall back to the locations table
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !isLoadingOrg, // Only run this query when we know about the organization
  });

  // Use a ref to prevent multiple subscriptions
  const subscriptionRef = useRef(null);

  // Set up real-time subscription
  useEffect(() => {
    // Skip if already subscribed
    if (subscriptionRef.current) return;
    const subscription = supabase
      .channel("locations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "locations" },
        () => {
          // Invalidate and refetch
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
    locations,
    isLoading: isLoadingLocs || isLoadingOrg,
    error,
  };
}
