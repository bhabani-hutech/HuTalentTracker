import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Smile,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface StatusOverviewProps {
  selectedJobId?: string;
}

export function StatusOverview({ selectedJobId }: StatusOverviewProps) {
  const [stageData, setStageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCandidates, setTotalCandidates] = useState(0);

  useEffect(() => {
    const fetchStageData = async () => {
      setIsLoading(true);
      try {
        // Fetch all stages
        const { data: stages } = await supabase
          .from("stages")
          .select("id, stage")
          .order("stage_order", { ascending: true });

        // Fetch candidates with their stages
        const query = supabase
          .from("candidates")
          .select("id, stage_id, stages(stage)");

        // Apply job filter if provided
        if (selectedJobId) {
          query.eq("job_id", selectedJobId);
        }

        const { data: candidates } = await query;

        // Group candidates by stage
        const stageCounts = {};
        stages.forEach((stage) => {
          stageCounts[stage.id] = {
            name: stage.stage,
            count: 0,
            icon: getStageIcon(stage.stage),
          };
        });

        candidates.forEach((candidate) => {
          const stageId = candidate.stage_id;
          if (stageCounts[stageId]) {
            stageCounts[stageId].count++;
          }
        });

        // Convert to array for rendering
        const stageDataArray = Object.values(stageCounts);
        setStageData(stageDataArray);
        setTotalCandidates(candidates.length);
      } catch (error) {
        console.error("Error fetching stage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStageData();
  }, [selectedJobId]);

  // Get icon based on stage name
  function getStageIcon(stageName) {
    const stageNameLower = stageName.toLowerCase();
    if (stageNameLower.includes("screening")) {
      return <Users className="h-4 w-4 text-blue-500" />;
    } else if (stageNameLower.includes("technical")) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else if (stageNameLower.includes("manager")) {
      return <Briefcase className="h-4 w-4 text-purple-500" />;
    } else if (
      stageNameLower.includes("culture") ||
      stageNameLower.includes("fit")
    ) {
      return <Smile className="h-4 w-4 text-orange-500" />;
    } else if (stageNameLower.includes("hr")) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (stageNameLower.includes("reject")) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <Users className="h-4 w-4 text-gray-500" />;
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {isLoading ? (
        <Card className="col-span-full">
          <CardContent className="py-6">
            <div className="text-center">Loading stage data...</div>
          </CardContent>
        </Card>
      ) : stageData.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="py-6">
            <div className="text-center">No stage data available</div>
          </CardContent>
        </Card>
      ) : (
        stageData.map((stage, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stage.name}
              </CardTitle>
              {stage.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stage.count}</div>
              <Progress
                value={(stage.count / totalCandidates) * 100}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {totalCandidates > 0
                  ? `${((stage.count / totalCandidates) * 100).toFixed(1)}% of total candidates`
                  : "No candidates"}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
