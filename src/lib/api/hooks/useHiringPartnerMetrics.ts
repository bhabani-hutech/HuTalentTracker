import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface HiringPartnerMetrics {
  totalCandidates: number;
  totalJoined: number;
  successRate: number;
  avgTimeToHire: number;
  timeToHireData: Array<{
    name: string;
    days: number;
    position: string;
  }>;
}

async function fetchHiringPartnerMetrics(
  partnerId: string,
): Promise<HiringPartnerMetrics> {
  if (!partnerId) {
    return {
      totalCandidates: 0,
      totalJoined: 0,
      successRate: 0,
      avgTimeToHire: 0,
      timeToHireData: [],
    };
  }

  // Get total candidates for this partner
  const { count: totalCandidates, error: countError } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .or(
      `hiring_partner_id.eq.${partnerId},and(candidate_source.eq.Hiring Partner,hiring_partner_id.eq.${partnerId})`,
    );

  if (countError) {
    console.error("Error fetching total candidates:", countError);
    throw countError;
  }

  // Get joined candidates (stage_id = 6 means joined)
  const { count: totalJoined, error: joinedError } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .or(
      `hiring_partner_id.eq.${partnerId},and(candidate_source.eq.Hiring Partner,hiring_partner_id.eq.${partnerId})`,
    )
    .eq("stage_id", 6);

  if (joinedError) {
    console.error("Error fetching joined candidates:", joinedError);
    throw joinedError;
  }

  // Calculate success rate
  const successRate =
    totalCandidates > 0 ? Math.round((totalJoined / totalCandidates) * 100) : 0;

  // Get time to hire data for joined candidates
  const { data: joinedCandidatesData, error: timeToHireError } = await supabase
    .from("candidates")
    .select("id, name, created_at, updated_at, job_id, jobs(title)")
    .or(
      `hiring_partner_id.eq.${partnerId},and(candidate_source.eq.Hiring Partner,hiring_partner_id.eq.${partnerId})`,
    )
    .eq("stage_id", 6);

  if (timeToHireError) {
    console.error("Error fetching time to hire data:", timeToHireError);
    throw timeToHireError;
  }

  // Calculate time to hire metrics
  let totalDays = 0;
  const timeToHireData = [];

  joinedCandidatesData.forEach((candidate) => {
    if (candidate.created_at && candidate.updated_at) {
      const createdDate = new Date(candidate.created_at);
      const joinedDate = new Date(candidate.updated_at);
      const diffTime = Math.abs(joinedDate.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Only count reasonable time periods (avoid data errors)
      if (diffDays > 0 && diffDays < 365) {
        totalDays += diffDays;
        timeToHireData.push({
          name: candidate.name,
          days: diffDays,
          position: candidate.jobs?.title || "Unknown Position",
        });
      }
    }
  });

  const avgTimeToHire =
    timeToHireData.length > 0
      ? Math.round(totalDays / timeToHireData.length)
      : 0;

  return {
    totalCandidates: totalCandidates || 0,
    totalJoined: totalJoined || 0,
    successRate,
    avgTimeToHire,
    timeToHireData,
  };
}

export function useHiringPartnerMetrics(partnerId: string) {
  return useQuery({
    queryKey: ["hiring-partner-metrics", partnerId],
    queryFn: () => fetchHiringPartnerMetrics(partnerId),
    enabled: !!partnerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
