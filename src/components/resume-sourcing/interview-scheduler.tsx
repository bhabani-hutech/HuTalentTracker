import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createInterview } from "@/lib/api/interviews";
import { useInterviewers } from "@/lib/api/hooks/useInterviewers";
import { useInterviewRounds } from "@/lib/api/interviewRounds";
import { supabase } from "@/lib/supabase";

interface InterviewSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    name: string;
    job_id: string;
    // position: string;
  } | null;
}

export function InterviewScheduler({
  isOpen,
  onClose,
  candidate,
}: InterviewSchedulerProps) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("10:00");
  const [interviewType, setInterviewType] = useState("technical");
  const [interviewerId, setInterviewerId] = useState("");

  const [roundId, setRoundId] = useState("");

  const [jobTitle, setJobTitle] = useState<string>("Unspecified Position");

  const { toast } = useToast();
  const { data: interviewers } = useInterviewers();
  const { data: interviewRounds } = useInterviewRounds();

  // console.log(candidate);
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchJobTitle = async () => {
      if (!candidate?.job_id) {
        if (isMounted) setJobTitle("Unspecified Position");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("title")
          .eq("id", candidate.job_id)
          .single();

        if (isMounted) {
          setJobTitle(
            error ? "Unknown Position" : data?.title || "Unknown Position",
          );
        }
      } catch (err) {
        console.error("Unexpected error fetching job title:", err);
        if (isMounted) setJobTitle("Unknown Position");
      }
    };

    fetchJobTitle();

    return () => {
      isMounted = false;
    };
  }, [candidate?.job_id]);

  const handleSubmit = async () => {
    try {
      if (!candidate?.id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No candidate selected",
        });
        return;
      }
      if (!candidate?.job_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No job selected",
        });
        return;
      }

      if (!date) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a date",
        });
        return;
      }

      if (!interviewerId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select an interviewer",
        });
        return;
      }
      if (!roundId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a round",
        });
        return;
      }

      // Find the screening stage ID (usually stage 1)
      const { data: stages } = await supabase
        .from("stages")
        .select("id, stage")
        .order("stage_order", { ascending: true });

      const screeningStage = stages?.find(
        (stage) => stage.stage === "Screening" || stage.id === "1",
      );
      const defaultStageId = screeningStage ? screeningStage.id : "1";

      // Create the interview
      const interviewData = {
        candidate_id: candidate.id,
        job_id: candidate.job_id,
        interviewer_id: interviewerId,
        round_id: roundId,
        date: new Date(`${format(date, "yyyy-MM-dd")}T${time}`).toISOString(),
        type: interviewType,
        status: "HR round" as const, // Ensure the status matches the allowed literals
        //stage_id: defaultStageId, // Set default stage to Screening
      };

      await createInterview(interviewData);

      toast({
        title: "Success",
        description: "Interview scheduled successfully",
      });
      onClose();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule interview",
      });
    }
  };
  if (!candidate) return null;
  // Fetch job title if job_id is available

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Job Position</Label>
            <Input value={jobTitle} disabled />
          </div>
          <div className="space-y-2">
            <Label>Candidate</Label>
            <Input value={`${candidate.name}`} disabled />
          </div>

          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F2F">Face-to-Face</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Interview Round</Label>
            <Select value={roundId} onValueChange={setRoundId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Interview Round" />
              </SelectTrigger>
              <SelectContent>
                {interviewRounds?.map((interviewRound) => (
                  <SelectItem key={interviewRound.id} value={String(interviewRound.id)}>
                    {interviewRound.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Interviewer</Label>
            <Select value={interviewerId} onValueChange={setInterviewerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select interviewer" />
              </SelectTrigger>
              <SelectContent>
                {interviewers?.map((interviewer) => (
                  <SelectItem key={interviewer.id} value={interviewer.id}>
                    {interviewer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Schedule Interview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
