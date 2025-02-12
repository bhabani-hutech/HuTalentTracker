import { useState } from "react";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { InterviewFeedbackForm } from "../components/interview-feedback/feedback-form";
import { CandidateList } from "../components/interview-feedback/candidate-list";
import { useFeedback } from "@/lib/api/hooks/useFeedback";
import { Icons } from "@/components/icons";

export default function InterviewFeedback() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const { feedback, isLoading, error } = useFeedback();

  console.log("Selected Candidate:", selectedCandidate);
  console.log("Feedback Data:", feedback);
  console.log("selectedCandidate?.id", selectedCandidate?.id);
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      if (selectedCandidate?.id) {
        await updateFeedback({
          id: selectedCandidate.id,
          updates: feedbackData,
        });
      } else {
        await createFeedback(feedbackData);
      }
      setSelectedCandidate(null);
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Error saving feedback");
    }
  };

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
      <CandidateList
        onFeedback={setSelectedCandidate}
        feedbackData={feedback}
      />

      <Dialog
        open={!!selectedCandidate}
        onOpenChange={() => setSelectedCandidate(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <InterviewFeedbackForm
            candidate={selectedCandidate}
            existingFeedback={feedback?.find(
              (f) => f.candidate_id === selectedCandidate?.id,
            )}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
