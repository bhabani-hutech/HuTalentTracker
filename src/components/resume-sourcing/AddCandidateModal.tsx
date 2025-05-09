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
import {
  createCandidate,
  updateCandidate,
  uploadResume,
} from "@/lib/api/candidates";
import { Job, JobType, Candidate } from "@/types/database"; // Import Candidate type
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
  file_url?: File | string;
  job_id?: string;
  department?: string;
  hiring_partner_name?: string;
}

export function AddCandidateModal({
  isOpen,
  onClose,
  candidateData,
  isEditing = false,
}: AddCandidateModalProps) {
  console.log("Candidate Data:", candidateData);
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
    experience: candidateData?.experience || "1",
    candidate_source:
      candidateData?.candidate_source === "Hiring Partner"
        ? "Hiring Partner"
        : "Direct Apply",
    file_url: candidateData?.file_url,
    job_id: candidateData?.job_id,
    department: candidateData?.department,
    hiring_partner_id: candidateData?.hiring_partner_id,
    hiring_partner_name: candidateData?.Organization?.name,
  });

  useEffect(() => {
    if (candidateData) {
      setFormData({
        name: candidateData.name || "",
        email: candidateData.email || "",
        phone: candidateData.phone || "",
        position: candidateData.position || "",
        location: candidateData.location || "Remote",
        notice_period: candidateData.notice_period || "",
        skills: candidateData.skills
          ? candidateData.skills.split(", ").filter(Boolean)
          : [],
        type: (candidateData.type as JobType) || "Full Time",
        experience: candidateData.experience || "0",
        candidate_source:
          candidateData.candidate_source === "Hiring Partner"
            ? "Hiring Partner"
            : "Direct Apply",
        file_url: candidateData.file_url,
        job_id: candidateData.job_id,
        department: candidateData.department,
        hiring_partner_id: candidateData.hiring_partner_id || null,
        hiring_partner_name: candidateData.Organization?.name || "",
      });
    }
  }, [candidateData]);
  console.log(formData);
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
      if (!fileUrl || fileUrl instanceof File) {
        setIsUploading(true);
        try {
          if (formData.file_url instanceof File) {
            // Upload the file and get the URL
            fileUrl = await uploadResume(formData.file_url);
          } else {
            throw new Error("Invalid file type for upload");
          }
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
        department: formData.department,
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
        file_url: fileUrl || "", // Ensure fileUrl is a string
      };

      if (isEditing && candidateData?.id) {
        // Update existing candidate
        await updateCandidate(candidateData.id, candidatePayload);
        toast({
          title: "Success",
          description: "Candidate updated successfully",
        });
      } else {
        console.log(candidateData);
        // Create new candidate
        await createCandidate({
          ...candidatePayload,
          Organization: candidateData?.Organization || null,
        });
        toast({
          title: "Success",
          description: "Candidate added successfully",
        });
      }

      onClose();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} candidate:`,
        error
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${
          isEditing ? "update" : "add"
        } candidate due to ${error}`,
      });
    }
  };
  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only digits and one optional decimal point
    const regex = /^\d*\.?\d*$/;

    if (value === "" || regex.test(value)) {
      setFormData({ ...formData, experience: value });
    }
  };
  interface ErrorValidation {
    emailError: string;
    nameError: string;
  }

  const [errorValidation, setErrorValidation] = useState<ErrorValidation>({
    emailError: "",
    nameError: "",
  });

  // const emailErrorFormat =(error: string)=>{
  //   setEmailError(error);
  // }

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
              <Label>Position</Label> <span className="text-red-500">*</span>
              <Select
                value={formData.job_id || ""}
                onValueChange={(value) => {
                  const selectedJob = jobs?.find((job) => job.id === value);
                  setFormData({
                    ...formData,
                    job_id: value,
                    position: selectedJob?.title || formData.position,
                    department: selectedJob?.department || formData.department,
                    location: selectedJob?.location || formData.location,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {jobs
                    ?.filter((job) => job.status === "Published")
                    .map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} ({job.location})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location - Editable */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                disabled
                placeholder="Department"
              />
            </div>

            {/* Full Name - Editable */}
            <div className="space-y-2">
              <Label>Full Name</Label> <span className="text-red-500">*</span>
              <Input
                required
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;

                  // Format name (capitalize each word)
                  const formattedValue = value
                    .split(" ")
                    // .filter(Boolean) // Remove extra spaces
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ");

                  setFormData({ ...formData, name: formattedValue });

                  const nameRegex = /^[A-Za-z.]+(?: [A-Za-z.]+)*$/;

                  if (
                    formattedValue &&
                    (!nameRegex.test(formattedValue) ||
                      formattedValue.length > 50)
                  ) {
                    setErrorValidation({
                      ...errorValidation,
                      nameError:
                        "Name can only contain letters, dots, and spaces (max 50 characters)",
                    });
                  } else {
                    setErrorValidation({ ...errorValidation, nameError: "" });
                  }
                }}
                placeholder="Enter candidate's full name"
              />
              {errorValidation.nameError && (
                <p className="text-sm text-red-500">
                  {errorValidation.nameError}
                </p>
              )}
            </div>

            {/* Email - Editable */}
            <div className="space-y-2">
              <Label>Email</Label> <span className="text-red-500">*</span>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, email: value });

                  // Validate email format
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (value && !emailRegex.test(value)) {
                    setErrorValidation({
                      ...errorValidation,
                      emailError: "Invalid email format",
                    });
                  } else {
                    setErrorValidation({ ...errorValidation, emailError: "" }); // Clear error
                  }
                }}
                placeholder="Enter candidate's email"
              />
              {errorValidation.emailError && (
                <p className="text-sm text-red-500">
                  {errorValidation.emailError}
                </p>
              )}
            </div>

            {/* Phone Number - Editable */}
            <div className="space-y-2">
              <Label>Phone Number</Label>{" "}
              <span className="text-red-500">*</span>
              <Input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

                  // Only allow up to 10 digits
                  if (value.length > 10) {
                    value = value.slice(0, 10);
                  }

                  // If first digit exists, it must be 6,7,8,9
                  if (
                    value.length === 1 &&
                    !["6", "7", "8", "9"].includes(value[0])
                  ) {
                    value = ""; // Clear if first digit is invalid
                  }

                  setFormData({ ...formData, phone: value });
                }}
                placeholder="Enter candidate's phone number"
              />
            </div>

            {/* Notice Period - Editable */}
            <div className="space-y-2">
              <Label>Notice Period (in days)</Label>{" "}
              <span className="text-red-500">*</span>
              <Input
                required
                value={formData.notice_period}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setFormData({ ...formData, notice_period: value });
                  }
                }}
                placeholder="e.g. 30"
              />
            </div>

            {/* Department - Dropdown */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={formData.department}
                disabled
                placeholder="Department"
              />
            </div>

            {/* Employment Type - Dropdown */}
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Input value={formData.type} disabled placeholder="Type" />
            </div>

            {/* Experience - Editable */}
            <div className="space-y-2">
              <Label>Experience (in years)</Label>
              <Input
                required
                value={formData.experience}
                onChange={handleExperienceChange}
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
                  hiring_partner_name:
                    value === "Direct Apply"
                      ? undefined
                      : formData.hiring_partner_name,
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

          {formData.candidate_source === "Hiring Partner" && (
            <div className="space-y-2">
              <Label>
                <span className="flex items-center gap-1">
                  Select Hiring Partner <span className="text-red-500">*</span>
                </span>
              </Label>
              <Select
                value={formData.hiring_partner_name}
                onValueChange={(value) => {
                  const selectedPartner = hiringPartners.find(
                    (partner) => partner.name.toString() === value
                  );
                  console.log(selectedPartner);
                  setFormData({
                    ...formData,
                    hiring_partner_id: selectedPartner?.id || "",
                    hiring_partner_name: selectedPartner?.name || "",
                  });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a hiring partner" />
                </SelectTrigger>
                <SelectContent>
                  {hiringPartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.name}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!formData.hiring_partner_name && (
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

            {formData.file_url ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <div className="flex-1 truncate">
                  {typeof formData.file_url === "string"
                    ? (formData.file_url as string).split("/").pop()
                    : formData.file_url?.name || "Resume uploaded"}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,

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
                    console.log(e.target.files);
                    if (e.target.files && e.target.files.length > 0) {
                      setFormData({
                        ...formData,
                        file_url: e.target.files[0],
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
