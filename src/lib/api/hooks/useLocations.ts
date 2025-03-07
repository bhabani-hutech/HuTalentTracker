import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Location {
  id: number;
  name: string;
  address?: string;
}

export function useLocations() {
  const queryClient = useQueryClient();

  
  const {
    data: locations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("is_own_org", true);

        console.log(locations)
      if (error) throw error;
      return data as Location[];
    },
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

  return { locations, isLoading, error };
}
