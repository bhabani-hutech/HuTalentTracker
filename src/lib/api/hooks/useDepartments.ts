import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useOwnOrganization } from "./useOwnOrganization";

interface Department {
  id: number | string;
  name: string;
  description?: string;
  from_organization?: boolean;
}

export function useDepartments() {
  const queryClient = useQueryClient();
  const { ownOrganization, isLoading: isLoadingOrg } = useOwnOrganization();

  // Use a ref to prevent multiple subscriptions
  const subscriptionRef = useRef(null);

  const {
    data: departments,
    isLoading: isLoadingDepts,
    error,
  } = useQuery({
    queryKey: ["departments", ownOrganization?.id],
    queryFn: async () => {
      // If we have an own organization with departments, use those
      if (
        ownOrganization?.departments &&
        Array.isArray(ownOrganization.departments)
      ) {
        return ownOrganization.departments.map((dept, index) => ({
          id: `org-dept-${index}`,
          name: dept.name,
          description: dept.description || "",
          from_organization: true,
        }));
      }

      // Otherwise, fall back to the departments table
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !isLoadingOrg, // Only run this query when we know about the organization
  });

  // Set up real-time subscription
  useEffect(() => {
    // Skip if already subscribed
    if (subscriptionRef.current) return;
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
    departments,
    isLoading: isLoadingDepts || isLoadingOrg,
    error,
  };
}
