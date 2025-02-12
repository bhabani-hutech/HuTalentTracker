import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { InterviewFeedback } from "@/types/database";
import { useFeedback } from "@/lib/api/hooks/useFeedback";
import { useInterviewers } from "@/lib/api/hooks/useInterviewers";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  candidate: any;
  existingFeedback?: InterviewFeedback;
}

export function InterviewFeedbackForm({
  candidate: initialCandidate,
  existingFeedback,
}: Props) {
  const [candidate, setCandidate] = useState(
    initialCandidate?.candidate || initialCandidate,
  );

  // Initialize form with existing feedback if editing
  const feedbackToEdit = initialCandidate?.id
    ? initialCandidate
    : existingFeedback;
  console.log("Feedback to edit:", feedbackToEdit);
  const { createFeedback, updateFeedback } = useFeedback();
  const { data: interviewers, isLoading: isLoadingInterviewers } =
    useInterviewers();
  console.log("Interviewers loaded:", interviewers);
  const [open, setOpen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState(
    existingFeedback?.interviewer_id || "",
  );

  console.log("Interviewers:", interviewers);
  console.log("Selected Interviewer:", selectedInterviewer);
  console.log("Existing Feedback:", existingFeedback);

  const [formData, setFormData] = useState<Partial<InterviewFeedback>>({
    technical_skills: feedbackToEdit?.technical_skills || 0,
    communication_skills: feedbackToEdit?.communication_skills || 0,
    problem_solving: feedbackToEdit?.problem_solving || 0,
    experience_fit: feedbackToEdit?.experience_fit || 0,
    cultural_fit: feedbackToEdit?.cultural_fit || 0,
    strengths: feedbackToEdit?.strengths || "",
    improvements: feedbackToEdit?.improvements || "",
    recommendation: feedbackToEdit?.recommendation || "Maybe",
    comments: feedbackToEdit?.comments || "",
  });

  // Set initial interviewer from existing feedback
  useEffect(() => {
    if (feedbackToEdit?.interviewer_id) {
      setSelectedInterviewer(feedbackToEdit.interviewer_id);
    }
  }, [feedbackToEdit]);
  console.log(
    "1. existingFeedback?.interviewer_id " + existingFeedback?.interviewer_id,
  );
  const handleSubmit = async () => {
    try {
      if (!selectedInterviewer) {
        alert("Please select an interviewer");
        return;
      }

      if (!candidate?.id && !existingFeedback?.candidate_id) {
        alert("No candidate selected");
        return;
      }
      console.log(
        "1.id" + candidate?.id,
        selectedInterviewer,
        existingFeedback?.candidate_id,
      );
      const feedbackData = {
        ...formData,
        candidate_id: candidate?.id || existingFeedback?.candidate_id,
        interviewer_id: selectedInterviewer,
      };

      try {
        console.log("Submitting feedback:", feedbackToEdit?.id);
        console.log("feedbackToEdit", feedbackToEdit);
        console.log("feedbackData", feedbackData);

        if (feedbackToEdit?.id) {
          console.log("Calling update feedbackData", feedbackData);
          console.log("Calling update feedbackToEdit.id", feedbackToEdit.id);

          await updateFeedback({
            id: feedbackToEdit.id,
            updates: feedbackData,
          });
        } else {
          console.log("Creating new feedback");
          await createFeedback(feedbackData as any);
        }

        // ✅ Ensure the alert is only called after async operations are finished
        alert("Feedback saved successfully! " + feedbackData.technical_skills);

        // ✅ Instead of `window.location.href`, consider using React Router’s `useNavigate()`
        window.location.href = "/interview-feedback";
      } catch (error) {
        console.error("Error saving feedback:", error);
        alert("Error saving feedback");
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Error saving feedback");
    }
  };

  const renderRatingButtons = (field: keyof InterviewFeedback) => (
    <div className="flex gap-4">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Button
          key={rating}
          variant={formData[field] === rating ? "default" : "outline"}
          className="h-10 w-10"
          onClick={() => setFormData({ ...formData, [field]: rating })}
        >
          {rating}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Candidate</Label>
          {candidate?.id ? (
            <Input
              value={`${candidate.name} - ${candidate.position}`}
              readOnly
            />
          ) : (
            <CandidateSelect
              onSelect={(selected) => {
                if (selected) {
                  setCandidate({
                    id: selected.id,
                    name: selected.name,
                    position: selected.position,
                  });
                }
              }}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>Interviewer</Label>
          <Select
            value={selectedInterviewer}
            onValueChange={setSelectedInterviewer}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select interviewer" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(interviewers) &&
                interviewers.map((interviewer) => (
                  <SelectItem key={interviewer.id} value={interviewer.id}>
                    {interviewer.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Technical Skills</Label>
        {renderRatingButtons("technical_skills")}
      </div>

      <div className="space-y-2">
        <Label>Communication Skills</Label>
        {renderRatingButtons("communication_skills")}
      </div>

      <div className="space-y-2">
        <Label>Problem Solving</Label>
        {renderRatingButtons("problem_solving")}
      </div>

      <div className="space-y-2">
        <Label>Experience Fit</Label>
        {renderRatingButtons("experience_fit")}
      </div>

      <div className="space-y-2">
        <Label>Cultural Fit</Label>
        {renderRatingButtons("cultural_fit")}
      </div>

      <div className="space-y-2">
        <Label>Key Strengths</Label>
        <Textarea
          value={formData.strengths}
          onChange={(e) =>
            setFormData({ ...formData, strengths: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Areas for Improvement</Label>
        <Textarea
          value={formData.improvements}
          onChange={(e) =>
            setFormData({ ...formData, improvements: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Recommendation</Label>
        <Select
          value={formData.recommendation}
          onValueChange={(value: any) =>
            setFormData({ ...formData, recommendation: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Strong Hire">Strong Hire</SelectItem>
            <SelectItem value="Hire">Hire</SelectItem>
            <SelectItem value="Maybe">Maybe</SelectItem>
            <SelectItem value="No Hire">No Hire</SelectItem>
            <SelectItem value="Strong No Hire">Strong No Hire</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Additional Comments</Label>
        <Textarea
          value={formData.comments}
          onChange={(e) =>
            setFormData({ ...formData, comments: e.target.value })
          }
        />
      </div>

      <Button onClick={handleSubmit} className="w-full">
        {existingFeedback ? "Update Feedback" : "Submit Feedback"}
      </Button>
    </div>
  );
}

function Input(props: any) {
  return (
    <input
      {...props}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
