import { supabase } from "../supabase";

export async function getDashboardMetrics() {
  // Fetch candidates with their stage names
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, stage_id, stages(stage)");

  if (candidatesError) throw candidatesError;

  // Fetch upcoming interviews
  const { data: interviews, error: interviewsError } = await supabase
    .from("interviews")
    .select("id, date")
    .gte("date", new Date().toISOString())
    .lte(
      "date",
      new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    );

  if (interviewsError) throw interviewsError;

  // Fetch open job positions (jobs that are NOT in "Closed" status)
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id")
    .neq("status", "Closed");

  if (jobsError) throw jobsError;

  return {
    openPositions: jobs?.length || 0, // Now dynamically fetched from the jobs table
    activeCandidates: candidates?.length || 0,
    interviewsThisWeek: interviews?.length || 0,
    offersAccepted:
      candidates?.filter((c) => c.stages?.stage === "Offered")?.length || 0,
  };
}

export async function getRecruitmentPipeline() {
  // Fetch candidates with their stage names
  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("id, stages(stage)");

  if (error) throw error;

  const pipeline = [
    { stage: "Applied", count: candidates?.length || 0 },
    {
      stage: "Screening",
      count:
        candidates?.filter((c) => c.stages?.stage === "Rejected in screening")
          ?.length || 0,
    },
    {
      stage: "Interview",
      count:
        candidates?.filter((c) =>
          ["Rejected -1", "Rejected in -2"].includes(c.stages?.stage || ""),
        )?.length || 0,
    },
    {
      stage: "Technical",
      count:
        candidates?.filter((c) => c.stages?.stage === "Cleared")?.length || 0,
    },
    {
      stage: "HR Round",
      count:
        candidates?.filter((c) => c.stages?.stage === "HR round")?.length || 0,
    },
    {
      stage: "Offered",
      count:
        candidates?.filter((c) => c.stages?.stage === "Offered")?.length || 0,
    },
  ];

  return pipeline;
}

export async function getRecentActivities() {
  const { data: interviews, error: interviewsError } = await supabase
    .from("interviews")
    .select(
      `
      id,
      date,
      candidates (name, job_id, jobs(title)),
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
      message: `Interview scheduled with ${interview.candidates?.name} for ${
        interview.candidates?.jobs?.title || "N/A"
      }`,
      date: interview.date,
    })) || []
  );
}
