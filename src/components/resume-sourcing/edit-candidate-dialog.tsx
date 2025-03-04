import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Candidate } from "@/lib/api/candidates";

interface EditCandidateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Candidate>) => Promise<void>;
  candidate: Candidate | null;
  jobs: { id: string; title: string }[];
}

export function EditCandidateDialog({
  isOpen,
  onClose,
  onSubmit,
  candidate,
  jobs,
}: EditCandidateDialogProps) {
  const { register, handleSubmit, setValue, watch, reset } =
    useForm<Partial<Candidate>>();

  // Populate form when candidate data is available
  useEffect(() => {
    if (candidate) {
      reset(candidate); // Reset the form with candidate details
    }
  }, [candidate, reset]);

  const submitForm = async (data: Partial<Candidate>) => {
    if (!candidate) return;
    try {
      await onSubmit(candidate.id, data);
      onClose();
    } catch (error) {
      console.error("Error updating candidate:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job</Label>
              <Select
                value={watch("job_id") || ""}
                onValueChange={(value) => setValue("job_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled>No jobs available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={watch("type") || ""}
                onValueChange={(value) => setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Experience</Label>
            <Select
              value={watch("experience") || ""}
              onValueChange={(value) => setValue("experience", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1 years">0-1 years</SelectItem>
                <SelectItem value="1-3 years">1-3 years</SelectItem>
                <SelectItem value="3-5 years">3-5 years</SelectItem>
                <SelectItem value="5+ years">5+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input {...register("location")} placeholder="e.g. New York, NY" />
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input {...register("name")} placeholder="Enter full name" />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              {...register("email")}
              type="email"
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <Label>Notice Period</Label>
            <Input {...register("notice_period")} placeholder="e.g. 30 days" />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <Textarea
              {...register("skills")}
              placeholder="Enter skills (comma-separated)"
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
