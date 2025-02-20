import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { useState, useEffect } from "react";
import { Candidate } from "@/lib/api/candidates";

interface EditCandidateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Candidate>) => Promise<void>;
  candidate: Candidate | null;
}


interface ApplicationData extends Candidate {
  location?: string;
  skills?: string;
  type?: "Full Time" | "Part Time" | "Contract" | "Internship";
  experience?: string;
}

export function EditCandidateDialog({
  isOpen,
  onClose,
  onSubmit,
  candidate,
}: EditCandidateDialogProps) {
  const [formData, setFormData] = useState<Partial<ApplicationData>>({});

  // Update form data when candidate changes
  console.log(candidate);
  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position,
         location: candidate.location,
       skills: candidate.skills,
       type: candidate.type,
        experience: candidate.experience,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                required
                value={formData.position || ""}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                required
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g. New York, NY"
              />
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                required
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                required
                type="tel"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label>Notice Period</Label>
              <Input
                required
                value={formData.notice_period || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notice_period: e.target.value })
                }
                placeholder="e.g. 30 days"
              />
            </div>

            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={formData.type || "Full Time"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as ApplicationData["type"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input
                required
                value={formData.experience || ""}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                placeholder="e.g. 5 years"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <Textarea
              required
              value={formData.skills || ""}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              placeholder="Enter your skills (separated by commas)"
              className="min-h-[100px]"
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
