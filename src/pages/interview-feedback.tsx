import { useState } from "react";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { InterviewFeedbackForm } from "../components/interview-feedback/feedback-form";
import { CandidateList } from "../components/interview-feedback/candidate-list";
import { useFeedback } from "@/lib/api/hooks/useFeedback";
import { Icons } from "@/components/icons";

export default function InterviewFeedback() {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const { feedback, isLoading, error } = useFeedback();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
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

      {window.location.pathname === "/interview-feedback/new" ? (
        <div className="max-w-4xl mx-auto">
          <InterviewFeedbackForm
            onClose={() => (window.location.href = "/interview-feedback")}
          />
        </div>
      ) : (
        <>
          <CandidateList
            onFeedback={setSelectedFeedback}
            feedbackData={feedback}
          />

          <Dialog
            open={!!selectedFeedback}
            onOpenChange={() => setSelectedFeedback(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <InterviewFeedbackForm
                existingFeedback={selectedFeedback}
                onClose={() => setSelectedFeedback(null)}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
