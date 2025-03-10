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
          soft_skills: existingFeedback.soft_skills || 0,
          domain_skills: existingFeedback.domain_skills || 0,
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
          soft_skills: 0,
          domain_skills: 0,
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

  // Initialize skill ratings based on candidate skills
  useEffect(() => {
    if (formData.candidate?.skills) {
      try {
        // Handle different formats of skills data
        let candidateSkills = [];
        if (typeof formData.candidate.skills === "string") {
          candidateSkills = formData.candidate.skills
            .split(",")
            .map((s) => s.trim());
        } else if (Array.isArray(formData.candidate.skills)) {
          candidateSkills = formData.candidate.skills;
        }

        const initialRatings: Record<string, number> = {};
        candidateSkills.forEach((skill) => {
          initialRatings[skill] = 0;
        });

        // Add some default skills if none found
        if (candidateSkills.length === 0) {
          // Add default technical skills
          if (technicalSkills.length > 0) {
            technicalSkills.slice(0, 2).forEach((skill) => {
              initialRatings[skill.name] = 0;
            });
          }

          // Add default domain skills
          if (domainSkills.length > 0) {
            domainSkills.slice(0, 2).forEach((skill) => {
              initialRatings[skill.name] = 0;
            });
          }

          // Add default soft skills
          if (softSkills.length > 0) {
            softSkills.slice(0, 2).forEach((skill) => {
              initialRatings[skill.name] = 0;
            });
          }
        }

        // If we have existing ratings from feedback, use those
        if (existingFeedback?.skill_ratings) {
          setSkillRatings({
            ...initialRatings,
            ...existingFeedback.skill_ratings,
          });
        } else {
          setSkillRatings(initialRatings);
        }
      } catch (error) {
        console.error("Error parsing candidate skills:", error);
      }
    }
  }, [
    formData.candidate,
    technicalSkills,
    domainSkills,
    softSkills,
    existingFeedback,
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
        soft_skills: formData.soft_skills || 0,
        domain_skills: formData.domain_skills || 0,
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
              ? `${format(new Date(formData.interview.date), "PPp")} - ${formData.interview.type}`
              : ""
          }
          disabled
          placeholder="Interview details"
        />
      </div>

      {/* Skill-specific ratings */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Skill-Specific Ratings</Label>

        {/* Technical Skills Section */}
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-3">Technical Skills</h3>
          <div className="space-y-3">
            {Object.keys(skillRatings)
              .filter((skill) =>
                technicalSkills.some((ts) => ts.name === skill),
              )
              .map((skillName) => (
                <div key={skillName} className="flex items-center gap-2">
                  <span className="w-24 font-medium">{skillName}:</span>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={
                        skillRatings[skillName] === rating
                          ? "default"
                          : "outline"
                      }
                      className="h-8 w-8 text-xs"
                      onClick={() =>
                        setSkillRatings({
                          ...skillRatings,
                          [skillName]: rating,
                        })
                      }
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              ))}
          </div>
        </div>

        {/* Domain Skills Section */}
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-3">Domain Skills</h3>
          <div className="space-y-3">
            {Object.keys(skillRatings)
              .filter((skill) => domainSkills.some((ds) => ds.name === skill))
              .map((skillName) => (
                <div key={skillName} className="flex items-center gap-2">
                  <span className="w-24 font-medium">{skillName}:</span>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={
                        skillRatings[skillName] === rating
                          ? "default"
                          : "outline"
                      }
                      className="h-8 w-8 text-xs"
                      onClick={() =>
                        setSkillRatings({
                          ...skillRatings,
                          [skillName]: rating,
                        })
                      }
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              ))}
          </div>
        </div>

        {/* Soft Skills Section */}
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-3">Soft Skills</h3>
          <div className="space-y-3">
            {Object.keys(skillRatings)
              .filter((skill) => softSkills.some((ss) => ss.name === skill))
              .map((skillName) => (
                <div key={skillName} className="flex items-center gap-2">
                  <span className="w-24 font-medium">{skillName}:</span>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={
                        skillRatings[skillName] === rating
                          ? "default"
                          : "outline"
                      }
                      className="h-8 w-8 text-xs"
                      onClick={() =>
                        setSkillRatings({
                          ...skillRatings,
                          [skillName]: rating,
                        })
                      }
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              ))}
          </div>
        </div>

        {/* Add skill button */}
        <div className="mt-2">
          <Select
            onValueChange={(value) => {
              if (!skillRatings[value]) {
                setSkillRatings({ ...skillRatings, [value]: 0 });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add another skill to rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" disabled>
                Select a skill
              </SelectItem>
              {technicalSkills.map((skill) => (
                <SelectItem key={`tech-${skill.id}`} value={skill.name}>
                  {skill.name} (Technical)
                </SelectItem>
              ))}
              {domainSkills.map((skill) => (
                <SelectItem key={`domain-${skill.id}`} value={skill.name}>
                  {skill.name} (Domain)
                </SelectItem>
              ))}
              {softSkills.map((skill) => (
                <SelectItem key={`soft-${skill.id}`} value={skill.name}>
                  {skill.name} (Soft)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall ratings */}
      <div className="space-y-2 mt-4">
        <Label>Overall Domain Skills</Label>
        {renderRatingButtons("domain_skills")}
      </div>
      <div className="space-y-2">
        <Label>Overall Technical Skills</Label>
        {renderRatingButtons("technical_skills")}
      </div>
      <div className="space-y-2">
        <Label>Overall Soft Skills</Label>
        {renderRatingButtons("soft_skills")}
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
