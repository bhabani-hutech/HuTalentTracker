import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types/database";
import { Link2 } from "lucide-react";

interface JobPreviewModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobPreviewModal({
  job,
  isOpen,
  onClose,
}: JobPreviewModalProps) {
  if (!job) return null;

  const jobUrl = `${window.location.origin}/careers/${job.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{job.title}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{job.type}</Badge>
              <Badge variant="secondary">{job.level}</Badge>
              <Badge variant="secondary">{job.department}</Badge>
              <Badge variant="secondary">{job.location}</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground">{job.description}</p>
            </div>

            {job.requirements.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="text-muted-foreground">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsibilities.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="text-muted-foreground">
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(jobUrl);
                  alert("Job posting URL copied to clipboard!");
                }}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Copy Job Posting URL
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
