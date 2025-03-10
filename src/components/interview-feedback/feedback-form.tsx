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
import { useSkills } from "@/lib/api/hooks/useSkills";

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
  const { interviews } = useInterviews();
  const { skills: technicalSkills } = useSkills("technical");
  const { skills: domainSkills } = useSkills("domain");
  const { skills: softSkills } = useSkills("soft");

  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState<Partial<InterviewFeedback>>(
    existingFeedback
      ? {
          ...existingFeedback,
          technical_skills: existingFeedback.technical_skills || 0,
          communication_skills: existingFeedback.communication_skills || 0,
          problem_solving: existingFeedback.problem_solving || 0,
          experience_fit: existingFeedback.experience_fit || 0,
          cultural_fit: existingFeedback.cultural_fit || 0,
          soft_skills: existingFeedback.soft_skills || 0,
          domain_skills: existingFeedback.domain_skills || 0,
          skill_set: existingFeedback.skill_set || 0,
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
          soft_skills: 0,
          domain_skills: 0,
          skill_set: 0,
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

  // Initialize skill ratings based on existing feedback or candidate skills
  useEffect(() => {
    try {
      // First check if we have existing feedback with skill ratings
      if (existingFeedback?.skill_ratings) {
        setSkillRatings(existingFeedback.skill_ratings);
        return;
      }

      // If no existing ratings, initialize from candidate skills
      const initialRatings: Record<string, number> = {};

      // Process candidate skills if available
      if (formData.candidate?.skills) {
        let candidateSkills = [];
        if (typeof formData.candidate.skills === "string") {
          candidateSkills = formData.candidate.skills
            .split(",")
            .map((s) => s.trim());
        } else if (Array.isArray(formData.candidate.skills)) {
          candidateSkills = formData.candidate.skills;
        }

        // Add candidate skills to ratings
        candidateSkills.forEach((skill) => {
          if (skill && typeof skill === "string") {
            initialRatings[skill] = 0;
          }
        });
      }

      // Add default skills from each category if no candidate skills found
      if (Object.keys(initialRatings).length === 0) {
        // Add technical skills
        if (technicalSkills && technicalSkills.length > 0) {
          technicalSkills.slice(0, 2).forEach((skill) => {
            if (skill && skill.name) {
              initialRatings[skill.name] = 0;
            }
          });
        }

        // Add domain skills
        if (domainSkills && domainSkills.length > 0) {
          domainSkills.slice(0, 2).forEach((skill) => {
            if (skill && skill.name) {
              initialRatings[skill.name] = 0;
            }
          });
        }

        // Add soft skills
        if (softSkills && softSkills.length > 0) {
          softSkills.slice(0, 2).forEach((skill) => {
            if (skill && skill.name) {
              initialRatings[skill.name] = 0;
            }
          });
        }
      }

      setSkillRatings(initialRatings);
    } catch (error) {
      console.error("Error initializing skill ratings:", error);
      setSkillRatings({});
    }
  }, [
    existingFeedback,
    formData.candidate,
    technicalSkills,
    domainSkills,
    softSkills,
  ]);

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
        soft_skills: formData.soft_skills || 0,
        domain_skills: formData.domain_skills || 0,
        skill_set: formData.skill_set || 0,
        skill_ratings: skillRatings, // Store the detailed skill ratings
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

  const renderSkillRatingButtons = (skillName: string) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Button
          key={rating}
          variant={skillRatings[skillName] === rating ? "default" : "outline"}
          className="h-8 w-8 text-xs"
          onClick={() =>
            setSkillRatings({ ...skillRatings, [skillName]: rating })
          }
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
          <Label>Interviewer</Label>
          <Input
            value={formData.interviewer?.name || ""}
            disabled
            placeholder="Interviewer name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Interview Date & Time</Label>
        <Input
          type="text"
          value={
            formData.interview
              ? `${format(new Date(formData.interview.date), "PPp")} - ${
                  formData.interview.type
                }`
              : ""
          }
          disabled
          placeholder="Interview details"
        />
      </div>

      {/* Skill-specific ratings */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Skill-Specific Ratings</Label>
        <div className="grid gap-4">
          {Object.keys(skillRatings).length > 0 ? (
            Object.keys(skillRatings).map((skillName) => (
              <div
                key={skillName}
                className="flex items-center justify-between border p-3 rounded-md"
              >
                <span className="font-medium">{skillName}</span>
                {renderSkillRatingButtons(skillName)}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 italic p-3 border rounded-md">
              No specific skills to rate. Add skills from the dropdown below.
            </div>
          )}
        </div>

        {/* Add skill dropdown */}
        <div className="mt-4">
          <Label>Add Skill to Rate</Label>
          <div className="flex gap-2 mt-2">
            <Select
              onValueChange={(value) => {
                if (value && !skillRatings[value]) {
                  setSkillRatings({ ...skillRatings, [value]: 0 });
                }
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a skill to rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" disabled>
                  Select a skill
                </SelectItem>
                {technicalSkills &&
                  technicalSkills.map((skill) =>
                    skill && skill.id && skill.name ? (
                      <SelectItem key={`tech-${skill.id}`} value={skill.name}>
                        {skill.name} (Technical)
                      </SelectItem>
                    ) : null,
                  )}
                {domainSkills &&
                  domainSkills.map((skill) =>
                    skill && skill.id && skill.name ? (
                      <SelectItem key={`domain-${skill.id}`} value={skill.name}>
                        {skill.name} (Domain)
                      </SelectItem>
                    ) : null,
                  )}
                {softSkills &&
                  softSkills.map((skill) =>
                    skill && skill.id && skill.name ? (
                      <SelectItem key={`soft-${skill.id}`} value={skill.name}>
                        {skill.name} (Soft)
                      </SelectItem>
                    ) : null,
                  )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overall ratings */}
      <div className="space-y-6 mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold">Overall Ratings</h3>

        <div className="grid md:grid-cols-2 gap-6">
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
            <Label>Skill Set Match</Label>
            {renderRatingButtons("skill_set")}
          </div>

          <div className="space-y-2">
            <Label>Domain Knowledge</Label>
            {renderRatingButtons("domain_skills")}
          </div>

          <div className="space-y-2">
            <Label>Soft Skills</Label>
            {renderRatingButtons("soft_skills")}
          </div>
        </div>
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
