import { useState, useEffect, useRef } from "react";
import { useCandidateMovement } from "@/lib/api/hooks/useCandidateMovement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, MessageSquare } from "lucide-react";
import { CommentDialog } from "@/components/interview-kanban/comment-dialog";
import { useComments } from "@/lib/api/hooks/useComments";

export default function InterviewFlow() {
  // Initialize the candidate movement system
  useCandidateMovement();
  const [stages, setStages] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobPositions, setJobPositions] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [moveDialog, setMoveDialog] = useState({
    isOpen: false,
    candidate: null,
    fromStage: null,
    toStage: null,
    comment: "",
  });
  const [commentDialog, setCommentDialog] = useState({
    isOpen: false,
    item: null,
  });
  const { toast } = useToast();

  // Fetch job positions
  useEffect(() => {
    const fetchJobPositions = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("id, title")
          .order("title");
        if (error) throw error;
        setJobPositions(data || []);
      } catch (error) {
        console.error("Error fetching job positions:", error);
      }
    };
    fetchJobPositions();
  }, []);

  // Fetch stages and candidates
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedJobId) {
        setStages([]);
        setCandidates([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch pipeline stages
        const { data: stagesData } = await supabase
          .from("stages")
          .select("id, stage")
          .order("stage_order", { ascending: true });

        setStages(stagesData || []);

        // Fetch candidates with their stages
        const { data: candidatesData } = await supabase
          .from("candidates")
          .select(
            "id, name, stage_id, job_id, created_at, updated_at, source, move_reason, jobs(title)"
          )
          .eq("job_id", selectedJobId)
          .order("updated_at", { ascending: false });

        setCandidates(candidatesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedJobId]);

  
  // Use a ref to prevent multiple subscriptions
  const subscriptionRef = useRef(null);

  // Set up real-time subscription for candidates
  useEffect(() => {
    if (!selectedJobId) return;

    // Skip if already subscribed for this job
    if (subscriptionRef.current === selectedJobId) return;

    // Unsubscribe from previous subscription if exists
    if (
      subscriptionRef.current &&
      typeof subscriptionRef.current === "object" &&
      subscriptionRef.current.subscription
    ) {
      subscriptionRef.current.subscription.unsubscribe();
    }

    const subscription = supabase
      .channel(`candidates-changes-${selectedJobId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        (payload) => {
          // Refresh candidates when there's a change
          fetchCandidates();
        }
      )
      .subscribe();

    const fetchCandidates = async () => {
      try {
        const { data } = await supabase
          .from("candidates")
          .select(
            "id, name, stage_id, job_id, created_at, updated_at, source, move_reason, jobs(title)"
          )
          .eq("job_id", selectedJobId)
          .order("updated_at", { ascending: false });

        setCandidates(data || []);
      } catch (error) {
        console.error("Error refreshing candidates:", error);
      }
    };

    // Store subscription reference with job ID
    subscriptionRef.current = {
      jobId: selectedJobId,
      subscription,
    };

    return () => {
      if (
        subscriptionRef.current &&
        typeof subscriptionRef.current === "object" &&
        subscriptionRef.current.subscription
      ) {
        subscriptionRef.current.subscription.unsubscribe();
      }
    };
  }, [selectedJobId]);

  // Group candidates by stage
  const candidatesByStage = {};
  stages.forEach((stage) => {
    candidatesByStage[stage.id] = candidates.filter(
      (c) => c.stage_id === stage.id
    );
  });

  // Handle drag start
  const handleDragStart = (e, candidate, fromStage) => {
    // Store candidate ID and stage ID in multiple formats for compatibility
    e.dataTransfer.setData("text/plain", candidate.id);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        candidateId: candidate.id,
        fromStageId: fromStage.id,
      })
    );
    e.dataTransfer.setData("candidateId", candidate.id);
    e.dataTransfer.setData("fromStageId", fromStage.id);
    e.dataTransfer.effectAllowed = "move";

    // Set a class on the element being dragged
    e.currentTarget.classList.add("dragging");

    // Create a simple drag image
    const dragImage = document.createElement("div");
    dragImage.textContent = candidate.name;
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    dragImage.style.backgroundColor = "white";
    dragImage.style.padding = "8px";
    dragImage.style.border = "1px solid #ccc";
    dragImage.style.borderRadius = "4px";
    dragImage.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Set the dropEffect to move
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, toStage) => {
    e.preventDefault();
    console.log("Drop event triggered on stage:", toStage.stage);

    // Remove dragging class from all elements
    document.querySelectorAll(".dragging").forEach((el) => {
      el.classList.remove("dragging");
    });

    let candidateId;
    let fromStageId;

    try {
      // Try to get JSON data first (most reliable)
      const jsonData = e.dataTransfer.getData("application/json");
      if (jsonData) {
        const parsedData = JSON.parse(jsonData);
        candidateId = parsedData.candidateId;
        fromStageId = parsedData.fromStageId;
        console.log("Retrieved data from JSON:", { candidateId, fromStageId });
      }

      // If that fails, try individual properties
      if (!candidateId) {
        candidateId = e.dataTransfer.getData("candidateId");
        fromStageId = e.dataTransfer.getData("fromStageId");
        console.log("Retrieved data from individual properties:", {
          candidateId,
          fromStageId,
        });
      }

      // If that still fails, try plain text and look up the stage
      if (!candidateId) {
        candidateId = e.dataTransfer.getData("text/plain");
        console.log("Retrieved candidateId from text/plain:", candidateId);
        const candidate = candidates.find((c) => c.id === candidateId);
        if (candidate) {
          fromStageId = candidate.stage_id;
          console.log("Found fromStageId from candidate object:", fromStageId);
        }
      }
    } catch (error) {
      console.error("Error getting drag data:", error);
      return;
    }

    if (!candidateId) {
      console.error("No candidate ID found in drop event");
      return;
    }

    if (fromStageId === toStage.id) {
      console.log("Dropping in same stage, ignoring");
      return;
    }

    const candidate = candidates.find((c) => c.id === candidateId);
    const fromStage = stages.find((s) => s.id === fromStageId);

    if (!candidate) {
      console.error("Candidate not found:", candidateId);
      return;
    }

    if (!fromStage) {
      console.error("From stage not found:", fromStageId);
      return;
    }

    // Prevent moving candidates **to or from** a closed stage
    if (fromStage.stage === "Closed" || toStage.stage === "Closed") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to move candidate",
      });
      console.log("Cannot move candidate because one of the stages is closed.");
      return;
    }

    console.log("Opening move dialog for:", {
      candidate: candidate.name,
      fromStage: fromStage.stage,
      toStage: toStage.stage,
    });

    setMoveDialog({
      isOpen: true,
      candidate,
      fromStage,
      toStage,
      comment: "",
    });
  };

  // Handle move confirmation
  const handleMoveConfirm = async () => {
    const { candidate, toStage, comment } = moveDialog;

    try {
      // Update candidate stage
      const timestamp = new Date().toISOString();
      await supabase
        .from("candidates")
        .update({
          stage_id: toStage.id,
          updated_at: timestamp,
          move_reason: comment,
        })
        .eq("id", candidate.id);

      // Add comment to pipeline_comments if provided
      if (comment.trim()) {
        await supabase.from("pipeline_comments").insert({
          item_id: candidate.id,
          item_type: "candidate",
          comment: `Moved from ${moveDialog.fromStage.stage} to ${toStage.stage}: ${comment}`,
          created_at: timestamp,
        });
      }

      toast({
        title: "Success",
        description: `${candidate.name} moved to ${toStage.stage}`,
      });

      // Update local state to reflect the change immediately
      setCandidates((prevCandidates) =>
        prevCandidates.map((c) =>
          c.id === candidate.id
            ? {
                ...c,
                stage_id: toStage.id,
                updated_at: timestamp,
                move_reason: comment,
              }
            : c
        )
      );

      // Close dialog
      setMoveDialog({
        isOpen: false,
        candidate: null,
        fromStage: null,
        toStage: null,
        comment: "",
      });
    } catch (error) {
      console.error("Error moving candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to move candidate",
      });
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interview Flow</h1>
        <p className="text-muted-foreground">
          Manage candidate progression through interview stages
        </p>
      </div>

      <div className="space-y-2">
        <Label>Job Position</Label>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select job position" />
          </SelectTrigger>
          <SelectContent>
            {jobPositions.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedJobId ? (
        <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium">Select a job position</h3>
            <p className="text-sm text-muted-foreground">
              Choose a job position to view the interview flow
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium">Loading...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we load the data
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pb-4 overflow-auto">
          {stages.map((stage) => (
            <Card
              key={stage.id}
              className="w-full bg-gray-50 shadow-md rounded-lg drop-target"
              onDragOver={(e) => {
                e.preventDefault(); // This is critical for the drop event to fire
                e.stopPropagation();
                e.currentTarget.classList.add("bg-gray-100");
              }}
              onDrop={(e) => handleDrop(e, stage)}
              onDragEnter={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("bg-gray-100");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("bg-gray-100");
              }}
              data-stage-id={stage.id}
            >
              <CardHeader className="py-3 bg-gray-200 rounded-t-lg">
                <CardTitle className="text-sm font-medium flex items-center justify-between text-gray-700">
                  {stage.stage}
                  <Badge className="bg-blue-600 text-white">
                    {candidatesByStage[stage.id]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="max-h-[200px]">
                  <div className="flex flex-wrap gap-2">
                    {candidatesByStage[stage.id]?.length === 0 ? (
                      <div className="w-full text-center py-4 text-muted-foreground">
                        No candidates
                      </div>
                    ) : (
                      candidatesByStage[stage.id]?.map((candidate) => (
                        <TooltipProvider key={candidate.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="p-3 cursor-move bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-md border border-gray-200 w-[200px] relative group drag-item"
                                draggable="true"
                                onDragStart={(e) =>
                                  handleDragStart(e, candidate, stage)
                                }
                                onDragEnd={(e) => {
                                  // Reset any visual effects when drag ends
                                  document
                                    .querySelectorAll(".drop-target")
                                    .forEach((el) =>
                                      el.classList.remove("bg-gray-100")
                                    );
                                  // Remove dragging class
                                  e.currentTarget.classList.remove("dragging");
                                }}
                              >
                                <div className="font-medium text-gray-900">
                                  {candidate.name}
                                  <div className="absolute top-2 right-2 flex space-x-1">
                                    {candidate.move_reason && (
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
                                          item: {
                                            id: candidate.id,
                                            name: candidate.name,
                                            itemType: "candidate",
                                          },
                                        });
                                      }}
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {candidate.jobs?.title && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {candidate.jobs.title}
                                  </div>
                                )}
                                {candidate.updated_at && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Last updated:{" "}
                                    {new Date(
                                      candidate.updated_at
                                    ).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            {candidate.move_reason && (
                              <TooltipContent>
                                <p className="font-semibold">Move Reason:</p>
                                <p>{candidate.move_reason}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Move Confirmation Dialog */}
      <Dialog
        open={moveDialog.isOpen}
        onOpenChange={(open) =>
          !open && setMoveDialog((prev) => ({ ...prev, isOpen: false }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Candidate</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">
              Moving{" "}
              <span className="font-medium">{moveDialog.candidate?.name}</span>{" "}
              from{" "}
              <span className="font-medium">{moveDialog.fromStage?.stage}</span>{" "}
              to{" "}
              <span className="font-medium">{moveDialog.toStage?.stage}</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="move-comment">Comments (optional)</Label>
              <Textarea
                id="move-comment"
                placeholder="Add comments about this stage change..."
                value={moveDialog.comment}
                onChange={(e) =>
                  setMoveDialog((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setMoveDialog((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Cancel
            </Button>
            <Button onClick={handleMoveConfirm}>Confirm Move</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      {commentDialog.item && (
        <CommentDialog
          isOpen={commentDialog.isOpen}
          onClose={() => setCommentDialog({ isOpen: false, item: null })}
          itemId={commentDialog.item.id}
          itemType={commentDialog.item.itemType}
          itemName={commentDialog.item.name}
        />
      )}
    </div>
  );
}
