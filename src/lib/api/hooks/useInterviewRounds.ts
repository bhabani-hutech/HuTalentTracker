import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface InterviewRound {
  id: string;
  name: string;
  job_id: string;
  duration: number;
  round_order: number;
}

export function useInterviewRounds(jobId?: string) {
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const fetchRounds = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("interview_rounds")
        .select("id, name, job_id, duration, round_order")
        .eq("job_id", jobId);

      if (error) {
        console.error("Error fetching interview rounds:", error);
      } else {
        setRounds(data || []);
      }
      setLoading(false);
    };

    fetchRounds();
  }, [jobId]);

  return { rounds, loading };
}
