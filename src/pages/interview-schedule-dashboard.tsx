import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { InterviewTable } from "@/components/interviews/interview-table";
import { InterviewForm } from "@/components/interviews/interview-form";
import { Input } from "@/components/ui/input";
import {
  Interview,
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from "@/lib/api/interviews";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export default function InterviewScheduleDashboard() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<
    Interview | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const fetchInterviews = async () => {
    try {
      const data = await getInterviews();
      setInterviews(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch interviews",
      });
    }
  };

  useEffect(() => {
    fetchInterviews();

    // Set up real-time subscription
    const subscription = supabase
      .channel("interviews-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interviews" },
        () => {
          fetchInterviews();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (
    data: Omit<Interview, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      if (selectedInterview) {
        await updateInterview(selectedInterview.id, data);
        toast({
          title: "Success",
          description: "Interview updated successfully",
        });
      } else {
        await createInterview(data);
        toast({
          title: "Success",
          description: "Interview scheduled successfully",
        });
      }
      await fetchInterviews();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: selectedInterview
          ? "Failed to update interview"
          : "Failed to schedule interview",
      });
    }
  };

  const handleEdit = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInterview(id);
      toast({
        title: "Success",
        description: "Interview deleted successfully",
      });
      await fetchInterviews();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete interview",
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedInterview(undefined);
  };

  // Filter interviews based on search query
  const filteredInterviews = interviews.filter((interview) => {
    const searchString = searchQuery.toLowerCase();
    return (
      interview.candidate?.name?.toLowerCase().includes(searchString) ||
      interview.candidate?.position?.toLowerCase().includes(searchString) ||
      interview.type?.toLowerCase().includes(searchString) ||
      interview.interviewer?.name?.toLowerCase().includes(searchString)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInterviews = filteredInterviews.slice(startIndex, endIndex);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Interview Schedule
          </h1>
          <p className="text-muted-foreground">
            Manage and track interview schedules
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Interview
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Interviews</CardTitle>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search interviews..."
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <InterviewTable
              interviews={currentInterviews}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredInterviews.length)} of{" "}
                {filteredInterviews.length} interviews
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
          </div>
        </CardContent>
      </Card>

      <InterviewForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={selectedInterview}
      />
    </div>
  );
}
