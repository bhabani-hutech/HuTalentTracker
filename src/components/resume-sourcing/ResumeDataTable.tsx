import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  PenSquare,
  CalendarPlus,
  Trash2,
  User,
  FileText,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

import { Candidate } from "@/lib/api/candidates";

interface ResumeDataTableProps {
  candidates: Candidate[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (candidate: Candidate) => void;
  onViewResume: (candidate: Candidate) => void;
  onViewProfile: (candidate: Candidate) => void;
  onScheduleInterview: (candidate: Candidate) => void;
}

const getScoreColor = (score?: number): string => {
  if (!score && score !== 0) return "bg-gray-500 hover:bg-gray-600 text-white";
  if (score >= 90) return "bg-green-500 hover:bg-green-600 text-white";
  if (score >= 80) return "bg-blue-500 hover:bg-blue-600 text-white";
  if (score >= 70) return "bg-yellow-500 hover:bg-yellow-600 text-white";
  if (score >= 50) return "bg-orange-500 hover:bg-orange-600 text-white";
  return "bg-red-500 hover:bg-red-600 text-white";
};
const getSourceColor = (partner?: string): string => {
  const baseStyles =
    "inline-flex items-center justify-center px-2 py-1 min-w-[50px] rounded-[7px] text-xs font-medium text-white transition-colors duration-200 text-center";

  if (!partner && partner !== "")
    return `${baseStyles} bg-gray-500 hover:bg-gray-600`;

  if (partner === "Direct Apply")
    return `${baseStyles} bg-[#3F7D58] hover:bg-[#33664A]`;

  if (partner === "Hiring Partner")
    return `${baseStyles} bg-[#102E50] hover:bg-[#0C2340]`;

  return `${baseStyles} bg-red-500 hover:bg-red-600`;
};

export function ResumeDataTable({
  candidates,
  isLoading,
  onDelete,
  onEdit,
  onViewResume,
  onViewProfile,
  onScheduleInterview,
}: ResumeDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = currentPage * resultsPerPage;
  const { toast } = useToast();
  if (isLoading) {
    return (
      <div className="w-full text-center py-8">
        <p>Loading candidates...</p>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p>No candidates found</p>
      </div>
    );
  }

  const totalPages = Math.ceil(candidates.length / resultsPerPage);

  const paginatedCandidates = candidates.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error("Error deleting candidate:", error);
        // alert("Error deleting candidate");
        toast({
          variant: "destructive",
          title: "Conflict Error",
          description:
            "Cannot delete candidate due to a conflict. The candidate may be linked to another resource.",
        });
      }
    }
  };
  console.log(paginatedCandidates, totalPages);
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Resume Score</TableHead>
            <TableHead>Notice Period</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCandidates.map((candidate) => (
            <TableRow key={candidate.id} className="hover:bg-gray-100">
              <TableCell>{candidate.name}</TableCell>
              <TableCell>{candidate.position || "N/A"}</TableCell>
              <TableCell>{candidate.department || "N/A"}</TableCell>
              <TableCell>
                <div className={getSourceColor(candidate.candidate_source)}>
                  {candidate.candidate_source === "Hiring Partner"
                    ? `${candidate.Organization?.name}`
                    : "Self"}
                </div>
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
              {/* <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewResume(candidate)}
                  disabled={!candidate.file_url}
                  className={!candidate.file_url ? "opacity-50" : ""}
                  title="View Resume"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewProfile(candidate)}
                  title="View Profile"
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onScheduleInterview(candidate)}
                  title="Schedule Interview"
                >
                  <CalendarPlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(candidate)}
                  title="Edit Candidate"
                >
                  <PenSquare className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(candidate.id)}
                  className="text-red-500 hover:text-red-600"
                  title="Delete Candidate"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell> */}

              <TableCell className="text-right">
                {/* First 3 buttons visible */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewResume(candidate)}
                  disabled={!candidate.file_url}
                  className={!candidate.file_url ? "opacity-50" : ""}
                  title="View Resume"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewProfile(candidate)}
                  title="View Profile"
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onScheduleInterview(candidate)}
                  title="Schedule Interview"
                >
                  <CalendarPlus className="h-4 w-4" />
                </Button>

                {/* Last 2 buttons inside dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="More actions">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(candidate)}>
                      <PenSquare className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(candidate.id)}
                      className="text-red-500 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {/* {totalPages > 1 && (
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
      )} */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          {/* Pagination Info */}
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, paginatedCandidates.length)} of{" "}
            {paginatedCandidates.length} interviews
          </div>

          {/* Pagination Controls */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
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
        </div>
      )}
    </div>
  );
}
