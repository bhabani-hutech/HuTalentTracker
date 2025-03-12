import { useState, useEffect } from "react";
import { useCandidateMovement } from "@/lib/api/hooks/useCandidateMovement";
import { KanbanBoard } from "@/components/interview-kanban/kanban-board";
import { useJobs } from "@/lib/api/hooks/useJobs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function InterviewKanban() {
  // Initialize the candidate movement system
  useCandidateMovement();
  const { jobs, isLoading } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  // Auto-select the first job if none is selected
  useEffect(() => {
    if (!isLoading && !selectedJobId && jobs && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId, isLoading]);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Interview Pipeline
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Track candidates through interview stages for
          </p>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue>
                {jobs?.find((job) => job.id === selectedJobId)?.title ||
                  "Select job posting"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" className="w-[300px]">
              {jobs?.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{job.title}</span>
                    <Badge variant="secondary" className="ml-2">
                      {job.openings || 1} opening{job.openings !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {selectedJobId ? (
        <KanbanBoard selectedJobId={selectedJobId} />
      ) : (
        <div className="flex items-center justify-center h-[60vh] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              {isLoading ? "Loading..." : "No job selected"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isLoading
                ? "Please wait while we load job positions"
                : "Please select a job position to view the interview pipeline"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
