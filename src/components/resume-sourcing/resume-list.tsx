import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Search,
  Filter,
  Download,
  Eye,
  CalendarPlus,
  Trash2,
  PenSquare,
} from "lucide-react";
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
import { Candidate } from "@/lib/api/candidates";

interface ResumeListProps {
  candidates: Candidate[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (candidate: Candidate) => void;
}

const getScoreColor = (score?: number): string => {
  if (!score) return "bg-gray-500 hover:bg-gray-600 text-white";
  if (score >= 90) return "bg-green-500 hover:bg-green-600 text-white";
  if (score >= 80) return "bg-blue-500 hover:bg-blue-600 text-white";
  if (score >= 70) return "bg-yellow-500 hover:bg-yellow-600 text-white";
  return "bg-red-500 hover:bg-red-600 text-white";
};

export function ResumeList({
  candidates,
  isLoading,
  onDelete,
  onEdit,
}: ResumeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleInterview, setScheduleInterview] = useState<Candidate | null>(
    null,
  );
  const resultsPerPage = 10;

  // Handle empty or loading state
  if (!candidates || isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Resumes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search candidates..."
                  disabled
                />
                <Button type="submit" size="icon" disabled>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="icon" disabled>
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
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {isLoading ? "Loading..." : "No candidates found"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing 0 of 0 results
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCandidates.length / resultsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage,
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
                placeholder="Search candidates..."
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedCandidates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No candidates found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCandidates?.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <TableCell className="font-medium">
                      {candidate.name}
                    </TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{candidate.source}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(
                        candidate?.created_at || "",
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getScoreColor(candidate?.match_score)}>
                        {candidate.match_score || 0}%
                      </Badge>
                    </TableCell>
                    <TableCell>{candidate?.notice_period || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(candidate);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(candidate);
                        }}
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setScheduleInterview(candidate);
                        }}
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </Button>
                      {candidate.file_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(candidate.file_url, "_blank");
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              "Are you sure you want to delete this candidate?",
                            )
                          ) {
                            onDelete(candidate.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            {Math.min(currentPage * resultsPerPage, filteredCandidates?.length)}{" "}
            of {filteredCandidates?.length} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      <ResumePreview
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
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
