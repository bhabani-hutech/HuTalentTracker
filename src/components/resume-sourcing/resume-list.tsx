import { useState, useEffect } from "react";
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
import { getCandidates } from "@/lib/api/candidates";

interface Resume {
  id: string;
  name: string;
  position: string;
  source: string;
  date: string;
  matchScore: number;
  noticePeriod: string;
}

export function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [filteredResumes, setFilteredResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleInterview, setScheduleInterview] = useState<Resume | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const resultsPerPage = 5;

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const candidates = await getCandidates();
        const formattedResumes = candidates.map((candidate: any) => ({
          id: candidate.id,
          name: candidate.name,
          position: candidate.position,
          source: candidate.source || "Direct",
          date: candidate.created_at?.split("T")[0] || "",
          matchScore: candidate.match_score || 0,
          noticePeriod: candidate.notice_period || "Not specified",
        }));

        setResumes(formattedResumes);
        setFilteredResumes(formattedResumes);
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    };

    fetchResumes();
  }, []);

  useEffect(() => {
    const filtered = resumes.filter((resume) =>
      resume.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredResumes(filtered);
  }, [searchTerm, resumes]);

  const totalPages = Math.ceil(filteredResumes.length / resultsPerPage);
  const paginatedResumes = filteredResumes.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Resumes</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
              {paginatedResumes.map((resume) => (
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
                    <Badge className={getScoreColor(resume.matchScore)}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implement file download logic here
                        alert(`Downloading resume of ${resume.name}`);
                      }}
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
            Showing {Math.min(page * resultsPerPage, filteredResumes.length)} of{" "}
            {filteredResumes.length} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
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

// Function to get color based on match score
function getScoreColor(score: number): string {
  if (score >= 90) return "bg-green-500 hover:bg-green-600 text-white";
  if (score >= 80) return "bg-blue-500 hover:bg-blue-600 text-white";
  if (score >= 70) return "bg-yellow-500 hover:bg-yellow-600 text-white";
  return "bg-red-500 hover:bg-red-600 text-white";
}
