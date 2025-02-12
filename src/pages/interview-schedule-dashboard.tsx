import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InterviewTable } from "@/components/interviews/interview-table";
import { InterviewForm } from "@/components/interviews/interview-form";
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
          <CardTitle>Upcoming Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewTable
            interviews={interviews}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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
