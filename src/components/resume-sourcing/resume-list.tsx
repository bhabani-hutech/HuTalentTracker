import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EditCandidateDialog } from "./edit-candidate-dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { v4 as uuidv4 } from "uuid";
import {
  Search,
  Filter,
  Download,
  Eye,
  CalendarPlus,
  Trash2,
  PenSquare,
  UserPlus,
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
import { Candidate, createCandidate } from "@/lib/api/candidates";
import { getJobs } from "@/lib/api/jobs"; // Ensure this is correctly imported

// Define the Job interface
interface Job {
  id: string; // UUID
  title: string;
}

interface ResumeListProps {
  candidates: Candidate[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, updates: Partial<Candidate>) => Promise<void>;
}

const getScoreColor = (score?: number): string => {
  if (!score && score !== 0) return "bg-gray-500 hover:bg-gray-600 text-white";
  if (score >= 90) return "bg-green-500 hover:bg-green-600 text-white";
  if (score >= 80) return "bg-blue-500 hover:bg-blue-600 text-white";
  if (score >= 70) return "bg-yellow-500 hover:bg-yellow-600 text-white";
  if (score >= 50) return "bg-orange-500 hover:bg-orange-600 text-white";
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
    null
  );
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleInterview, setScheduleInterview] = useState<Candidate | null>(
    null
  );
  const resultsPerPage = 10;

  // State for job listings
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await getJobs();
        console.log("Fetched jobs:", data);
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    }
    fetchJobs();
  }, []);

  if (!candidates || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Resumes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {isLoading ? "Loading..." : "No candidates found"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCandidates.length / resultsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Resumes</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            {/* <Button
              onClick={() =>
                setEditingCandidate({
                  name: "",
                  email: "",
                  phone: "",
                  position: "",
                  notice_period: "",
                  source: "Direct Application",
                  experience: "",
                  type: "Full Time",
                  skills: [],
                  location: "",
                  match_score: 0,
                  created_at: new Date().toISOString(),
                  file_url: "",
                  job_id: null,
                  stage_id: 1, // Default to Screening stage
                })
              }
            >
              <UserPlus className="h-4 w-4 mr-2" /> Apply Directly
            </Button>*/}
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
            {paginatedCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              paginatedCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="hover:bg-gray-100">
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>
                    {jobs.find((job) => job.id === candidate.job_id)?.title ||
                      candidate.position ||
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{candidate.source}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(candidate?.created_at || "").toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getScoreColor(candidate.match_score)}>
                      {candidate.match_score !== undefined
                        ? `${candidate.match_score}%`
                        : "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>{candidate.notice_period || "N/A"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCandidate(candidate)}
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setScheduleInterview(candidate)}
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        candidate.file_url
                          ? window.open(candidate.file_url, "_blank")
                          : null
                      }
                      disabled={!candidate.file_url}
                      className={!candidate.file_url ? "opacity-50" : ""}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(candidate.id)}
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
      </CardContent>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <EditCandidateDialog
        isOpen={!!editingCandidate}
        onClose={() => setEditingCandidate(null)}
        onSubmit={async (id, updates) => {
          console.log(updates, "updatesupdatesupdatesupdates");
          if (!id) {
            // Create new candidate if ID is empty (Apply Directly case)
            await createCandidate({
              ...updates,
              name: updates.name || "Unnamed Candidate",
              email: updates.email || "noemail@example.com",
              stage_id: 1,
              experience: updates.experience || "0-1 years",
              type: updates.type || "Full Time",
              skills: updates.skills || "",
              location: updates.location || "Remote",
              position: updates.position || "Unspecified Position",
              candidate_source: updates.candidate_source || "Direct Apply",
              hiring_partner_id: updates.hiring_partner_id || null,
              job_id: updates.job_id ?? null, // Ensure job_id is explicitly defined
              source: updates.source || "Direct Application", // Ensure source is provided
            });
          } else {
            // Otherwise, update candidate
            await onEdit(id, updates);
          }
          setEditingCandidate(null);
        }}
        candidate={editingCandidate}
        jobs={jobs}
      />

      <ResumePreview
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        resume={selectedCandidate}
      />

      <InterviewScheduler
        isOpen={!!scheduleInterview}
        onClose={() => setScheduleInterview(null)}
        candidate={scheduleInterview}
      />
    </Card>
  );
}
