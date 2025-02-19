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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Interview Pipeline
        </h1>
        <p className="text-muted-foreground mb-8">
          Track candidates through interview stages
        </p>
      </div>
      <div className="flex justify-center mb-8">
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
      <KanbanBoard selectedJobId={selectedJobId} />
    </div>
  );
}
