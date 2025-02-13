import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
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
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useInterviews } from "@/lib/api/hooks/useInterviews";
import { format } from "date-fns";

interface Props {
  existingFeedback?: InterviewFeedback;
  onClose?: () => void;
  selectedInterviewId?: string | null;
}

export function InterviewFeedbackForm({
  existingFeedback,
  onClose,
  selectedInterviewId,
}: Props) {
  const { createFeedback, updateFeedback } = useFeedback();
  const { data: interviewers } = useInterviewers();
  const { data: candidates } = useCandidates();
  const { data: interviews } = useInterviews();

  const [formData, setFormData] = useState<Partial<InterviewFeedback>>(
    existingFeedback
      ? {
          ...existingFeedback,
          technical_skills: existingFeedback.technical_skills || 0,
          communication_skills: existingFeedback.communication_skills || 0,
          problem_solving: existingFeedback.problem_solving || 0,
          experience_fit: existingFeedback.experience_fit || 0,
          cultural_fit: existingFeedback.cultural_fit || 0,
          strengths: existingFeedback.strengths || "",
          improvements: existingFeedback.improvements || "",
          recommendation: existingFeedback.recommendation || "Maybe",
          comments: existingFeedback.comments || "",
          candidate_id: existingFeedback.candidate_id || "",
          interviewer_id: existingFeedback.interviewer_id || "",
          interview_id:
            existingFeedback.interview_id || selectedInterviewId || "",
        }
      : {
          technical_skills: 0,
          communication_skills: 0,
          problem_solving: 0,
          experience_fit: 0,
          cultural_fit: 0,
          strengths: "",
          improvements: "",
          recommendation: "Maybe",
          comments: "",
          candidate_id: "",
          interviewer_id: "",
          interview_id: selectedInterviewId || "",
        },
  );

  // Set form data when selected interview changes
  useEffect(() => {
    if (selectedInterviewId && interviews) {
      const interview = interviews.find((i) => i.id === selectedInterviewId);
      if (interview) {
        setFormData((prev) => ({
          ...prev,
          interview_id: selectedInterviewId,
          candidate_id: interview.candidate_id || prev.candidate_id,
          interviewer_id: interview.interviewer_id || prev.interviewer_id,
        }));
      }
    }
  }, [selectedInterviewId, interviews]);

  const selectedInterview = interviews?.find(
    (i) => i.id === formData.interview_id,
  );

  const handleSubmit = async () => {
    try {
      // Ensure interview_id is set from selectedInterviewId
      const submissionData = {
        ...formData,
        interview_id: selectedInterviewId || formData.interview_id,
      };

      if (!submissionData.interviewer_id) {
        alert("Please select an interviewer");
        return;
      }

      if (!submissionData.candidate_id) {
        alert("Please select a candidate");
        return;
      }

      if (!submissionData.interview_id) {
        alert("Please select an interview");
        return;
      }

      try {
        if (existingFeedback?.id) {
          await updateFeedback({
            id: existingFeedback.id,
            updates: submissionData,
          });
        } else {
          await createFeedback(submissionData as any);
        }

        alert("Feedback saved successfully!");
        if (onClose) onClose();
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
          <Label>Candidate Name</Label>
          <Input
            value={
              existingFeedback?.candidate?.name ||
              candidates?.find((c) => c.id === formData.candidate_id)?.name ||
              ""
            }
            disabled
            placeholder="Candidate name"
          />
        </div>

        <div className="space-y-2">
          <Label>Position</Label>
          <Input
            value={
              existingFeedback?.candidate?.position ||
              candidates?.find((c) => c.id === formData.candidate_id)
                ?.position ||
              ""
            }
            disabled
            placeholder="Position will be shown here"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Interviewer</Label>
          <Input
            value={
              existingFeedback?.interviewer?.name ||
              interviewers?.find((i) => i.id === formData.interviewer_id)
                ?.name ||
              ""
            }
            disabled
            placeholder="Interviewer name"
          />
        </div>

        <div className="space-y-2">
          <Label>Interview Date & Time</Label>
          <Input
            type="text"
            value={
              existingFeedback?.interview
                ? format(new Date(existingFeedback.interview.date), "PPp") +
                  (existingFeedback.interview.type
                    ? ` - ${existingFeedback.interview.type}`
                    : "")
                : interviews?.find((i) => i.id === selectedInterviewId)
                  ? format(
                      new Date(
                        interviews.find(
                          (i) => i.id === selectedInterviewId,
                        ).date,
                      ),
                      "PPp",
                    ) +
                    (interviews.find((i) => i.id === selectedInterviewId).type
                      ? ` - ${interviews.find((i) => i.id === selectedInterviewId).type}`
                      : "")
                  : ""
            }
            disabled
            placeholder="Interview details"
          />
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

      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {existingFeedback ? "Update Feedback" : "Submit Feedback"}
        </Button>
      </div>
    </div>
  );
}
