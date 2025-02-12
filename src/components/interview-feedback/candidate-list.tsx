import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter, PenSquare } from "lucide-react";
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

export function CandidateList({
  onFeedback,
  feedbackData,
}: CandidateListProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interview Feedback</CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={() => onFeedback(null)}>
              <PenSquare className="h-4 w-4 mr-2" />
              New Feedback
            </Button>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              {filteredFeedback.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell className="font-medium">
                    {feedback.candidate?.name}
                  </TableCell>
                  <TableCell>{feedback.candidate?.position}</TableCell>
                  <TableCell>
                    {new Date(feedback.created_at || "").toLocaleDateString()}
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
