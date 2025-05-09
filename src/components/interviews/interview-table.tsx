import { useState } from "react";
import { Button } from "../ui/button";
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
import { Trash2, FileText, PenSquare } from "lucide-react";
import { Interview } from "@/lib/api/interviews";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface InterviewTableProps {
  interviews: Interview[];
  onEdit: (interview: Interview) => void;
  onDelete: (id: string) => void;
}

export function InterviewTable({
  interviews,
  onEdit,
  onDelete,
}: InterviewTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStatusColor = (status: Interview["status"]) => {
    switch (status) {
      case "Offered":
        return "bg-blue-500 hover:bg-blue-600";
      case "Cleared":
        return "bg-green-500 hover:bg-green-600";
      case "Rejected in screening":
      case "Rejected -1":
      case "Rejected in -2":
        return "bg-red-500 hover:bg-red-600";
      case "HR round":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No date available";
    const date = new Date(dateString);
    const isValidDate = !isNaN(date.getTime());
    return isValidDate ? format(date, "PPpp") : "Invalid date";
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Round</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews?.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell className="font-medium">
                  {interview.candidate?.name}
                </TableCell>
                <TableCell>{interview.candidate?.jobs?.title}</TableCell>
                <TableCell>{interview.interviewer?.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{interview.type}</Badge>
                </TableCell>
                <TableCell>{formatDate(interview.date)}</TableCell>
                <TableCell>{interview.interview_round?.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={new Date(interview.date) < new Date()}
                    onClick={() => onEdit(interview)}
                  >
                    <PenSquare className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      window.location.href = `/interview-feedback?interview=${interview.id}`;
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">Add Feedback</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => setDeleteId(interview.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              interview schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
