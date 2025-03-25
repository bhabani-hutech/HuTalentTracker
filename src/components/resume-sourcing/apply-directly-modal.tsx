import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState, useEffect } from "react";
import { useToast } from "../ui/use-toast";
import { createCandidate } from "@/lib/api/candidates";
import { Job, JobType } from "@/types/database";
import { useSkills } from "@/lib/api/hooks/useSkills";

interface ApplyDirectlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: Job | null;
}

interface ApplicationData {
  name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  notice_period: string;
  skills: string[];
  type: JobType;
  experience: string;
}

export function ApplyDirectlyModal({
  isOpen,
  onClose,
  selectedJob,
}: ApplyDirectlyModalProps) {
  const { toast } = useToast();
  const { skills: domainSkills } = useSkills("domain");
  const { skills: technicalSkills } = useSkills("technical");
  const { skills: softSkills } = useSkills("soft");

  const [formData, setFormData] = useState<ApplicationData>({
    name: "",
    email: "",
    phone: "",
    position: selectedJob?.title || "",
    location: selectedJob?.location || "",
    notice_period: "",
    skills: selectedJob?.skills || [],
    type: selectedJob?.type || "Full Time",
    experience:
      selectedJob?.experience_min && selectedJob?.experience_max
        ? `${selectedJob.experience_min}-${selectedJob.experience_max} years`
        : "",
  });

  // Update form data when selected job changes
  useEffect(() => {
    if (selectedJob) {
      setFormData((prev) => ({
        ...prev,
        position: selectedJob.title || "",
        location: selectedJob.location || "",
        skills: selectedJob.skills || [],
        type: selectedJob.type || "Full Time",
        experience:
          selectedJob.experience_min && selectedJob.experience_max
            ? `${selectedJob.experience_min}-${selectedJob.experience_max} years`
            : "",
      }));
    }
  }, [selectedJob]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate match score based on skills match with job requirements
      let matchScore = 0;
      if (
        selectedJob?.skills &&
        selectedJob.skills.length > 0 &&
        formData.skills.length > 0
      ) {
        // Count matching skills
        const jobSkills = selectedJob.skills.map((skill) =>
          typeof skill === "string" ? skill.toLowerCase() : "",
        );
        const candidateSkills = formData.skills.map((skill) =>
          skill.toLowerCase(),
        );

        let matchCount = 0;
        for (const skill of candidateSkills) {
          if (
            jobSkills.some(
              (jobSkill) =>
                jobSkill === skill ||
                jobSkill.includes(skill) ||
                skill.includes(jobSkill),
            )
          ) {
            matchCount++;
          }
        }

        // Calculate percentage match
        matchScore = Math.round((matchCount / jobSkills.length) * 100);

        // Ensure minimum score for direct applications
        matchScore = Math.max(matchScore, 70); // At least 70% for direct applications
      } else {
        // Default score if no skills to compare
        matchScore = 85; // High default for direct applications
      }

      await createCandidate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        location: formData.location,
        notice_period: formData.notice_period,
        source: "Direct Application",
        match_score: matchScore,
        job_id: selectedJob?.id,
        stage_id: 1, // Default to screening stage
        type: formData.type,
        experience: formData.experience,
        skills: formData.skills.join(", "),
      });

      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit application",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Apply Directly: {selectedJob?.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Position - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                required
                value={formData.position}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Location - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                required
                value={formData.location}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Full Name - Editable */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>

            {/* Email - Editable */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email"
              />
            </div>

            {/* Phone Number - Editable */}
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter your phone number"
              />
            </div>

            {/* Notice Period - Editable */}
            <div className="space-y-2">
              <Label>Notice Period</Label>
              <Input
                required
                value={formData.notice_period}
                onChange={(e) =>
                  setFormData({ ...formData, notice_period: e.target.value })
                }
                placeholder="e.g. 30 days"
              />
            </div>

            {/* Employment Type - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={formData.type} disabled>
                <SelectTrigger className="bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Experience - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Experience Range</Label>
              <Input
                required
                value={formData.experience}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Skills - Multi-selector dropdown */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-col gap-2">
              {/* Select Dropdown */}
              <Select
                value=""
                onValueChange={(value) => {
                  if (!formData.skills.includes(value)) {
                    setFormData({
                      ...formData,
                      skills: [...formData.skills, value],
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skills to add" />
                </SelectTrigger>
                <SelectContent>
                  {/* Combine all skills for the dropdown */}
                  {[
                    ...domainSkills.map((skill) => ({
                      ...skill,
                      category: "Domain",
                    })),
                    ...technicalSkills.map((skill) => ({
                      ...skill,
                      category: "Technical",
                    })),
                    ...softSkills.map((skill) => ({
                      ...skill,
                      category: "Soft",
                    })),
                  ].map((skill) => (
                    <SelectItem key={skill.id} value={skill.name}>
                      {skill.name} ({skill.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Display Selected Skills */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    <span>{skill}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          skills: formData.skills.filter((s) => s !== skill),
                        });
                      }}
                    >
                      <span className="text-xs">×</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
