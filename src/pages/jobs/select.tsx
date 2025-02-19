import { useState, useMemo } from "react";
import { useJobs } from "@/lib/api/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/icons";

export default function JobSelection() {
  const { jobs, isLoading } = useJobs();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  // Get unique departments from jobs
  const departments = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map((job) => job.department))).sort();
  }, [jobs]);

  // Filter jobs by selected department
  const departmentJobs = useMemo(() => {
    if (!jobs || !selectedDepartment) return [];
    return jobs.filter(
      (job) =>
        job.department === selectedDepartment && job.status === "Published",
    );
  }, [jobs, selectedDepartment]);

  // Get selected job details
  const selectedJob = useMemo(() => {
    if (!jobs || !selectedJobId) return null;
    return jobs.find((job) => job.id === selectedJobId);
  }, [jobs, selectedJobId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Selection</h1>
        <p className="text-muted-foreground">
          Select a department and job position
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={selectedDepartment}
                onValueChange={(value) => {
                  setSelectedDepartment(value);
                  setSelectedJobId(""); // Reset job selection when department changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Job Title</Label>
              <Select
                value={selectedJobId}
                onValueChange={setSelectedJobId}
                disabled={!selectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job title" />
                </SelectTrigger>
                <SelectContent>
                  {departmentJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedJob ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedJob.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedJob.department} · {selectedJob.location} ·{" "}
                    {selectedJob.type}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm">{selectedJob.description}</p>
                </div>

                {selectedJob.requirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Requirements</h4>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedJob.responsibilities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Responsibilities</h4>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {selectedJob.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedJob.salary_min || selectedJob.salary_max) && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Salary Range</h4>
                    <p className="text-sm">
                      {selectedJob.salary_min && `$${selectedJob.salary_min}`}
                      {selectedJob.salary_min &&
                        selectedJob.salary_max &&
                        " - "}
                      {selectedJob.salary_max && `$${selectedJob.salary_max}`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a department and job title to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
