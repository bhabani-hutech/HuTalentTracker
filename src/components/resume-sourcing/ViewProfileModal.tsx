import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Candidate } from "@/lib/api/candidates";
import { Badge } from "../ui/badge";

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

export function ViewProfileModal({
  isOpen,
  onClose,
  candidate,
}: ViewProfileModalProps) {
  if (!candidate) return null;

  const getScoreColor = (score?: number): string => {
    if (!score && score !== 0) return "bg-gray-500";
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Candidate Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{candidate.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{candidate.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{candidate.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{candidate.location || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Job Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{candidate.position || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{candidate.department || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employment Type</p>
                <p className="font-medium">{candidate.type || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notice Period</p>
                <p className="font-medium">
                  {candidate.notice_period || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Skills & Experience */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Skills & Experience</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium">{candidate.experience || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Match Score</p>
                <Badge className={getScoreColor(candidate.match_score)}>
                  {candidate.match_score !== undefined
                    ? `${candidate.match_score}%`
                    : "N/A"}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {candidate.skills
                    ? candidate.skills
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean)
                        .map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Source Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium">{candidate.source || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Candidate Source
                </p>
                <p className="font-medium">
                  {candidate.candidate_source || "N/A"}
                </p>
              </div>
              {/* {console.log(candidate)} */}
              {candidate.candidate_source === "Hiring Partner" && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Hiring Partner
                  </p>
                  <p className="font-medium">
                    {candidate.Organization?.name || "Unknown Partner"}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Date Added</p>
                <p className="font-medium">
                  {candidate.created_at
                    ? new Date(candidate.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
