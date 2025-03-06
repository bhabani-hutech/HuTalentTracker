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
}

export function StatusAnalytics({ selectedJobId }: StatusAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Try to fetch feedback data with recommendations
        let feedbackQuery = supabase
          .from("feedback")
          .select("recommendation, interviews!inner(job_id, candidate_id)")
          .not("recommendation", "is", null);

        // Apply job filter if provided
        if (selectedJobId) {
          feedbackQuery = feedbackQuery.eq("interviews.job_id", selectedJobId);
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
      } catch (error) {
        console.error("Error in analytics:", error);
        setAnalyticsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedJobId]);

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
        <CardTitle>Interview Outcomes</CardTitle>
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
