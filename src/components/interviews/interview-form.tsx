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
import { getInterviews } from "@/lib/api/interviews";
import { supabase } from "@/lib/supabase";

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
  const { toast } = useToast();
  const { jobs } = useJobs();
  const { data: candidates } = useCandidates();
  const { data: interviewers } = useInterviewers();
  const { data: interviewRounds } = useInterviewRounds();

  const getInitialFormData = () => ({
    job_id: initialData?.job_id || "",
    candidate_id: initialData?.candidate_id || "",
    interviewer_id: initialData?.interviewer_id || "",
    round_id: initialData?.round_id?.toString() || "",  // Ensure it's a string
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    time: initialData?.time || "09:00",
    type: initialData?.type || "F2F",
  });
  const InterviewData = getInterviews();
  console.log(InterviewData);
  const [formData, setFormData] = useState(getInitialFormData());
  const [unAttendedInterview, setUnAttendedInterview] = useState<any[]>([]);

  // Reset form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(getInitialFormData());
    }
  }, [isOpen, initialData]);
  
  useEffect(() => {
    const fetchRound = async () => {
      const { data: allRounds, error: roundsError } = await supabase
        .from("interview_rounds")
        .select("id, name");

      if (roundsError) {
        console.error("Error fetching interview rounds:", roundsError);
        return;
      }

      const { data: attendedRounds, error: attendedError } = await supabase
        .from("interviews")
        .select("round_id")
        .eq("candidate_id", formData.candidate_id);

      if (attendedError) {
        console.error("Error fetching attended rounds:", attendedError);
        return;
      }

      const attendedRoundIds = attendedRounds.map((r) => r.round_id);

      // Step 3: Filter rounds not attended
      const notAttendedRounds = allRounds.filter(
        (round) => !attendedRoundIds.includes(round.id)
      );
      setUnAttendedInterview(notAttendedRounds);
      // Final result
      console.log("Rounds not attended:", notAttendedRounds);
    };

    fetchRound();
  }, [formData.candidate_id]);

  const handleClose = () => {
    setFormData({
      job_id: "",
      candidate_id: "",
      interviewer_id: "",
      round_id: 0,
      date: new Date(),
      time: "09:00",
      type: "F2F",
    });
    onClose();
  };

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

    const now = new Date();
    if (interviewTimestamp < now) {
      toast({
        variant: "destructive",
        title: "Invalid Time",
        description: "Interview time cannot be in the past.",
      });
      return;
    }

    // Check for scheduling conflicts
    const hasConflict = candidates?.some((candidate) => {
      return (
        candidate.interviewer_id === formData.interviewer_id &&
        new Date(candidate.date).toISOString() ===
          interviewTimestamp.toISOString() &&
        // Don't count the current interview as a conflict with itself
        (!initialData || candidate.id !== initialData.id)
      );
    });

    if (hasConflict) {
      toast({
        variant: "destructive",
        title: "Scheduling Conflict",
        description:
          "The selected interviewer is already scheduled for another interview at this time.",
      });
      return;
    }
    console.log(formData);
    const submissionData = {
      ...formData,
      date: interviewTimestamp,
    };

    onSubmit(submissionData);
    handleClose(); // Close the modal
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

  const getFilteredTimeSlots = useMemo(() => {
    if (!formData.date) return timeOptions;

    const now = new Date();
    const isToday = formData.date.toDateString() === now.toDateString();

    return timeOptions.filter((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const slotTime = new Date(formData.date);
      slotTime.setHours(hours, minutes, 0, 0);

      // If the selected date is today, filter out past time slots
      if (isToday) {
        return slotTime > now;
      }
      return true; // Include all time slots for future dates
    });
  }, [formData.date, timeOptions]);

  const selectedCandidate = candidates?.find(
    (c) => c.id === initialData?.candidate_id
  );

  const candidateOptions = selectedCandidate
    ? [
        ...filteredCandidates.filter((c) => c.id !== initialData?.candidate_id),
        selectedCandidate,
      ]
    : filteredCandidates;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      // key={initialData?.id || "new"}
    >
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
            <Label>
              <span className="flex items-center gap-1">
                Job Position
                <span className="text-red-500">*</span>
              </span>
            </Label>
            <Select
              value={formData.job_id}
              disabled={!!initialData?.candidate_id}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  job_id: value,
                  // Reset candidate if job changes
                  candidate_id:
                    value !== formData.job_id ? "" : formData.candidate_id,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                {jobs
                  ?.filter((job) => job.status !== "Draft")
                  .map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.location}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              <span className="flex items-center gap-1">
                Candidate
                <span className="text-red-500">*</span>
              </span>
            </Label>

            <Select
              value={formData.candidate_id}
              disabled={!!initialData?.candidate_id}
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
            <Label>
              <span className="flex items-center gap-1">
                Interview Round
                <span className="text-red-500">*</span>
              </span>
            </Label>
            {console.log(unAttendedInterview)}
            <Select
              value={formData.round_id}
              onValueChange={(value) =>
                setFormData({ ...formData, round_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview round" />
              </SelectTrigger>
              {/* <SelectContent>
                {unAttendedInterview?.map((round) => (
                  <SelectItem key={round.id} value={round.id + ""}>
                    {round.name}
                  </SelectItem>
                ))}
              </SelectContent> */}
              <SelectContent>
                {interviewRounds?.map((round) => {
                  const alreadyAttended = !unAttendedInterview.some(
                    (r) => r.id === round.id
                  );

                  return (
                    <SelectItem
                      key={round.id}
                      value={round.id + ""}
                      disabled={alreadyAttended}
                    >
                      {round.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {/* Interviewer */}
          <div className="space-y-2">
            <Label>
              <span className="flex items-center gap-1">
                Interviewer
                <span className="text-red-500">*</span>
              </span>
            </Label>
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
            <Label>
              <span className="flex items-center gap-1">
                Interview Type
                <span className="text-red-500">*</span>
              </span>
            </Label>

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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <Label>
                <span className="flex items-center gap-1">
                  Date
                  <span className="text-red-500">*</span>
                </span>
              </Label>
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

            <div className="flex-1 space-y-1">
              <Label>
                <span className="flex items-center gap-1">
                  Time
                  <span className="text-red-500">*</span>
                </span>
              </Label>
              <Select
                value={formData.time}
                onValueChange={(value) =>
                  setFormData({ ...formData, time: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !formData.date
                        ? "Select a date first"
                        : getFilteredTimeSlots.length === 0
                        ? "No available time slots"
                        : "Select time"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredTimeSlots.length > 0 ? (
                    getFilteredTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      No available time slots
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {initialData && initialData?.interviewer_id
                ? "Update"
                : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
