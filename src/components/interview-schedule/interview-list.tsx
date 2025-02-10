import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter, MessageSquare, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { InterviewNotes } from "./interview-notes";
import { InterviewScheduler } from "./interview-scheduler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Interview {
  id: string;
  candidateName: string;
  position: string;
  date: Date;
  time: string;
  type: string;
  status:
    | "Rejected in screening"
    | "Rejected -1"
    | "Rejected in -2"
    | "Cleared"
    | "HR round"
    | "Offered";
  interviewer: string;
}

const mockInterviews: Interview[] = [
  {
    id: "1",
    candidateName: "John Smith",
    position: "Senior Frontend Developer",
    date: new Date(2024, 3, 25),
    time: "10:00 AM",
    type: "Technical Round",
    status: "HR round",
    interviewer: "Alex Johnson",
  },
  {
    id: "2",
    candidateName: "Sarah Wilson",
    position: "UX Designer",
    date: new Date(2024, 3, 25),
    time: "2:30 PM",
    type: "HR Round",
    status: "Cleared",
    interviewer: "Emma Davis",
  },
  {
    id: "3",
    candidateName: "Michael Brown",
    position: "Full Stack Developer",
    date: new Date(2024, 3, 26),
    time: "11:00 AM",
    type: "Technical Round",
    status: "Rejected in -2",
    interviewer: "David Miller",
  },
  {
    id: "4",
    candidateName: "Emily Davis",
    position: "Product Designer",
    date: new Date(2024, 3, 24),
    time: "3:00 PM",
    type: "HR Round",
    status: "Offered",
    interviewer: "Sophie Wilson",
  },
  {
    id: "5",
    candidateName: "James Wilson",
    position: "Backend Developer",
    date: new Date(2024, 3, 24),
    time: "4:30 PM",
    type: "Technical Round",
    status: "Rejected in screening",
    interviewer: "Robert Taylor",
  },
];

export function InterviewList() {
  const [showNotes, setShowNotes] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showScheduler, setShowScheduler] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Interviews</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="search" placeholder="Search interviews..." />
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
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell className="font-medium">
                    {interview.candidateName}
                  </TableCell>
                  <TableCell>{interview.position}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{format(interview.date, "MMM dd, yyyy")}</div>
                      <div className="text-sm text-muted-foreground">
                        {interview.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{interview.type}</Badge>
                  </TableCell>
                  <TableCell>{interview.interviewer}</TableCell>
                  <TableCell>
                    <Badge className={getProgressColor(interview.status)}>
                      {interview.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={interview.status}
                      onValueChange={(value) => {
                        console.log(
                          `Changed status for ${interview.id} to ${value}`,
                        );
                        // Here you would update the status in your data store
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rejected in screening">
                          <Badge className="bg-red-500">
                            Rejected in screening
                          </Badge>
                        </SelectItem>
                        <SelectItem value="Rejected -1">
                          <Badge className="bg-red-500">Rejected -1</Badge>
                        </SelectItem>
                        <SelectItem value="Rejected in -2">
                          <Badge className="bg-red-500">Rejected in -2</Badge>
                        </SelectItem>
                        <SelectItem value="Cleared">
                          <Badge className="bg-green-500">Cleared</Badge>
                        </SelectItem>
                        <SelectItem value="HR round">
                          <Badge className="bg-blue-500">HR round</Badge>
                        </SelectItem>
                        <SelectItem value="Offered">
                          <Badge className="bg-purple-500">Offered</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowNotes({
                          id: interview.id,
                          name: interview.candidateName,
                        })
                      }
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowScheduler({
                          id: interview.id,
                          name: interview.candidateName,
                        })
                      }
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {mockInterviews.length} interviews
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

      <InterviewNotes
        isOpen={!!showNotes}
        onClose={() => setShowNotes(null)}
        interviewId={showNotes?.id || ""}
        candidateName={showNotes?.name || ""}
      />

      <InterviewScheduler
        isOpen={!!showScheduler}
        onClose={() => setShowScheduler(null)}
        interviewId={showScheduler?.id || ""}
        candidateName={showScheduler?.name || ""}
      />
    </Card>
  );
}

function getProgressColor(status: Interview["status"]): string {
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
