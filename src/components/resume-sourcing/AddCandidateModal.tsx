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
import { useState, useEffect, useRef } from "react";
import { useToast } from "../ui/use-toast";
import { createCandidate, uploadResume } from "@/lib/api/candidates";
import { Job, JobType } from "@/types/database";
import { useSkills } from "@/lib/api/hooks/useSkills";
import { useOrganizations } from "@/lib/api/hooks/useOrganizations";
import { useJobs } from "@/lib/api/hooks/useJobs";
import { useDepartments } from "@/lib/api/hooks/useDepartments";
import { FileUp, X } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateData?: Candidate;
  isEditing?: boolean;
}

interface CandidateData {
  name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  notice_period: string;
  skills: string[];
  type: JobType;
  experience: string;
  candidate_source: "Direct Apply" | "Hiring Partner";
  hiring_partner_id?: string;
  resume_file?: File;
  file_url?: string;
  job_id?: string;
  department?: string;
}

export function AddCandidateModal({
  isOpen,
  onClose,
  candidateData,
  isEditing = false,
}: AddCandidateModalProps) {
  const { toast } = useToast();
  const { skills: domainSkills } = useSkills("domain");
  const { skills: technicalSkills } = useSkills("technical");
  const { skills: softSkills } = useSkills("soft");
  const { organizations } = useOrganizations();
  const { jobs } = useJobs();
  const { departments } = useDepartments();
  const hiringPartners = organizations?.filter((org) => !org.is_own_org) || [];

  const [formData, setFormData] = useState<CandidateData>({
    name: candidateData?.name || "",
    email: candidateData?.email || "",
    phone: candidateData?.phone || "",
    position: candidateData?.position || "",
    location: candidateData?.location || "Remote",
    notice_period: candidateData?.notice_period || "",
    skills: candidateData?.skills
      ? candidateData.skills.split(", ").filter(Boolean)
      : [],
    type: (candidateData?.type as JobType) || "Full Time",
    experience: candidateData?.experience || "0-1 years",
    candidate_source:
      candidateData?.candidate_source === "Hiring Partner"
        ? "Hiring Partner"
        : "Direct Apply",
    resume_file: undefined,
    file_url: candidateData?.file_url,
    job_id: candidateData?.job_id,
    department: candidateData?.department_id,
    hiring_partner_id: candidateData?.hiring_partner_id,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate hiring partner selection if candidate source is Hiring Partner
    if (
      formData.candidate_source === "Hiring Partner" &&
      !formData.hiring_partner_id
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a hiring partner",
      });
      return;
    }

    try {
      // Calculate match score based on skills match with job requirements
      let matchScore = candidateData?.match_score || 0;
      let selectedJob = null;

      if (formData.job_id && !isEditing) {
        selectedJob = jobs?.find((job) => job.id === formData.job_id);

        if (
          selectedJob?.skills &&
          selectedJob.skills.length > 0 &&
          formData.skills.length > 0
        ) {
          // Count matching skills
          const jobSkills = selectedJob.skills.map((skill) =>
            typeof skill === "string" ? skill.toLowerCase() : ""
          );
          const candidateSkills = formData.skills.map((skill) =>
            skill.toLowerCase()
          );

          let matchCount = 0;
          for (const skill of candidateSkills) {
            if (
              jobSkills.some(
                (jobSkill) =>
                  jobSkill === skill ||
                  jobSkill.includes(skill) ||
                  skill.includes(jobSkill)
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
      }

      // Upload resume if it exists and we don't have a URL yet
      let fileUrl = formData.file_url;
      if (formData.resume_file && !fileUrl) {
        setIsUploading(true);
        try {
          fileUrl = await uploadResume(formData.resume_file);
        } catch (error) {
          console.error("Error uploading resume:", error);
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: "Failed to upload resume file",
          });
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const candidatePayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        location: formData.location,
        notice_period: formData.notice_period,
        source:
          formData.candidate_source === "Hiring Partner"
            ? "Hiring Partner Referral"
            : "Direct Application",
        match_score: matchScore,
        job_id: formData.job_id,
        stage_id: candidateData?.stage_id || 1, // Default to screening stage
        type: formData.type,
        experience: formData.experience,
        skills: formData.skills.join(", "),
        candidate_source: formData.candidate_source,
        hiring_partner_id: formData.hiring_partner_id,
        file_url: fileUrl,
      };

      if (isEditing && candidateData?.id) {
        // Update existing candidate
        await updateCandidate(candidateData.id, candidatePayload);
        toast({
          title: "Success",
          description: "Candidate updated successfully",
        });
      } else {
        // Create new candidate
        await createCandidate(candidatePayload);
        toast({
          title: "Success",
          description: "Candidate added successfully",
        });
      }

      onClose();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} candidate:`,
        error,
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} candidate`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Candidate" : "Add New Candidate"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Position/Job - Dropdown */}
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={formData.job_id || ""}
                onValueChange={(value) => {
                  const selectedJob = jobs?.find((job) => job.id === value);
                  setFormData({
                    ...formData,
                    job_id: value,
                    position: selectedJob?.title || formData.position,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {jobs?.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}({job.location})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location - Editable */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={formData.job_id || ""}
                onValueChange={(value) => {
                  const selectedJob = jobs?.find((job) => job.id === value);
                  setFormData({
                    ...formData,
                    job_id: value,
                    position: selectedJob?.title || formData.position,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {jobs?.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                    {job.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                placeholder="Enter candidate's full name"
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
                placeholder="Enter candidate's email"
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
                placeholder="Enter candidate's phone number"
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

            {/* Department - Dropdown */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.department || ""}
                onValueChange={(value) => {
                  setFormData({ ...formData, department: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employment Type - Dropdown */}
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as JobType })
                }
              >
                <SelectTrigger>
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

            {/* Experience - Editable */}
            <div className="space-y-2">
              <Label>Experience</Label>
              <Input
                required
                value={formData.experience}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                placeholder="e.g. 2.4 years"
              />
            </div>
          </div>

          {/* Candidate Source */}
          <div className="space-y-2">
            <Label>How was this candidate sourced?</Label>
            <Select
              value={formData.candidate_source}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  candidate_source: value as "Direct Apply" | "Hiring Partner",
                  // Reset hiring partner if Direct Apply is selected
                  hiring_partner_id:
                    value === "Direct Apply"
                      ? undefined
                      : formData.hiring_partner_id,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Direct Apply">Direct Apply</SelectItem>
                <SelectItem value="Hiring Partner">
                  Sourced by a Hiring Partner
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hiring Partner Selection - Only show if candidate_source is Hiring Partner */}
          {formData.candidate_source === "Hiring Partner" && (
            <div className="space-y-2">
              <Label>
                <span className="flex items-center gap-1">
                  Select Hiring Partner
                  <span className="text-red-500">*</span>
                </span>
              </Label>
              <Select
                value={formData.hiring_partner_id || ""}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    hiring_partner_id: value,
                  });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a hiring partner" />
                </SelectTrigger>
                <SelectContent>
                  {hiringPartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.candidate_source === "Hiring Partner" &&
                !formData.hiring_partner_id && (
                  <p className="text-sm text-red-500 mt-1">
                    Hiring partner selection is required
                  </p>
                )}
            </div>
          )}

          {/* Skills - Multi-selector dropdown */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-col gap-2">
              {/* Select Dropdown */}
              <Select
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

          {/* Resume Upload Field */}
          <div className="space-y-2">
            <Label>
              <span className="flex items-center gap-1">
                Resume
                <span className="text-red-500">*</span>
              </span>
            </Label>

            {formData.file_url || formData.resume_file ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <div className="flex-1 truncate">
                  {formData.resume_file?.name || "Resume uploaded"}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      resume_file: undefined,
                      file_url: undefined,
                    });
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="resume-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFormData({
                        ...formData,
                        resume_file: e.target.files[0],
                      });
                      setUploadError(null);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload Resume"}
                </Button>
              </div>
            )}

            {uploadError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-muted-foreground">
              Accepted formats: PDF, DOC, DOCX
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isEditing ? "Update Candidate" : "Add Candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
