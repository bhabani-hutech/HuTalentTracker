import { useState } from "react";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { InterviewFeedbackForm } from "../components/interview-feedback/feedback-form";
import { CandidateList } from "../components/interview-feedback/candidate-list";

export default function InterviewFeedback() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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
      <CandidateList onFeedback={setSelectedCandidate} />

      <Dialog
        open={!!selectedCandidate}
        onOpenChange={() => setSelectedCandidate(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <InterviewFeedbackForm candidate={selectedCandidate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
