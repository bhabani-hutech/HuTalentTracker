import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Department {
  id: number;
  name: string;
  description?: string;
}

export function useDepartments() {
  const {
    data: departments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Department[];
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("departments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "departments" },
        () => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ["departments"] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { departments, isLoading, error };
}
