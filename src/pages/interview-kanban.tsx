import { useState } from "react";
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
  const { jobs, isLoading } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string>("");

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
      <KanbanBoard selectedJobId={selectedJobId} />
    </div>
  );
}
