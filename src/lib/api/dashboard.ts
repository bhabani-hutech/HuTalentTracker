import { supabase } from "../supabase";

export async function getDashboardMetrics() {
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, status");

  if (candidatesError) throw candidatesError;

  const { data: interviews, error: interviewsError } = await supabase
    .from("interviews")
    .select("id, date")
    .gte("date", new Date().toISOString())
    .lte(
      "date",
      new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    );

  if (interviewsError) throw interviewsError;

  return {
    openPositions: 12, // This would come from a positions table in a real app
    activeCandidates: candidates?.length || 0,
    interviewsThisWeek: interviews?.length || 0,
    offersAccepted:
      candidates?.filter((c) => c.status === "Offered")?.length || 0,
  };
}

export async function getRecruitmentPipeline() {
  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("status");

  if (error) throw error;

  const pipeline = [
    { stage: "Applied", count: candidates?.length || 0 },
    {
      stage: "Screening",
      count:
        candidates?.filter((c) => c.status === "Rejected in screening")
          ?.length || 0,
    },
    {
      stage: "Interview",
      count:
        candidates?.filter((c) =>
          ["Rejected -1", "Rejected in -2"].includes(c.status || ""),
        )?.length || 0,
    },
    {
      stage: "Technical",
      count: candidates?.filter((c) => c.status === "Cleared")?.length || 0,
    },
    {
      stage: "HR Round",
      count: candidates?.filter((c) => c.status === "HR round")?.length || 0,
    },
    {
      stage: "Offered",
      count: candidates?.filter((c) => c.status === "Offered")?.length || 0,
    },
  ];

  return pipeline;
}

export async function getRecentActivities() {
  const { data: interviews, error: interviewsError } = await supabase
    .from("interviews")
    .select(
      `
      *,
      candidates (name, position),
      users (name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (interviewsError) throw interviewsError;

  return (
    interviews?.map((interview) => ({
      id: interview.id,
      type: "interview",
      message: `Interview scheduled with ${interview.candidates?.name} for ${interview.candidates?.position}`,
      date: interview.date,
    })) || []
  );
}
