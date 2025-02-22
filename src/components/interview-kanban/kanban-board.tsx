import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { useInterviews } from "@/lib/api/hooks/useInterviews";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface KanbanBoardProps {
  selectedJobId: string;
}

type KanbanItem = {
  id: string;
  name: string;
  stage_id: string;
  updated_at?: string;
  type?: string;
  itemType: "interview" | "candidate";
};

export function KanbanBoard({ selectedJobId }: KanbanBoardProps) {
  const { interviews, isLoading, updateInterview } = useInterviews();
  const { toast } = useToast();
  const [stages, setStages] = useState<{ id: string; stage: string }[]>([]);
  const [groupedItems, setGroupedItems] = useState<
    Record<string, KanbanItem[]>
  >({});

  useEffect(() => {
    const loadStages = async () => {
      try {
        const { data, error } = await supabase
          .from("stages")
          .select("id, stage");
        if (error) throw error;
        setStages(data || []);
      } catch (error) {
        console.error("Error loading pipeline stages:", error);
      }
    };
    loadStages();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!stages.length || !selectedJobId) return;

      try {
        const { data: candidates } = await supabase
          .from("candidates")
          .select("id, name, stage_id, job_id, updated_at")
          .eq("job_id", selectedJobId);

        const filteredInterviews =
          interviews?.filter(
            (interview) => interview.job_id === selectedJobId,
          ) || [];

        const grouped: Record<string, KanbanItem[]> = {};
        stages.forEach((stage) => {
          grouped[stage.id] = [];
        });

        candidates?.forEach((candidate) => {
          if (candidate.stage_id) {
            grouped[candidate.stage_id] = [
              ...(grouped[candidate.stage_id] || []),
              {
                id: candidate.id,
                name: candidate.name,
                stage_id: candidate.stage_id,
                updated_at: candidate.updated_at,
                itemType: "candidate",
              },
            ];
          }
        });

        filteredInterviews.forEach((interview) => {
          if (interview.stage_id) {
            grouped[interview.stage_id] = [
              ...(grouped[interview.stage_id] || []),
              {
                id: interview.id,
                name: interview.candidate?.name || "Unknown",
                stage_id: interview.stage_id,
                updated_at: interview.updated_at,
                type: interview.type,
                itemType: "interview",
              },
            ];
          }
        });

        setGroupedItems(grouped);
      } catch (error) {
        console.error("Error loading kanban data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load pipeline data",
        });
      }
    };

    loadData();
  }, [interviews, selectedJobId, stages]);

  const handleDragStart = (e: React.DragEvent, item: KanbanItem) => {
    e.dataTransfer.setData("itemId", item.id);
    e.dataTransfer.setData("itemType", item.itemType);
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    const itemType = e.dataTransfer.getData("itemType");

    try {
      let updated_at = new Date().toISOString();

      if (itemType === "candidate") {
        await supabase
          .from("candidates")
          .update({ stage_id: targetStageId, updated_at })
          .eq("id", itemId);
      } else {
        await updateInterview(itemId, { stage_id: targetStageId, updated_at });
      }

      toast({ title: "Success", description: "Item moved successfully" });

      // Update UI immediately
      setGroupedItems((prev) => {
        const updatedItems = { ...prev };
        let movedItem: KanbanItem | undefined;

        // Remove the item from its previous stage
        Object.keys(updatedItems).forEach((stageId) => {
          const index = updatedItems[stageId]?.findIndex(
            (i) => i.id === itemId,
          );
          if (index !== -1) {
            movedItem = {
              ...updatedItems[stageId][index],
              stage_id: targetStageId,
            }; // Clone with new stage_id
            updatedItems[stageId] = updatedItems[stageId].filter(
              (_, idx) => idx !== index,
            );
          }
        });

        // Add the item to the new stage
        if (movedItem) {
          movedItem.stage_id = targetStageId;
          movedItem.updated_at = updated_at;
          updatedItems[targetStageId] = [
            ...(updatedItems[targetStageId] || []),
            movedItem,
          ];
        }

        return updatedItems;
      });
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to move item",
      });
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-screen">
      {stages.map((stage) => (
        <Card
          key={stage.id}
          className="min-w-[300px] bg-gray-50 shadow-md rounded-lg flex flex-col h-full"
        >
          <CardHeader className="py-3 bg-gray-200 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-gray-700">
              {stage.stage}
              <Badge className="bg-blue-600 text-white">
                {groupedItems[stage.id]?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-2">
            <ScrollArea className="h-full">
              <div
                className="flex flex-col gap-2 h-full min-h-[400px] border-2 border-dashed border-gray-400 rounded-lg p-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {groupedItems[stage.id]?.map((item) => (
                  <Card
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className="p-3 cursor-move bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-md border border-gray-200"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      {item.updated_at && (
                        <div className="text-xs text-gray-500">
                          Last updated:{" "}
                          {new Date(item.updated_at).toLocaleString()}
                        </div>
                      )}
                      {item.itemType === "interview" && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-yellow-500 text-white"
                        >
                          {item.type}
                        </Badge>
                      )}
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
