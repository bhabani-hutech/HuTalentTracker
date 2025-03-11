import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { supabase } from "@/lib/supabase";

interface StatusAnalyticsProps {
  selectedJobId?: string;
  selectedCandidateId?: string;
}

export function StatusAnalytics({
  selectedJobId,
  selectedCandidateId,
}: StatusAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        if (selectedCandidateId) {
          // If a candidate is selected, show their interview outcomes
          const { data: candidateData, error: candidateError } = await supabase
            .from("candidates")
            .select("id, name, stage_id, stages(stage)")
            .eq("id", selectedCandidateId)
            .single();

          if (candidateError) {
            console.error("Error fetching candidate data:", candidateError);
            setAnalyticsData([]);
            setIsLoading(false);
            return;
          }

          // Get all feedback for this candidate
          const { data: feedbackData, error: feedbackError } = await supabase
            .from("feedback")
            .select("recommendation, interview_id, interviews(id, type)")
            .eq("candidate_id", selectedCandidateId)
            .not("recommendation", "is", null);

          if (feedbackError) {
            console.error("Error fetching candidate feedback:", feedbackError);
            setAnalyticsData([]);
            setIsLoading(false);
            return;
          }

          // Count recommendations for this candidate
          const counts = {};
          feedbackData.forEach((item) => {
            const rec = item.recommendation;
            counts[rec] = (counts[rec] || 0) + 1;
          });

          // Add current stage information
          if (candidateData.stages?.stage) {
            counts[`Current Stage: ${candidateData.stages.stage}`] = 1;
          }

          // Format data for chart
          const chartData = Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: name.startsWith("Current Stage")
              ? "#3b82f6" // blue for current stage
              : getRecommendationColor(name),
          }));

          setAnalyticsData(chartData);
        } else {
          // If no candidate is selected, show overall job statistics
          let feedbackQuery = supabase
            .from("feedback")
            .select("recommendation, interviews!inner(job_id, candidate_id)")
            .not("recommendation", "is", null);

          // Apply job filter if provided
          if (selectedJobId) {
            feedbackQuery = feedbackQuery.eq(
              "interviews.job_id",
              selectedJobId,
            );
          }

          const { data: feedbackData, error: feedbackError } =
            await feedbackQuery;

          if (feedbackError) {
            console.error("Error fetching feedback data:", feedbackError);
            setAnalyticsData([]);
            setIsLoading(false);
            return;
          }

          // Count recommendations
          const counts = {};
          feedbackData.forEach((item) => {
            const rec = item.recommendation;
            counts[rec] = (counts[rec] || 0) + 1;
          });

          // Format data for chart
          const chartData = Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: getRecommendationColor(name),
          }));

          setAnalyticsData(chartData);
        }
      } catch (error) {
        console.error("Error in analytics:", error);
        setAnalyticsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedJobId, selectedCandidateId]);

  // Get color based on recommendation
  function getRecommendationColor(recommendation) {
    switch (recommendation) {
      case "Strong Hire":
      case "Hire":
        return "#22c55e"; // green
      case "Maybe":
        return "#f59e0b"; // yellow
      case "No Hire":
      case "Strong No Hire":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>
          {selectedCandidateId
            ? "Candidate Interview Outcomes"
            : "Overall Interview Outcomes"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Loading analytics...
          </div>
        ) : analyticsData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No interview outcome data available
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} candidates`, "Count"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
