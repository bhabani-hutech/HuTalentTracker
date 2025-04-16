import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Candidate } from "@/lib/api/candidates";
import { Download, FileText } from "lucide-react";
import { useState } from "react";

interface ViewResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

export function ViewResumeModal({
  isOpen,
  onClose,
  candidate,
}: ViewResumeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!candidate) return null;
  const handleDownload = async () => {
    const response = await fetch(candidate.file_url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };
  const getColor = () => {
    if (candidate?.match_score >= 80) return "bg-green-500";
    if (candidate?.match_score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };
  console.log(candidate);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[880px] max-h-[90vh] overflow-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Candidate Basic Info */}
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">
              {candidate.name} ({candidate.position})
            </h3>
            <div className="w-full">
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Match Score</span>
                <span>{candidate?.match_score}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div
                  className={`h-3 rounded-full ${getColor()}`}
                  style={{ width: `${candidate?.match_score}%` }}
                ></div>
              </div>
            </div>
            {/* <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Position: </span>
                {candidate.position || "N/A"}
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                {candidate.email}
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                {candidate.phone || "N/A"}
              </div>
              <div>
                <span className="text-muted-foreground">Location: </span>
                {candidate.location || "N/A"}
              </div>
            </div> */}
          </div>

          {/* Resume Content or Embed */}
          <div className="border rounded-md p-2 min-h-[400px] flex flex-col items-center justify-center">
            {candidate.file_url ? (
              <div className="w-full h-full">
                {candidate.file_url.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={`${candidate.file_url}#toolbar=0`}
                    className="w-full h-[400px] border-0"
                    title={`${candidate.name}'s Resume`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px]">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">
                      This document cannot be previewed directly.
                      <br />
                      Please use the Download button to view it.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  No resume available for this candidate.
                </p>
              </div>
            )}
          </div>

          {/* Skills Section */}
          {/* {candidate.skills && (
            <div className="space-y-2">
              <h3 className="text-md font-semibold">Skills</h3>
              <p className="text-sm">{candidate.skills}</p>
            </div>
          )} */}

          {/* Experience Section */}
          {/* {candidate.experience && (
            <div className="space-y-2">
              <h3 className="text-md font-semibold">Experience</h3>
              <p className="text-sm">{candidate.experience}</p>
            </div>
          )} */}
        </div>

        <DialogFooter className="gap-2">
          {candidate.file_url && (
            <Button
              onClick={handleDownload}
              className="gap-2"
              disabled={isLoading || !candidate.file_url}
            >
              <Download className="h-4 w-4" />
              Download CV
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
