import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface InterviewRound {
  id?: number;
  name: string;
  description?: string;
  duration: number;
  round_order?: number;
  is_active?: boolean;
}

interface InterviewRoundFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InterviewRound) => void;
  initialData?: InterviewRound;
}

export function InterviewRoundForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: InterviewRoundFormProps) {
  const [formData, setFormData] = useState<InterviewRound>({
    name: "",
    description: "",
    duration: 30,
    round_order: 1,
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        description: "",
        duration: 30,
        round_order: 1,
        is_active: true,
      });
    }
  }, [initialData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Interview Round" : "Add Interview Round"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Round Name</Label>
            <Input
              placeholder="Enter round name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Enter round description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              min="15"
              max="180"
              placeholder="Enter round duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: parseInt(e.target.value) || 30,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Round Order</Label>
            <Input
              type="number"
              min="1"
              placeholder="Enter round order"
              value={formData.round_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  round_order: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(formData)}>
            {initialData ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
