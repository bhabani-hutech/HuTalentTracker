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
import { Interview } from "@/lib/api/interviews";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useInterviewers } from "@/lib/api/hooks/useInterviewers";

interface InterviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Interview, "id" | "created_at" | "updated_at">) => void;
  initialData?: Interview;
}

export function InterviewForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: InterviewFormProps) {
  const [formData, setFormData] = useState<Partial<Interview>>({
    candidate_id: "",
    interviewer_id: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: "technical",
  });

  const { data: candidates } = useCandidates();
  const { data: interviewers } = useInterviewers();

  // Populate form data if editing
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        candidate_id: initialData.candidate_id,
        interviewer_id: initialData.interviewer_id,
        date: format(new Date(initialData.date), "yyyy-MM-dd'T'HH:mm"),
        type: initialData.type.toLowerCase(),
      });
    } else if (isOpen && !initialData) {
      setFormData({
        candidate_id: "",
        interviewer_id: "",
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        type: "technical",
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Interview, "id" | "created_at" | "updated_at">);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {initialData ? "Edit Interview" : "Schedule New Interview"}
            </DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    !formData.date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData?.date ? (
                    format(new Date(formData?.date), "PPP")
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

          <div className="space-y-2">
            <Label>Time</Label>
            <Select
              value={
                formData.date
                  ? formData.date.split("T")[1].slice(0, 5)
                  : "10:00"
              }
              onValueChange={(time) => {
                const [date] = formData.date?.split("T") || [""];
                setFormData({
                  ...formData,
                  date: `${date}T${time}:00`,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, hour) => [
                  `${hour.toString().padStart(2, "0")}:00`,
                  `${hour.toString().padStart(2, "0")}:30`,
                ])
                  .flat()
                  .map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
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
                {candidates?.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
