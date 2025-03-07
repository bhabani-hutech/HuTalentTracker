import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Locations {
  id: number;
  name: string;
  address?: string;
}

export function useLocations() {
  const {
    data: organizations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("is_own_org", true);

      if (error) throw error;
      return data as Locations[];
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
  }, []);

  return { locations, isLoading, error };
}
