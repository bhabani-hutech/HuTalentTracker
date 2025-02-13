import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { InterviewFeedbackForm } from "../components/interview-feedback/feedback-form";
import { CandidateList } from "../components/interview-feedback/candidate-list";
import { useFeedback } from "@/lib/api/hooks/useFeedback";
import { Icons } from "@/components/icons";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InterviewFeedback() {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { feedback, isLoading, error } = useFeedback();
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const interviewId = params.get('interview');
    if (interviewId) {
      setSelectedInterviewId(interviewId);
      setShowCreateForm(true);
    }
  }, []);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Interview Feedback
          </h1>
          <p className="text-muted-foreground">
            Submit and review candidate interview feedback
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Create Interview Feedback
        </Button>
      </div>

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

      <Dialog
        open={showCreateForm}
        onOpenChange={() => setShowCreateForm(false)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <InterviewFeedbackForm
            onClose={() => {
              setShowCreateForm(false);
              setSelectedInterviewId(null);
            }}
            selectedInterviewId={selectedInterviewId}
          />
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
