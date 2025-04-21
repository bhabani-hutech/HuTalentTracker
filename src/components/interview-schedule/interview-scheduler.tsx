import { useState } from "react";
import { createInterview, updateInterview } from "@/lib/api/interviews";
import { useToast } from "@/components/ui/use-toast";
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

interface InterviewSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
  candidateName: string;
  candidateId?: string;
  jobId?: string;
  jobTitle?: string;
}

export function InterviewScheduler({
  isOpen,
  onClose,
  interviewId,
  candidateName,
  candidateId,
  jobId,
  jobTitle,
}: InterviewSchedulerProps) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("10:00");
  const [interviewType, setInterviewType] = useState<string>("online");
  const [interviewRound, setInterviewRound] = useState<string>("");
  const [interviewerEmail, setInterviewerEmail] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const { toast } = useToast();

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

  const interviewRounds = [
    "Technical Round",
    "HR Round",
    "Managerial Round",
    "Final Round",
    "Screening",
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!date) {
      setError("Please select a date");
      return;
    }

    if (!interviewRound) {
      setError("Please select an interview round");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Format the date and time for the database
      const formattedDate = date
        ? `${format(date, "yyyy-MM-dd")}T${time}:00`
        : "";

      // Prepare the interview data
      const interviewData = {
        candidate_id: candidateId,
        job_id: jobId,
        date: formattedDate,
        type: interviewType,
        status: "HR round", // Default status
        // Find the round_id based on the selected round name
        // For now, we'll pass the name and handle it in the API
        round_id: interviewRound,
        feedback: "",
        rating: 0,
        // Additional fields
        interviewer_email: interviewerEmail,
        meeting_link: meetingLink,
        reason: reason,
      };

      // Create or update the interview
      if (interviewId) {
        await updateInterview(interviewId, interviewData);
        toast({
          title: "Interview Rescheduled",
          description: `Interview for ${candidateName} has been rescheduled successfully.`,
        });
      } else {
        await createInterview(interviewData);
        toast({
          title: "Interview Scheduled",
          description: `Interview for ${candidateName} has been scheduled successfully.`,
        });
      }

      setSuccess(true);
      onClose();
    } catch (err) {
      console.error("Error saving interview:", err);
      setError("Failed to save interview. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save interview. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {interviewId ? "Reschedule" : "Schedule"} Interview -{" "}
            {candidateName}
            {jobTitle && (
              <span className="block text-sm text-muted-foreground mt-1">
                Position: {jobTitle}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="face-to-face">Face-to-Face</SelectItem>
                <SelectItem value="online">Online</SelectItem>
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
            <Select defaultValue={time} onValueChange={setTime}>
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
            <Label>Interview Round</Label>
            <Select value={interviewRound} onValueChange={setInterviewRound}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview round" />
              </SelectTrigger>
              <SelectContent>
                {interviewRounds.map((round) => (
                  <SelectItem key={round} value={round}>
                    {round}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Interviewer Email</Label>
            <Input
              type="email"
              placeholder="interviewer@company.com"
              value={interviewerEmail}
              onChange={(e) => setInterviewerEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Meeting Link</Label>
            <Input
              type="url"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>

          {interviewId && (
            <div className="space-y-2">
              <Label>Reason for Rescheduling</Label>
              <Input
                placeholder="Brief reason for rescheduling"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : interviewId
                ? "Reschedule"
                : "Schedule"}{" "}
            & Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
