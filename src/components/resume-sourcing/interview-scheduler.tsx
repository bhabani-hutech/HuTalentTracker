import { useState } from "react";
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

interface InterviewSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    name: string;
    position: string;
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
  const { toast } = useToast();
  const { data: interviewers } = useInterviewers();

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

      // Create the interview
      const interviewData = {
        candidate_id: candidate.id,
        interviewer_id: interviewerId,
        date: new Date(`${format(date, "yyyy-MM-dd")}T${time}`).toISOString(),
        type: interviewType,
        status: "HR round",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Candidate</Label>
            <Input
              value={`${candidate.name} - ${candidate.position}`}
              disabled
            />
          </div>

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
