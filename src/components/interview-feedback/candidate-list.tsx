import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter, PenSquare, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { InterviewFeedback } from "@/types/database";

interface CandidateListProps {
  onFeedback: (feedback: InterviewFeedback | null) => void;
  feedbackData: InterviewFeedback[];
}

import { format } from "date-fns";
import { useFeedback } from "@/lib/api/hooks/useFeedback";

export function CandidateList({
  onFeedback,
  feedbackData,
}: CandidateListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { deleteFeedback } = useFeedback();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await deleteFeedback(id);
      } catch (error) {
        console.error("Error deleting feedback:", error);
        alert("Error deleting feedback");
      }
    }
  };

  const filteredFeedback =
    feedbackData?.filter((feedback) => {
      const candidateName = feedback.candidate?.name || "";
      const candidatePosition = feedback.candidate?.position || "";
      const query = searchQuery.toLowerCase();

      return (
        candidateName.toLowerCase().includes(query) ||
        candidatePosition.toLowerCase().includes(query)
      );
    }) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeedback = filteredFeedback.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interview Feedback</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="icon">
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
                <TableHead>Interview Date</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentFeedback.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell className="font-medium">
                    {feedback.candidate?.name}
                  </TableCell>
                  <TableCell>{feedback.candidate?.position}</TableCell>
                  <TableCell>
                    {feedback.interview?.date
                      ? format(new Date(feedback.interview.date), "PPp")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{feedback.interviewer?.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={getRecommendationColor(
                        feedback.recommendation,
                      )}
                    >
                      {feedback.recommendation}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onFeedback(feedback)}
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(feedback.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredFeedback.length)} of{" "}
            {filteredFeedback.length} entries
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getRecommendationColor(recommendation?: string): string {
  switch (recommendation) {
    case "Strong Hire":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "Hire":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "Maybe":
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "No Hire":
    case "Strong No Hire":
      return "bg-red-500 hover:bg-red-600 text-white";
    default:
      return "bg-gray-500 hover:bg-gray-600 text-white";
  }
}
