import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/components/ui/use-toast";

export default function InterviewFlow() {
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
          .select("id, name, stage_id, job_id, created_at, source, jobs(title)")
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

  // Set up real-time subscription for candidates
  useEffect(() => {
    if (!selectedJobId) return;

    const subscription = supabase
      .channel("candidates-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        (payload) => {
          // Refresh candidates when there's a change
          fetchCandidates();
        },
      )
      .subscribe();

    const fetchCandidates = async () => {
      try {
        const { data } = await supabase
          .from("candidates")
          .select("id, name, stage_id, job_id, created_at, source, jobs(title)")
          .eq("job_id", selectedJobId)
          .order("updated_at", { ascending: false });

        setCandidates(data || []);
      } catch (error) {
        console.error("Error refreshing candidates:", error);
      }
    };

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedJobId]);

  // Group candidates by stage
  const candidatesByStage = {};
  stages.forEach((stage) => {
    candidatesByStage[stage.id] = candidates.filter(
      (c) => c.stage_id === stage.id,
    );
  });

  // Handle drag start
  const handleDragStart = (e, candidate, fromStage) => {
    e.dataTransfer.setData("candidateId", candidate.id);
    e.dataTransfer.setData("fromStageId", fromStage.id);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e, toStage) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("candidateId");
    const fromStageId = e.dataTransfer.getData("fromStageId");

    // Don't do anything if dropping in the same stage
    if (fromStageId === toStage.id) return;

    // Find the candidate and from stage
    const candidate = candidates.find((c) => c.id === candidateId);
    const fromStage = stages.find((s) => s.id === fromStageId);

    if (!candidate || !fromStage) return;

    // Open the move dialog
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
      await supabase
        .from("candidates")
        .update({
          stage_id: toStage.id,
          updated_at: new Date().toISOString(),
          move_reason: comment,
        })
        .eq("id", candidate.id);

      // Add comment to pipeline_comments if provided
      if (comment.trim()) {
        await supabase.from("pipeline_comments").insert({
          item_id: candidate.id,
          item_type: "candidate",
          comment: `Moved from ${moveDialog.fromStage.stage} to ${toStage.stage}: ${comment}`,
        });
      }

      toast({
        title: "Success",
        description: `${candidate.name} moved to ${toStage.stage}`,
      });

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
              className="w-full bg-gray-50 shadow-md rounded-lg"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
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
                        <div
                          key={candidate.id}
                          className="p-3 cursor-move bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-md border border-gray-200 w-[200px]"
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, candidate, stage)
                          }
                        >
                          <div className="font-medium text-gray-900">
                            {candidate.name}
                          </div>
                          {candidate.jobs?.title && (
                            <div className="text-xs text-gray-600 mt-1">
                              {candidate.jobs.title}
                            </div>
                          )}
                          {candidate.move_reason && (
                            <div className="text-xs text-blue-600 mt-1 italic">
                              "{candidate.move_reason}"
                            </div>
                          )}
                        </div>
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
    </div>
  );
}
