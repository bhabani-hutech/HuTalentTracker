import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { useInterviews } from "@/lib/api/hooks/useInterviews";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { MoveCardDialog } from "./move-card-dialog";
import { CommentDialog } from "./comment-dialog";
import { ChevronLeft, ChevronRight, Info, MessageSquare } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KanbanBoardProps {
  selectedJobId: string;
}

type KanbanItem = {
  id: string;
  name: string;
  stage_id: string;
  updated_at?: string;
  type?: string;
  position?: string;
  itemType: "interview" | "candidate";
  move_reason?: string;
};

export function KanbanBoard({ selectedJobId }: KanbanBoardProps) {
  const { interviews, isLoading, updateInterview } = useInterviews();
  const { toast } = useToast();
  const [stages, setStages] = useState<{ id: string; stage: string }[]>([]);
  const [visibleStages, setVisibleStages] = useState<
    { id: string; stage: string }[]
  >([]);
  const [startStageIndex, setStartStageIndex] = useState(0);
  const [groupedItems, setGroupedItems] = useState<
    Record<string, KanbanItem[]>
  >({});
  const [moveDialog, setMoveDialog] = useState<{
    isOpen: boolean;
    item: KanbanItem | null;
    fromStage: string;
    toStage: string;
    targetStageId: string;
  }>({
    isOpen: false,
    item: null,
    fromStage: "",
    toStage: "",
    targetStageId: "",
  });

  const [commentDialog, setCommentDialog] = useState<{
    isOpen: boolean;
    item: KanbanItem | null;
  }>({
    isOpen: false,
    item: null,
  });

  // For loading more items on scroll
  const [visibleItemCounts, setVisibleItemCounts] = useState<
    Record<string, number>
  >({});
  const itemsPerPage = 5;
  const [jobFilter, setJobFilter] = useState<string | null>(null);

  useEffect(() => {
    const loadStages = async () => {
      try {
        const { data, error } = await supabase
          .from("stages")
          .select("id, stage")
          .order("stage_order", { ascending: true });
        if (error) throw error;
        setStages(data || []);

        // Initialize visible stages (first 4)
        const initialVisibleCount = Math.min(4, data?.length || 0);
        setVisibleStages(data?.slice(0, initialVisibleCount) || []);

        // Initialize visible item counts
        const counts: Record<string, number> = {};
        data?.forEach((stage) => {
          counts[stage.id] = itemsPerPage;
        });
        setVisibleItemCounts(counts);
      } catch (error) {
        console.error("Error loading pipeline stages:", error);
      }
    };
    loadStages();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!stages.length || !selectedJobId || isLoading) return;

      try {
        // Query candidates with position field
        const { data: candidates } = await supabase
          .from("candidates")
          .select(
            "id, name, stage_id, job_id, updated_at, move_reason, position",
          )
          .eq("job_id", selectedJobId);

        const filteredInterviews =
          interviews?.filter(
            (interview) => interview.job_id === selectedJobId,
          ) || [];

        const grouped: Record<string, KanbanItem[]> = {};
        stages.forEach((stage) => {
          grouped[stage.id] = [];
        });

        // Find the screening stage ID (usually stage 1)
        const screeningStage = stages.find(
          (stage) => stage.stage === "Screening" || stage.id === "1",
        );
        const defaultStageId = screeningStage
          ? screeningStage.id
          : stages[0]?.id;

        candidates?.forEach((candidate) => {
          // Use the candidate's stage_id or default to screening stage
          const stageId = candidate.stage_id || defaultStageId;

          if (stageId) {
            grouped[stageId] = [
              ...(grouped[stageId] || []),
              {
                id: candidate.id,
                name: candidate.name,
                stage_id: stageId,
                updated_at: candidate.updated_at,
                move_reason: candidate.move_reason,
                position: candidate.position,
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
                move_reason: interview.move_reason,
                type: interview.type,
                position:
                  interview.candidate?.position ||
                  interview.candidate?.jobs?.title,
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
  }, [interviews, selectedJobId, stages, isLoading]);

  const handleDragStart = (e: React.DragEvent, item: KanbanItem) => {
    e.dataTransfer.setData("itemId", item.id);
    e.dataTransfer.setData("itemType", item.itemType);
    e.dataTransfer.setData("fromStageId", item.stage_id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    const itemType = e.dataTransfer.getData("itemType");
    const fromStageId = e.dataTransfer.getData("fromStageId");

    // Don't open dialog if dropping in the same stage
    if (fromStageId === targetStageId) return;

    // Find the item and stage names for the dialog
    let item: KanbanItem | undefined;
    Object.keys(groupedItems).forEach((stageId) => {
      const foundItem = groupedItems[stageId]?.find((i) => i.id === itemId);
      if (foundItem) item = foundItem;
    });

    if (!item) return;

    const fromStage = stages.find((s) => s.id === fromStageId)?.stage || "";
    const toStage = stages.find((s) => s.id === targetStageId)?.stage || "";

    // Open the move dialog
    setMoveDialog({
      isOpen: true,
      item,
      fromStage,
      toStage,
      targetStageId,
    });
  };

  const confirmMove = async (reason: string) => {
    if (!moveDialog.item) return;

    try {
      const { item, targetStageId } = moveDialog;
      const updated_at = new Date().toISOString();
      const move_reason = reason;

      if (item.itemType === "candidate") {
        await supabase
          .from("candidates")
          .update({
            stage_id: targetStageId,
            updated_at,
            move_reason,
          })
          .eq("id", item.id);
      } else {
        await updateInterview(item.id, {
          stage_id: targetStageId,
          updated_at,
          move_reason,
        });
      }

      toast({ title: "Success", description: "Item moved successfully" });

      // Update UI immediately
      setGroupedItems((prev) => {
        const updatedItems = { ...prev };
        let movedItem: KanbanItem | undefined;

        // Remove the item from its previous stage
        Object.keys(updatedItems).forEach((stageId) => {
          const index = updatedItems[stageId]?.findIndex(
            (i) => i.id === item.id,
          );
          if (index !== -1) {
            movedItem = {
              ...updatedItems[stageId][index],
              stage_id: targetStageId,
              move_reason,
            };
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

      // Close the dialog
      setMoveDialog({
        isOpen: false,
        item: null,
        fromStage: "",
        toStage: "",
        targetStageId: "",
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

  // Handle loading more items when scrolling
  const handleLoadMore = (stageId: string) => {
    setVisibleItemCounts((prev) => ({
      ...prev,
      [stageId]: (prev[stageId] || itemsPerPage) + itemsPerPage,
    }));
  };

  // Navigation for stages
  const showNextStages = () => {
    if (startStageIndex + 4 < stages.length) {
      const newStartIndex = startStageIndex + 1;
      setStartStageIndex(newStartIndex);
      setVisibleStages(stages.slice(newStartIndex, newStartIndex + 4));
    }
  };

  const showPrevStages = () => {
    if (startStageIndex > 0) {
      const newStartIndex = startStageIndex - 1;
      setStartStageIndex(newStartIndex);
      setVisibleStages(stages.slice(newStartIndex, newStartIndex + 4));
    }
  };

  // Get unique job positions from candidates
  const getUniquePositions = () => {
    const positions = new Set<string>();
    Object.values(groupedItems).forEach((items) => {
      items.forEach((item) => {
        if (item.position) positions.add(item.position);
      });
    });
    return Array.from(positions);
  };

  // Filter items by position
  const filterItemsByPosition = (
    items: KanbanItem[],
    position: string | null,
  ) => {
    if (!position) return items;
    return items.filter((item) => item.position === position);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={showPrevStages}
            disabled={startStageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Select
            value={jobFilter || "all"}
            onValueChange={(value) =>
              setJobFilter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {getUniquePositions()
                .map((position) =>
                  position ? (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ) : null,
                )
                .filter(Boolean)}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground">
          Showing stages {startStageIndex + 1} to{" "}
          {Math.min(startStageIndex + 4, stages.length)} of {stages.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={showNextStages}
          disabled={startStageIndex + 4 >= stages.length}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-180px)]">
        {visibleStages.map((stage) => {
          // Apply position filter if selected
          const stageItems = groupedItems[stage.id] || [];
          const filteredStageItems = filterItemsByPosition(
            stageItems,
            jobFilter,
          );
          const visibleCount = visibleItemCounts[stage.id] || itemsPerPage;
          const visibleItems = filteredStageItems.slice(0, visibleCount);
          const hasMore = filteredStageItems.length > visibleCount;

          return (
            <Card
              key={stage.id}
              className="min-w-[300px] bg-gray-50 shadow-md rounded-lg flex flex-col h-full"
            >
              <CardHeader className="py-3 bg-gray-200 rounded-t-lg">
                <CardTitle className="text-sm font-medium flex items-center justify-between text-gray-700">
                  {stage.stage}
                  <Badge className="bg-blue-600 text-white">
                    {filteredStageItems.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-2">
                <ScrollArea className="h-full">
                  <div
                    className="flex flex-col gap-2 h-full min-h-[400px] border-2 border-dashed border-gray-400 rounded-lg p-2"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                    {visibleItems.map((item) => (
                      <TooltipProvider key={item.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card
                              draggable
                              onDragStart={(e) => handleDragStart(e, item)}
                              className="p-3 cursor-move bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-md border border-gray-200 relative group"
                            >
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900 pr-6">
                                  {item.name}
                                  {item.position && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      {item.position}
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 flex space-x-1">
                                    {item.move_reason && (
                                      <div className="text-blue-500">
                                        <Info className="h-4 w-4" />
                                      </div>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 p-0 text-gray-500 hover:text-gray-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setCommentDialog({
                                          isOpen: true,
                                          item: item,
                                        });
                                      }}
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  </div>
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
                          </TooltipTrigger>
                          {item.move_reason && (
                            <TooltipContent>
                              <p className="font-semibold">Move Reason:</p>
                              <p>{item.move_reason}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}

                    {hasMore && (
                      <Button
                        variant="ghost"
                        className="w-full text-sm text-muted-foreground"
                        onClick={() => handleLoadMore(stage.id)}
                      >
                        Load more ({filteredStageItems.length - visibleCount}{" "}
                        remaining)
                      </Button>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <MoveCardDialog
        isOpen={moveDialog.isOpen}
        onClose={() => setMoveDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmMove}
        fromStage={moveDialog.fromStage}
        toStage={moveDialog.toStage}
        itemName={moveDialog.item?.name || ""}
      />

      {commentDialog.item && (
        <CommentDialog
          isOpen={commentDialog.isOpen}
          onClose={() => setCommentDialog({ isOpen: false, item: null })}
          itemId={commentDialog.item.id}
          itemType={commentDialog.item.itemType}
          itemName={commentDialog.item.name}
        />
      )}
    </>
  );
}
