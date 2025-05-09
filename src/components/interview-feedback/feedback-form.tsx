import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
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
import { useInterviewRounds } from "@/lib/api/interviewRounds";
import { supabase } from "@/lib/supabase";

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
  const { toast } = useToast();
  const { data: interviewers } = useInterviewers();
  const { data: candidates } = useCandidates();
  const { interviews } = useInterviews();
  const { data: interviewRounds } = useInterviewRounds();
  const { skills: technicalSkills } = useSkills("technical");
  const { skills: domainSkills } = useSkills("domain");
  const { skills: softSkills } = useSkills("soft");
  const [candidateInterviews, setCandidateInterviews] = useState<any[]>([]);
  const [interviewLoading, setInterviewLoading] = useState(false);

  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState<Partial<InterviewFeedback>>(
    existingFeedback
      ? {
          ...existingFeedback,
          technical_skills: existingFeedback.technical_skills || 0,
          domain_skills: existingFeedback.domain_skills || 0,
          soft_skills: existingFeedback.soft_skills || 0,
          strengths: existingFeedback.strengths || "",
          improvements: existingFeedback.improvements || "",
          recommendation: existingFeedback.recommendation || "Maybe",
          comments: existingFeedback.comments || "",
          candidate_id: existingFeedback.candidate_id || "",
          interviewer_id: existingFeedback.interviewer_id || "",
          interview_id:
            existingFeedback.interview_id || selectedInterviewId || "",
          round_id: existingFeedback.round_id || selectedInterviewId || "",
          interview: existingFeedback.interview,
          interviewer: existingFeedback.interviewer,
          date: existingFeedback.interview.date || "",
        }
      : {
          technical_skills: 0,
          domain_skills: 0,
          soft_skills: 0,
          strengths: "",
          improvements: "",
          recommendation: "Maybe",
          comments: "",
          candidate_id: selectedInterview?.candidate_id || "",
          interviewer_id: selectedInterview?.interviewer_id || "",
          interview_id: selectedInterview?.id || selectedInterviewId || "",
          interview: selectedInterview,
          interviewer: selectedInterview?.interviewer,
          round_id: selectedInterview?.round_id,
          date: selectedInterview?.date || "",
        }
  );
  const fetchCandidateInterviews = async (candidateId: string) => {
    setInterviewLoading(true);
    const { data, error } = await supabase
      .from("interviews")
      .select(
        `
    id,
    candidate_id,
    round_id,
    date,
    time,
    interview_rounds(id, name),
    users(id, name)
  `
      )
      .eq("candidate_id", candidateId);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch candidate interviews",
        variant: "destructive",
      });
      console.error(error);
    } else {
      setCandidateInterviews(data || []);
    }
    setInterviewLoading(false);
  };
  useEffect(() => {
    if (formData.candidate_id) {
      fetchCandidateInterviews(formData.candidate_id);
    }
  }, [formData.candidate_id]);

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
    if (!formData.interviewer_id) {
      toast({
        title: "Missing Information",
        description: "Please select an interviewer.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.candidate_id) {
      toast({
        title: "Missing Information",
        description: "Please select a candidate.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.interview_id) {
      toast({
        title: "Missing Information",
        description: "Please select an interview.",
        variant: "destructive",
      });
      return;
    }

    if (formData.interview?.date) {
      const interviewDate = new Date(formData.interview.date);
      const currentDate = new Date();

      if (currentDate < interviewDate) {
        toast({
          title: "Invalid Action",
          description:
            "You cannot submit feedback before the interview has occurred.",
          variant: "destructive",
        });
        return;
      }
    }

    const feedbackData = {
      interview_id: formData.interview_id,
      candidate_id: formData.candidate_id,
      round_id: formData.round_id,
      interviewer_id: formData.interviewer_id,
      technical_skills: formData.technical_skills || 0,
      domain_skills: formData.domain_skills || 0,
      soft_skills: formData.soft_skills || 0,
      // communication_skills: formData.communication_skills || 0,
      // problem_solving: formData.problem_solving || 0,
      // experience_fit: formData.experience_fit || 0,
      // cultural_fit: formData.cultural_fit || 0,
      // skill_set:
      //   typeof formData.skill_set === "number" ? formData.skill_set : 0,
      skill_ratings: skillRatings,
      strengths: formData.strengths || "",
      improvements: formData.improvements || "",
      recommendation: formData.recommendation || "Maybe",
      comments: formData.comments || "",
    };

    if (existingFeedback?.id) {
      updateFeedback(
        {
          id: existingFeedback.id,
          updates: feedbackData,
        },
        {
          onSuccess: () => {
            toast({
              title: "Feedback Updated",
              description: "Feedback has been updated successfully.",
              variant: "default",
            });
            if (onClose) {
              handleClose();
            }
          },
          onError: (error: any) => {
            console.error("Update failed:", error);
            toast({
              title: "Error",
              description:
                error?.message ||
                "Something went wrong while updating feedback.",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createFeedback(feedbackData, {
        onSuccess: () => {
          toast({
            title: "Feedback Submitted",
            description: "Feedback has been submitted successfully.",
            variant: "default",
          });
          if (onClose) {
            handleClose();
            }
        },
        onError: (error: any) => {
          console.error("Creation failed:", error);
          toast({
            title: "Error",
            description:
              error?.message ||
              "Feedback for this candidate and round already exists.",
            variant: "destructive",
          });
        },
      });
    }
  };

  const resetFormData = () => {
    setFormData({
      technical_skills: 0,
      domain_skills: 0,
      soft_skills: 0,
      strengths: "",
      improvements: "",
      recommendation: "Maybe",
      comments: "",
      candidate_id: "",
      interviewer_id: "",
      interview_id: "",
      interview: null,
      interviewer: null,
      round_id: "",
      date: "",
    });
  };

  const handleClose = () => {
    resetFormData(); // Clear the form data
    if (onClose) onClose(); // Call the original onClose function
  };

  const renderRatingButtons = (field: keyof InterviewFeedback) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Button
          key={rating}
          variant={formData[field] === rating ? "default" : "outline"}
          className="h-8 w-8 text-xs"
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
          <Label>Candidate Name</Label> <span className="text-red-500">*</span>
          <Select
            value={formData.candidate_id || ""}
            disabled={
              !!existingFeedback?.candidate?.id ||
              selectedInterview?.candidate_id
            }
            onValueChange={(value) => {
              const selectedCandidate = candidates?.find(
                (candidate) => candidate.id === value
              );
              const selectedInterview = interviews?.find(
                (interview) => interview?.candidate?.id === value
              );
              console.log(selectedCandidate, selectedInterview);
              setFormData((prev) => ({
                ...prev,
                candidate_id: value,
                candidate: selectedCandidate,
                interview_id: selectedInterview?.id || prev.interview_id,
                interview: selectedInterview || prev.interview,
                date: selectedInterview?.date || prev.date,
                interviewer_id:
                  selectedInterview?.interviewer?.id || prev.interviewer_id,
                interviewer: selectedInterview?.interviewer || prev.interviewer,
                round_id: selectedInterview?.round_id || prev.round_id,
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Candidate name">
                {formData?.interview?.candidate?.name ||
                  formData?.candidate?.name ||
                  "Select Candidate"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                new Map(
                  interviews?.map((interview) => [
                    interview?.candidate?.id,
                    interview?.candidate,
                  ])
                ).values()
              ).map((candidate) => (
                <SelectItem key={candidate?.id} value={candidate?.id}>
                  {candidate?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Interview Round</Label> <span className="text-red-500">*</span>
          <Select
            value={formData.round_id ? String(formData.round_id) : ""}
            disabled={
              !!existingFeedback?.candidate?.id ||
              selectedInterview?.candidate_id
            }
            onValueChange={(value) => {
              const selectedRound = candidateInterviews.find(
                (interview) => String(interview.interview_rounds?.id) === value
              );
              setFormData((prev) => ({
                ...prev,
                round_id: selectedRound?.interview_rounds?.id,
                interviewer_id: selectedRound?.users?.id || prev.interviewer_id,
                interviewer: selectedRound?.users || prev.interviewer,
                date: selectedRound?.date,
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Interview Round" />
            </SelectTrigger>
            <SelectContent>
              {candidateInterviews.length > 0 ? (
                candidateInterviews.map((interview) => (
                  <SelectItem
                    key={interview?.interview_rounds?.id}
                    value={String(interview?.interview_rounds?.id)}
                  >
                    {interview.interview_rounds?.name || "Unnamed Round"}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="No Rounds Available" disabled>
                  No Rounds Available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Interview Date & Time</Label>{" "}
          <span className="text-red-500">*</span>
          <Input
            type="text"
            value={
              formData?.date ? format(new Date(formData?.date), "PPp") : ""
            }
            disabled={
              !!existingFeedback?.candidate?.id ||
              selectedInterview?.candidate_id
            }
            placeholder="Interview details"
          />
        </div>
        <div className="space-y-2">
          <Label>Interviewer</Label> <span className="text-red-500">*</span>
          <Select
            value={formData.interviewer_id || ""}
            // disabled={
            //   !!existingFeedback?.interviewer?.id || formData.interviewer_id
            // }
            disabled={formData.round_id ? true : false}
            onValueChange={(value) => {
              const selectedInterviewer = interviewers?.find(
                (ele) => ele?.id === value
              );
              if (selectedInterviewer) {
                setFormData({
                  ...formData,
                  interviewer_id: selectedInterviewer.id,
                  interviewer: selectedInterviewer,
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Interviewer name">
                {formData?.interviewer?.name || "Select Interviewer"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {interviewers?.map((ele) => (
                <SelectItem key={ele?.id} value={ele?.id}>
                  {ele?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Skill-specific ratings */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Skill-Specific Ratings</Label>{" "}
        <span className="text-red-500">*</span>
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
      </div>

      {/* Overall ratings */}
      <div className="space-y-4 mt-6 border-t pt-6">
        <Label className="text-lg font-semibold">Overall Ratings</Label>{" "}
        <span className="text-red-500">*</span>
        <div className="grid gap-4">
          <div className="flex items-center justify-between border p-3 rounded-md">
            <span className="font-medium">Technical Skills</span>
            {renderRatingButtons("technical_skills")}
          </div>

          <div className="flex items-center justify-between border p-3 rounded-md">
            <span className="font-medium">Domain Skills</span>
            {renderRatingButtons("domain_skills")}
          </div>

          <div className="flex items-center justify-between border p-3 rounded-md">
            <span className="font-medium">Soft Skills</span>
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
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {existingFeedback ? "Update Feedback" : "Submit Feedback"}
        </Button>
      </div>
    </div>
  );
}
