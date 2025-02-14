import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { FileText } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { Interview } from "@/lib/api/interviews";
import { useInterviewers } from "@/lib/api/hooks/useInterviewers";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useNavigate } from "react-router-dom";

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
  const { data: interviewers } = useInterviewers();
  const { data: candidates } = useCandidates();
  const navigate = useNavigate();

  // Set default form state for a new interview or edit
  const [formData, setFormData] = useState<Partial<Interview>>({
    candidate_id: "",
    interviewer_id: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: "technical",
    status: "Offered",
  });

  // Populate form data if editing
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        candidate_id: initialData.candidate_id,
        interviewer_id: initialData.interviewer_id,
        date: format(new Date(initialData.date), "yyyy-MM-dd'T'HH:mm"),
        type: initialData.type.toLowerCase(),
        status: initialData.status,
      });
    } else if (isOpen && !initialData) {
      // Clear data when opening for new interview
      setFormData({
        candidate_id: "",
        interviewer_id: "",
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        type: "technical",
        status: "Offered",
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
            {initialData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/interview-feedback?interview=${initialData.id}`)
                  // (window.location.href = `/interview-feedback?interview=${initialData.id}`)
                }
              >
                <FileText className="h-4 w-4 mr-2" />
                Add Feedback
              </Button>
            )}
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="culture">Culture Fit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Interview["status"]) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rejected in screening">
                  Rejected In Screening
                </SelectItem>
                <SelectItem value="Rejected -1">Rejected In -1</SelectItem>
                <SelectItem value="Rejected in -2">Rejected In -2</SelectItem>
                <SelectItem value="Cleared">Cleared</SelectItem>

                <SelectItem value="HR round">HR Round</SelectItem>
                <SelectItem value="Offered">Offered</SelectItem>
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
