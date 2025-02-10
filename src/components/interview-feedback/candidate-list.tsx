import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter, MessageSquare, PenSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

interface Candidate {
  id: string;
  name: string;
  position: string;
  interviewDate: string;
  round: string;
  interviewer: string;
  status:
    | "Rejected in screening"
    | "Rejected -1"
    | "Rejected in -2"
    | "Cleared"
    | "HR round"
    | "Offered";
}

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "John Smith",
    position: "Senior Frontend Developer",
    interviewDate: "2024-03-25",
    round: "Technical Round 1",
    interviewer: "Alex Johnson",
    status: "Cleared",
  },
  {
    id: "2",
    name: "Sarah Wilson",
    position: "UX Designer",
    interviewDate: "2024-03-24",
    round: "HR Round",
    interviewer: "Emma Davis",
    status: "HR round",
  },
  {
    id: "3",
    name: "Michael Brown",
    position: "Full Stack Developer",
    interviewDate: "2024-03-23",
    round: "Technical Round 2",
    interviewer: "David Miller",
    status: "Rejected in -2",
  },
];

interface CandidateListProps {
  onFeedback: (candidate: Candidate) => void;
}

export function CandidateList({ onFeedback }: CandidateListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interviewed Candidates</CardTitle>
          <div className="flex items-center gap-2">
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
                <TableHead>Round</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">
                    {candidate.name}
                  </TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>{candidate.interviewDate}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{candidate.round}</Badge>
                  </TableCell>
                  <TableCell>{candidate.interviewer}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // Handle viewing feedback
                          console.log("View feedback for:", candidate.id);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onFeedback(candidate)}
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
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {mockCandidates.length} candidates
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
    </Card>
  );
}

function getStatusColor(status: Candidate["status"]): string {
  switch (status) {
    case "HR round":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "Cleared":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "Rejected in screening":
    case "Rejected -1":
    case "Rejected in -2":
      return "bg-red-500 hover:bg-red-600 text-white";
    case "Offered":
      return "bg-purple-500 hover:bg-purple-600 text-white";
    default:
      return "";
  }
}
