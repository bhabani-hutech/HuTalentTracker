import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { InterviewFeedbackForm } from "../components/interview-feedback/feedback-form";
import { CandidateList } from "../components/interview-feedback/candidate-list";
import { useFeedback } from "@/lib/api/hooks/useFeedback";
import { supabase } from "@/lib/supabase";
import { useInterviews } from "@/lib/api/hooks/useInterviews";
import { Icons } from "@/components/icons";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InterviewFeedback() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const interviewId = params.get("interview");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const {
    feedback,
    isLoading: feedbackLoading,
    error: feedbackError,
  } = useFeedback();
  const {
    interviews,
    isLoading: interviewsLoading,
    error: interviewsError,
  } = useInterviews(interviewId || undefined);

  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(
    null,
  );
  const [selectedInterview, setSelectedInterview] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (interviewId) {
        try {
          // First get the interview details
          const { data: interview, error: interviewError } = await supabase
            .from("interviews")
            .select(
              `
              *,
              candidate:candidates!candidate_id(*),
              interviewer:users!interviewer_id(*)
              `,
            )
            .eq("id", interviewId)
            .single();

          if (interviewError) throw interviewError;

          if (interview) {
            setSelectedInterviewId(interviewId);
            setSelectedInterview(interview);

            // If we have a feedback ID, fetch the feedback
            if (feedbackId) {
              const { data: existingFeedback, error: feedbackError } =
                await supabase
                  .from("feedback")
                  .select(
                    `
                  *,
                  interview:interviews!interview_id(*),
                  candidate:candidates!candidate_id(*),
                  interviewer:users!interviewer_id(*)
                  `,
                  )
                  .eq("id", feedbackId)
                  .single();

              if (feedbackError) throw feedbackError;
              if (existingFeedback) {
                setSelectedFeedback(existingFeedback);
              }
            } else if (isNew) {
              // If no feedback ID but isNew flag is set, show create form
              setShowCreateForm(true);
            }
          }
        } catch (error) {
          console.error("Error loading data:", error);
          // Show create form as fallback
          setShowCreateForm(true);
        }
      }
    };

    loadData();
  }, [interviewId]);

  if (feedbackLoading || interviewsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (feedbackError || interviewsError) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading feedback data
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Interview Feedback
        </h1>
        <p className="text-muted-foreground">
          Submit and review candidate interview feedback
        </p>
      </div>

      <CandidateList onFeedback={setSelectedFeedback} feedbackData={feedback} />

      <Dialog
        open={!!selectedFeedback || showCreateForm}
        onOpenChange={() => {
          setSelectedFeedback(null);
          setShowCreateForm(false);
          // Clear URL parameters when closing
          window.history.replaceState({}, "", window.location.pathname);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
          <InterviewFeedbackForm
            existingFeedback={selectedFeedback}
            selectedInterviewId={selectedInterviewId}
            selectedInterview={selectedInterview}
            onClose={() => {
              setSelectedFeedback(null);
              setShowCreateForm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
