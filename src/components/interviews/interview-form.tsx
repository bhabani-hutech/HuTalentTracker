import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useJobs } from "@/lib/api/hooks/useJobs";
import { useToast } from "../ui/use-toast";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useInterviewers } from "@/lib/api/hooks/useInterviewers";
import { useInterviewRounds } from "@/lib/api/interviewRounds";

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
    job_id: initialData?.job_id || "",
    candidate_id: initialData?.candidate_id || "",
    interviewer_id: initialData?.interviewer_id || "",
    round_id: initialData?.round_id || null,
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    time: initialData?.date
      ? format(new Date(initialData.date), "HH:mm")
      : "09:00",
    type: initialData?.type || "F2F",
  });
  const { toast } = useToast();
  const { jobs } = useJobs();
  const { data: candidates } = useCandidates();
  const { data: interviewers } = useInterviewers();
  const { data: interviewRounds } = useInterviewRounds();

  useEffect(() => {
    if (initialData && initialData.id) {
      console.log(initialData);
      const dataObj = {
        job_id: initialData.job_id || "",
        candidate_id: initialData.candidate_id || "",
        interviewer_id: initialData.interviewer_id || "",
        round_id: initialData.round_id || null,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        time: initialData.date
          ? format(new Date(initialData.date), "HH:mm")
          : "09:00",
        type: initialData.type || "F2F",
      };
      console.log(dataObj);
      setFormData(dataObj);
    }
  }, [initialData]);
  console.log(initialData);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.job_id ||
      !formData.candidate_id ||
      !formData.interviewer_id ||
      !formData.round_id
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select all required fields.",
      });
      return;
    }

    const [hours, minutes] = formData.time.split(":").map(Number);
    const interviewTimestamp = new Date(formData.date);
    interviewTimestamp.setHours(hours, minutes, 0, 0);

    const { time, ...interviewData } = formData;
    const submissionData = {
      ...interviewData,
      date: interviewTimestamp,
    };

    onSubmit(submissionData);
    onClose();
  };

  const filteredCandidates = useMemo(() => {
    return candidates?.filter((c) => c.job_id === formData.job_id) || [];
  }, [candidates, formData.job_id]);

  const timeOptions = useMemo(() => {
    const times = [];
    for (let hour = 9; hour < 18; hour++) {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return times;
  }, []);
  console.log(formData);
  // const allOptions = useMemo(() => {
  const selectedCandidate = candidates?.find(
    (c) => c.id === initialData.candidate_id
  );
  console.log(candidates, formData, selectedCandidate);
  const candidateOptions = selectedCandidate
    ? [
        ...filteredCandidates.filter((c) => c.id !== initialData.candidate_id),
        selectedCandidate,
      ]
    : filteredCandidates;
  console.log(candidateOptions);

  // }, [filteredCandidates, candidates, formData.candidate_id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData && initialData?.interviewer_id
              ? "Edit Interview"
              : "Schedule New Interview"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Position */}
          <div className="space-y-2">
            <Label>Job Position</Label>
            <Select
              value={formData.job_id}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  job_id: value,
                  // candidate_id:value !== formData.job_id ? "" : formData.candidate_id,
                });
              }}
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
          {/* {console.log(formData)} */}
          {/* Candidate */}
          <div className="space-y-2">
            <Label>Candidate</Label>
            {/* <Select
              value={formData.candidate_id}
              onValueChange={(value) =>
                setFormData({ ...formData, candidate_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select candidate" />
              </SelectTrigger>
              <SelectContent>
                {[
                  ...filteredCandidates.filter(
                    (c) => c.id !== formData.candidate_id
                  ),
                  candidates?.find((c) => c.id === formData.candidate_id),
                ]
                  .filter(Boolean)
                  .map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select> */}
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
                {candidateOptions.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interview Round */}
          <div className="space-y-2">
            <Label>Interview Round</Label>
            <Select
              value={formData.round_id?.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, round_id: Number(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview round" />
              </SelectTrigger>
              <SelectContent>
                {interviewRounds?.map((round) => (
                  <SelectItem key={round.id} value={round.id.toString()}>
                    {round.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interviewer */}
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

          {/* Interview Type */}
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F2F">Face to Face</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => {
                    if (date) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (date >= today) {
                        setFormData({ ...formData, date });
                      } else {
                        alert("You cannot select a past date.");
                      }
                    }
                  }}
                  disabled={(date) =>
                    date.getTime() < new Date().setHours(0, 0, 0, 0)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Select
              value={formData.time}
              onValueChange={(value) =>
                setFormData({ ...formData, time: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit">{initialData ? "Update" : "Schedule"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
