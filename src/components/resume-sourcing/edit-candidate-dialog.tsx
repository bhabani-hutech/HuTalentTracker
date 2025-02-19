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
import { useState, useEffect } from "react";
import { Candidate } from "@/lib/api/candidates";

interface EditCandidateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Candidate>) => Promise<void>;
  candidate: Candidate | null;
}

export function EditCandidateDialog({
  isOpen,
  onClose,
  onSubmit,
  candidate,
}: EditCandidateDialogProps) {
  const [formData, setFormData] = useState<Partial<Candidate>>({});

  // Update form data when candidate changes
  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position,
        notice_period: candidate.notice_period,
      });
    }
  }, [candidate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    try {
      await onSubmit(candidate.id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating candidate:", error);
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Input
              value={formData.position || ""}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Notice Period</Label>
            <Input
              value={formData.notice_period || ""}
              onChange={(e) =>
                setFormData({ ...formData, notice_period: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
