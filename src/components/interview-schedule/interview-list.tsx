import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  MessageSquare,
  Calendar,
  FileText,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { InterviewNotes } from "./interview-notes";
import { InterviewScheduler } from "./interview-scheduler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInterviews } from "@/lib/api/interviews";
import { supabase } from "@/lib/supabase";

function getProgressColor(status: string): string {
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

export function InterviewList() {
  const [interviews, setInterviews] = useState([]);
  const [showNotes, setShowNotes] = useState(null);
  const [showScheduler, setShowScheduler] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getInterviews();
        setInterviews(data);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      }
    };

    fetchInterviews();
  }, []);

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
              {interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell className="font-medium">
                    {interview.candidate?.name}
                  </TableCell>
                  <TableCell>{interview.candidate?.position}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>
                        {format(new Date(interview.date), "MMM dd, yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(interview.date), "HH:mm")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{interview.type}</Badge>
                  </TableCell>
                  <TableCell>{interview.interviewer?.name}</TableCell>
                  <TableCell>
                    <Badge className={getProgressColor(interview.status)}>
                      {interview.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={interview.status || "HR round"}
                      onValueChange={(value) => {
                        console.log(
                          `Changed status for ${interview.id} to ${value}`,
                        );
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Rejected in screening",
                          "Rejected -1",
                          "Rejected in -2",
                          "Cleared",
                          "HR round",
                          "Offered",
                        ].map((status) => (
                          <SelectItem key={status} value={status}>
                            <Badge className={getProgressColor(status)}>
                              {status}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        try {
                          const { data: existingFeedback } = await supabase
                            .from("feedback")
                            .select(
                              `
                              *,
                              interview:interviews!interview_id(*),
                              candidate:candidates!candidate_id(*),
                              interviewer:users!interviewer_id(*)
                              `,
                            )
                            .eq("interview_id", interview.id)
                            .single();
                          console.log(
                            "************************>>>>>>>Existing feedback",
                          );
                          cosnole.log(existingFeedback);

                          if (existingFeedback) {
                            // If feedback exists, show edit form
                            setSelectedFeedback(existingFeedback);
                          } else {
                            // If no feedback exists, show create form
                            setShowCreateForm(true);
                          }
                        } catch (error) {
                          console.error("Error checking feedback:", error);
                          // Fallback to create form
                          setShowCreateForm(true);
                        }
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Add Feedback</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowNotes({
                          id: interview.id,
                          name: interview.candidate?.name || "Unknown",
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
                          name: interview.candidate?.name || "Unknown",
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
            Showing {interviews.length} interviews
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
