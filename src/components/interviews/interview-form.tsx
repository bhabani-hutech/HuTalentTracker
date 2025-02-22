import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
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
import { useJobs } from "@/lib/api/hooks/useJobs";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useInterviewers } from "@/lib/api/hooks/useInterviewers";
import { useInterviewRounds } from "@/lib/api/hooks/useInterviewRounds";

interface InterviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function InterviewForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: InterviewFormProps) {
  const [formData, setFormData] = useState({
    job_id: "",
    candidate_id: "",
    interviewer_id: "",
    interview_round: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const { jobs, isLoading: jobsLoading, queryError: jobsError } = useJobs();
  const {
    data: candidates,
    isLoading: candidatesLoading,
    queryError: candidatesError,
  } = useCandidates();
  const {
    data: interviewers,
    isLoading: interviewersLoading,
    queryError: interviewersError,
  } = useInterviewers();
  const {
    data: interviewRounds,
    isLoading: interviewRoundsLoading,
    queryError: interviewRoundsError,
  } = useInterviewRounds();

  useEffect(() => {
    console.log("interviewRounds data:", interviewRounds);
    if (jobsError) {
      console.error("Jobs error:", jobsError);
    }
    if (jobsLoading) {
      console.log("jobs are loading");
    }
    if (isOpen && initialData) {
      setFormData({
        job_id: initialData.job_id,
        candidate_id: initialData.candidate_id,
        interviewer_id: initialData.interviewer_id,
        interview_round: initialData.interview_round,
        date: format(new Date(initialData.date), "yyyy-MM-dd'T'HH:mm"),
      });
    } else if (isOpen) {
      setFormData({
        job_id: "",
        candidate_id: "",
        interviewer_id: "",
        interview_round: "",
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [isOpen, initialData, jobs, jobsError, jobsLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const filteredCandidates = candidates?.filter(
    (c) => c.job_id === formData.job_id,
  );

  if (
    jobsLoading ||
    candidatesLoading ||
    interviewersLoading ||
    interviewRoundsLoading
  ) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (
    jobsError ||
    candidatesError ||
    interviewersError ||
    interviewRoundsError
  ) {
    return <div>Error loading data.</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Interview" : "Schedule New Interview"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Job Position</Label>
            <Select
              value={formData.job_id}
              onValueChange={(value) =>
                setFormData({ ...formData, job_id: value, candidate_id: "" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                {jobs?.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Candidate</Label>
            <Select
              value={formData.candidate_id}
              onValueChange={(value) =>
                setFormData({ ...formData, candidate_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select candidate" />
              </SelectTrigger>
              <SelectContent>
                {filteredCandidates?.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Interview Round</Label>
            <Select
              value={formData.interview_round}
              onValueChange={(value) =>
                setFormData({ ...formData, interview_round: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview round" />
              </SelectTrigger>
              <SelectContent>
                {interviewRounds?.map((round) => (
                  <SelectItem key={round.id} value={round.id}>
                    {round.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Interviewer</Label>
            <Select
              value={formData.interviewer_id}
              onValueChange={(value) =>
                setFormData({ ...formData, interviewer_id: value })
              }
            >
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

          <div className="space-y-2">
            <Label>Date and Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(new Date(formData.date), "PPP p")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      date: date ? format(date, "yyyy-MM-dd'T'HH:mm") : "",
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Schedule"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
