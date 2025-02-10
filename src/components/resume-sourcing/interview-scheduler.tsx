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
import { CalendarIcon, Clock } from "lucide-react";
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
  candidate: {
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

  if (!candidate) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
            <Select defaultValue="technical">
              <SelectTrigger>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Round</SelectItem>
                <SelectItem value="hr">HR Round</SelectItem>
                <SelectItem value="manager">Manager Round</SelectItem>
                <SelectItem value="culture">Culture Fit</SelectItem>
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
            <Label>Interviewer Email</Label>
            <Input type="email" placeholder="interviewer@company.com" />
          </div>

          <div className="space-y-2">
            <Label>Additional Participants (Optional)</Label>
            <Input
              type="text"
              placeholder="email1@company.com, email2@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Meeting Link</Label>
            <Input type="url" placeholder="https://meet.google.com/..." />
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input placeholder="Any special instructions or notes" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Here you would integrate with your calendar API
              console.log("Scheduling interview for:", {
                candidate,
                date,
                time,
              });
              onClose();
            }}
          >
            Schedule & Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
