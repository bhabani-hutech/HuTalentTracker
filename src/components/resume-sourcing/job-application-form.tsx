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
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import { createCandidate } from "@/lib/api/candidates";

interface JobApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApplicationData {
  name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  notice_period: string;
  skills: string;
  type: "Full Time" | "Part Time" | "Contract" | "Internship";
  experience: string;
}

export function JobApplicationForm({
  isOpen,
  onClose,
}: JobApplicationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ApplicationData>({
    name: "",
    email: "",
    phone: "",
    position: "",
    location: "",
    notice_period: "",
    skills: "",
    type: "Full Time",
    experience: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCandidate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        notice_period: formData.notice_period,
        source: "Direct Application",
        match_score: 0, // This would be calculated based on job requirements
      });

      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit application",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Job Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                required
                value={formData.position}
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
                value={formData.location}
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
                value={formData.name}
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
                value={formData.email}
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
                value={formData.phone}
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
                value={formData.notice_period}
                onChange={(e) =>
                  setFormData({ ...formData, notice_period: e.target.value })
                }
                placeholder="e.g. 30 days"
              />
            </div>

            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ApplicationData["type"]) =>
                  setFormData({ ...formData, type: value })
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
                value={formData.experience}
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
              value={formData.skills}
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
            <Button type="submit">Submit Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
