import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

  // Set up real-time subscription
  useEffect(() => {
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

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    locations,
    isLoading: isLoadingLocs || isLoadingOrg,
    error,
  };
}
