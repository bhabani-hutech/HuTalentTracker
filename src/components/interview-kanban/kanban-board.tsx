import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { useInterviews } from "@/lib/api/hooks/useInterviews";
import { Interview } from "@/lib/api/interviews";

const stages = [
  { id: "screening", name: "Screening" },
  { id: "shortlisted", name: "Shortlisted" },
  { id: "test", name: "Test" },
  { id: "tech1", name: "Tech-1" },
  { id: "tech2", name: "Tech-2" },
  { id: "hr", name: "HR" },
  { id: "barraiser", name: "Bar Raiser" },
  { id: "mgmt", name: "Management" },
  { id: "offered", name: "Offered" },
  { id: "joined", name: "Joined" },
  { id: "rejected", name: "Rejected" },
  { id: "offer_rejected", name: "Offer Rejected" },
];

function getStageColor(stage: string): string {
  switch (stage) {
    case "joined":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "offered":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "rejected":
    case "offer_rejected":
      return "bg-red-500 hover:bg-red-600 text-white";
    default:
      return "bg-secondary hover:bg-secondary/80";
  }
}

interface KanbanBoardProps {
  selectedJobId: string;
}

export function KanbanBoard({ selectedJobId }: KanbanBoardProps) {
  const { interviews, isLoading, updateInterview } = useInterviews();
  const [groupedInterviews, setGroupedInterviews] = useState<
    Record<string, Interview[]>
  >({});

  useEffect(() => {
    if (interviews) {
      // Filter interviews by selected job if one is selected
      const filteredInterviews = selectedJobId
        ? interviews.filter((interview) => interview.job_id === selectedJobId)
        : interviews;

      const grouped = stages.reduce(
        (acc, stage) => {
          acc[stage.id] = filteredInterviews.filter(
            (interview) => interview.status === stage.id,
          );
          return acc;
        },
        {} as Record<string, Interview[]>,
      );
      setGroupedInterviews(grouped);
    }
  }, [interviews, selectedJobId]);

  const handleDragStart = (e: React.DragEvent, interviewId: string) => {
    e.dataTransfer.setData("text/plain", interviewId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const interviewId = e.dataTransfer.getData("text/plain");
    try {
      await updateInterview(interviewId, { status: targetStage });
    } catch (error) {
      console.error("Error updating interview stage:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!selectedJobId) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        Please select a job posting to view its pipeline
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <Card key={stage.id} className="min-w-[300px]">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              {stage.name}
              <Badge className={getStageColor(stage.id)}>
                {groupedInterviews[stage.id]?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div
                className="space-y-2 p-1"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {groupedInterviews[stage.id]?.map((interview) => (
                  <Card
                    key={interview.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, interview.id)}
                    className="p-3 cursor-move hover:bg-muted/50"
                  >
                    <div className="space-y-2">
                      <div className="font-medium">
                        {interview.candidate?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {interview.candidate?.position}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {interview.type}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
