import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter, Download, Eye, CalendarPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { ResumePreview } from "./resume-preview";
import { ResumeFilters } from "./resume-filters";
import { InterviewScheduler } from "./interview-scheduler";

interface Resume {
  id: string;
  name: string;
  position: string;
  source: string;
  date: string;
  matchScore: number;
  noticePeriod: string;
}

const mockResumes: Resume[] = [
  {
    id: "1",
    name: "John Smith",
    position: "Senior Frontend Developer",
    source: "LinkedIn",
    date: "2024-03-20",
    matchScore: 85,
    noticePeriod: "30 days",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    position: "UX Designer",
    source: "Naukri",
    date: "2024-03-19",
    matchScore: 92,
    noticePeriod: "60 days",
  },
  {
    id: "3",
    name: "Michael Brown",
    position: "Full Stack Developer",
    source: "Direct",
    date: "2024-03-18",
    matchScore: 78,
    noticePeriod: "15 days",
  },
  {
    id: "4",
    name: "Emily Davis",
    position: "Product Designer",
    source: "LinkedIn",
    date: "2024-03-17",
    matchScore: 88,
    noticePeriod: "45 days",
  },
  {
    id: "5",
    name: "David Wilson",
    position: "Backend Developer",
    source: "Naukri",
    date: "2024-03-16",
    matchScore: 95,
    noticePeriod: "30 days",
  },
];

export function ResumeList() {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleInterview, setScheduleInterview] = useState<Resume | null>(
    null,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Resumes</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="search" placeholder="Search resumes..." />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Match Score</TableHead>
                <TableHead>Notice Period</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockResumes.map((resume) => (
                <TableRow
                  key={resume.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedResume(resume)}
                >
                  <TableCell className="font-medium">{resume.name}</TableCell>
                  <TableCell>{resume.position}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{resume.source}</Badge>
                  </TableCell>
                  <TableCell>{resume.date}</TableCell>
                  <TableCell>
                    <Badge className={`${getScoreColor(resume.matchScore)}`}>
                      {resume.matchScore}%
                    </Badge>
                  </TableCell>
                  <TableCell>{resume.noticePeriod}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResume(resume);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScheduleInterview(resume);
                      }}
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing 5 of 42 results
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      <ResumePreview
        isOpen={!!selectedResume}
        onClose={() => setSelectedResume(null)}
        resume={selectedResume}
      />

      <ResumeFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(filters) => {
          console.log("Applied filters:", filters);
          setShowFilters(false);
        }}
      />

      <InterviewScheduler
        isOpen={!!scheduleInterview}
        onClose={() => setScheduleInterview(null)}
        candidate={scheduleInterview}
      />
    </Card>
  );
}

function getScoreColor(score: number): string {
  if (score >= 90) return "bg-green-500 hover:bg-green-600 text-white";
  if (score >= 80) return "bg-blue-500 hover:bg-blue-600 text-white";
  if (score >= 70) return "bg-yellow-500 hover:bg-yellow-600 text-white";
  return "bg-red-500 hover:bg-red-600 text-white";
}
