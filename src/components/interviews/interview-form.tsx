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
import { format, parse } from "date-fns";
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
    job_id: "",
    candidate_id: "",
    interviewer_id: "",
    round_id: null,
    date: new Date(),
    time: "09:00", // Default time
    type: "F2F",
  });

  const { jobs } = useJobs();
  const { data: candidates } = useCandidates();
  const { data: interviewers } = useInterviewers();
  const { data: interviewRounds } = useInterviewRounds();
  useEffect(() => {
    console.log(initialData);
    if (isOpen) {
      if (initialData) {
        const parsedDate = new Date(initialData.date); // Convert timestamp to Date object
        setFormData({
          job_id: initialData.job_id || "",
          candidate_id: initialData.candidate_id || "",
          interviewer_id: initialData.interviewer_id || "",
          round_id: initialData.round_id || "",
          date: parsedDate,
          time: format(parsedDate, "HH:mm"), // Extract time
          type: initialData.type || "F2F",
        });
        console.log("Populating form with initial data:", initialData);
      } else {
        setFormData({
          job_id: "",
          candidate_id: "",
          interviewer_id: "",
          round_id: null,
          date: new Date(),
          time: "09:00",
          type: "F2F",
        });
      }
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Merge Date & Time into a timestamp
    const [hours, minutes] = formData.time.split(":").map(Number);
    const interviewTimestamp = new Date(formData.date);
    interviewTimestamp.setHours(hours, minutes, 0, 0);
    console.log(interviewTimestamp);
    const { time, ...interviewData } = formData;
    onSubmit({ ...interviewData, date: interviewTimestamp }); // Submit merged timestamp
    onClose();
  };

  const filteredCandidates = candidates?.filter(
    (c) => c.job_id === formData.job_id,
  );

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 9; hour < 18; hour++) {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return times;
  };
  console.log(formData);
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
              value={formData.round_id?.toString()} // Ensure it's a string
              onValueChange={
                (value) => setFormData({ ...formData, round_id: Number(value) }) // Convert back to number
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview round">
                  {interviewRounds?.find(
                    (r) => r.id === Number(formData.round_id),
                  )?.name || "Select interview round"}
                </SelectValue>
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
                  onSelect={(date) => setFormData({ ...formData, date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

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
                {generateTimeOptions().map((time) => (
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
