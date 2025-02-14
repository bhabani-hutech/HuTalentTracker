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
  selectedInterview?: any;
}

export function InterviewFeedbackForm({
  existingFeedback,
  onClose,
  selectedInterviewId,
  selectedInterview,
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
          interview: existingFeedback.interview,
          candidate: existingFeedback.candidate,
          interviewer: existingFeedback.interviewer,
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
          candidate_id: selectedInterview?.candidate_id || "",
          interviewer_id: selectedInterview?.interviewer_id || "",
          interview_id: selectedInterview?.id || selectedInterviewId || "",
          interview: selectedInterview,
          candidate: selectedInterview?.candidate,
          interviewer: selectedInterview?.interviewer,
        },
  );

  const handleSubmit = async () => {
    try {
      if (!formData.interviewer_id) {
        alert("Please select an interviewer");
        return;
      }

      if (!formData.candidate_id) {
        alert("Please select a candidate");
        return;
      }

      if (!formData.interview_id) {
        alert("Please select an interview");
        return;
      }

      const feedbackData = {
        ...formData,
        interview_id: formData.interview_id,
        candidate_id: formData.candidate_id,
        interviewer_id: formData.interviewer_id,
        technical_skills: formData.technical_skills || 0,
        communication_skills: formData.communication_skills || 0,
        problem_solving: formData.problem_solving || 0,
        experience_fit: formData.experience_fit || 0,
        cultural_fit: formData.cultural_fit || 0,
        strengths: formData.strengths || "",
        improvements: formData.improvements || "",
        recommendation: formData.recommendation || "Maybe",
        comments: formData.comments || "",
      };

      if (existingFeedback?.id) {
        await updateFeedback({
          id: existingFeedback.id,
          updates: feedbackData,
        });
      } else {
        await createFeedback(feedbackData as any);
      }

      alert("Feedback saved successfully!");
      if (onClose) onClose();
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
            value={formData.candidate?.name || ""}
            disabled
            placeholder="Candidate name"
          />
        </div>

        <div className="space-y-2">
          <Label>Position</Label>
          <Input
            value={formData.candidate?.position || ""}
            disabled
            placeholder="Position will be shown here"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Interviewer</Label>
          <Input
            value={formData.interviewer?.name || ""}
            disabled
            placeholder="Interviewer name"
          />
        </div>

        <div className="space-y-2">
          <Label>Interview Date & Time</Label>
          <Input
            type="text"
            value={
              formData.interview
                ? `${format(new Date(formData.interview.date), "PPp")} - ${formData.interview.type}`
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
