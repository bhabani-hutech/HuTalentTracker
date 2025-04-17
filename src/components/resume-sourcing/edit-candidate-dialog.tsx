import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Candidate, uploadResume } from "@/lib/api/candidates";
import { useSkills } from "@/lib/api/hooks/useSkills";
import { useLocations } from "@/lib/api/hooks/useLocations";
import { useJobs } from "@/lib/api/hooks/useJobs";
import { useOrganizations } from "@/lib/api/hooks/useOrganizations";
import { FileUp, X } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { useToast } from "../ui/use-toast";

interface EditCandidateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Candidate>) => Promise<void>;
  candidate: Candidate | null;
  jobs: { id: string; title: string }[];
}

export function EditCandidateDialog({
  isOpen,
  onClose,
  onSubmit,
  candidate,
  jobs,
}: EditCandidateDialogProps) {
  const { register, handleSubmit, setValue, watch, reset } =
    useForm<Partial<Candidate>>();
  const [ownOrgLocations, setOwnOrgLocations] = useState<
    { name: string; address: string }[]
  >([]);
  const { skills: domainSkills } = useSkills("domain");
  const { skills: technicalSkills } = useSkills("technical");
  const { skills: softSkills } = useSkills("soft");
  const { jobs: allJobs } = useJobs();
  const { organizations } = useOrganizations();
  const hiringPartners = organizations?.filter((org) => !org.is_own_org) || [];
  const { toast } = useToast();

  // Use the locations hook instead of fetching directly
  const { locations, isLoading: isLoadingLocations } = useLocations();

  // State to store the selected job details
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Resume upload states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update ownOrgLocations when locations change
  useEffect(() => {
    if (locations) {
      const formattedLocations = locations.map((location) => ({
        name: location.name,
        address:
          location.display_address ||
          [location.address, location.city, location.state, location.country]
            .filter(Boolean)
            .join(", "),
      }));
      setOwnOrgLocations(formattedLocations);
    }
  }, [locations]);

  // Populate form when candidate data is available
  useEffect(() => {
    if (candidate) {
      // Convert hiring_partner_id to string if it exists
      const candidateData = {
        ...candidate,
        hiring_partner_id: candidate.hiring_partner_id
          ? candidate.hiring_partner_id.toString()
          : undefined,
      };

      reset(candidateData); // Reset the form with candidate details

      // Set the file URL if it exists
      if (candidate.file_url) {
        setFileUrl(candidate.file_url);
      }

      // Find the job associated with this candidate
      if (candidate.job_id && allJobs) {
        const job = allJobs.find((job) => job.id === candidate.job_id);
        if (job) {
          setSelectedJob(job);
        }
      }
    }
  }, [candidate, reset, allJobs]);

  const submitForm = async (data: Partial<Candidate>) => {
    if (!candidate) return;
    try {
      // Upload resume if a new one was selected
      let updatedFileUrl = fileUrl;
      if (resumeFile) {
        setIsUploading(true);
        try {
          updatedFileUrl = await uploadResume(resumeFile);
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

      // Only submit the fields that are editable
      const updates: Partial<Candidate> = {
        name: data.name,
        notice_period: data.notice_period,
        skills:
          typeof data.skills === "string"
            ? data.skills
            : data.skills?.join(", "),
        candidate_source: data.candidate_source,
        hiring_partner_id: data.hiring_partner_id,
      };

      // Only include file_url if it has changed
      if (updatedFileUrl !== candidate.file_url) {
        updates.file_url = updatedFileUrl;
      }

      await onSubmit(candidate.id, updates);
      onClose();
    } catch (error) {
      console.error("Error updating candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update candidate",
      });
    }
  };
  // Combine all skills for the dropdown
  const allSkills = [
    ...domainSkills.map((skill) => ({ ...skill, category: "Domain" })),
    ...technicalSkills.map((skill) => ({ ...skill, category: "Technical" })),
    ...softSkills.map((skill) => ({ ...skill, category: "Soft" })),
  ];

  // Helper function to get skills array
  const getSkillsArray = () => {
    const skillsValue = watch("skills");
    if (!skillsValue) return [];

    if (typeof skillsValue === "string") {
      return skillsValue
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return Array.isArray(skillsValue) ? skillsValue : [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Candidate: {candidate?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Position - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                value={
                  jobs.find((job) => job.id === watch("job_id"))?.title ||
                  watch("position") ||
                  ""
                }
                disabled
                className="bg-muted"
              />
            </div>

            {/* Location - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={watch("location") || ""}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Full Name - Editable */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                required
                {...register("name")}
                placeholder="Enter full name"
              />
            </div>

            {/* Email - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={watch("email") || ""}
                disabled
                className="bg-muted"
                type="email"
                placeholder="Enter email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone Number - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={watch("phone") || ""}
                disabled
                className="bg-muted"
                type="tel"
                placeholder="Phone number"
              />
            </div>

            {/* Notice Period - Editable */}
            <div className="space-y-2">
              <Label>Notice Period</Label>
              <Input
                required
                {...register("notice_period")}
                placeholder="e.g. 30 days"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Employment Type - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Input
                value={watch("type") || "Full Time"}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Experience - Auto-populated and disabled */}
            <div className="space-y-2">
              <Label>Experience Range</Label>
              <Input
                value={watch("experience") || ""}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Candidate Source */}
          <div className="space-y-2">
            <Label>How was this candidate sourced?</Label>
            <Select
              value={watch("candidate_source") || "Direct Apply"}
              onValueChange={(value) => {
                setValue(
                  "candidate_source",
                  value as "Direct Apply" | "Hiring Partner"
                );
                if (value === "Direct Apply") {
                  setValue("hiring_partner_id", undefined);
                }
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
          {watch("candidate_source") === "Hiring Partner" && (
            <div className="space-y-2">
              <Label>
                <span className="flex items-center gap-1">
                  Select Hiring Partner
                  <span className="text-red-500">*</span>
                </span>
              </Label>
              <Select
                value={watch("hiring_partner_id") || ""}
                onValueChange={(value) => {
                  setValue("hiring_partner_name", value);
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
              {watch("candidate_source") === "Hiring Partner" &&
                !watch("hiring_partner_id") && (
                  <p className="text-sm text-red-500 mt-1">
                    Hiring partner selection is required
                  </p>
                )}
            </div>
          )}

          {/* Skills - Editable */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-col gap-2">
              {/* Select Dropdown */}
              <Select
                value={undefined}
                onValueChange={(value) => {
                  try {
                    const skillsArray = getSkillsArray();

                    if (!skillsArray.includes(value)) {
                      const newSkillsArray = [...skillsArray, value];
                      setValue(
                        "skills",
                        typeof watch("skills") === "string"
                          ? newSkillsArray.join(", ")
                          : newSkillsArray
                      );
                    }
                  } catch (error) {
                    console.error("Error adding skill:", error);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skills to add" />
                </SelectTrigger>
                <SelectContent>
                  {allSkills.length > 0 ? (
                    allSkills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.name}>
                        {skill.name} ({skill.category})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled>No skills available</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Display Selected Skills */}
              <div className="flex flex-wrap gap-2 mt-2">
                {getSkillsArray().map((skill, index) => (
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
                        try {
                          const skillsArray = getSkillsArray();
                          const updatedSkills = skillsArray.filter(
                            (s) => s !== skill
                          );

                          setValue(
                            "skills",
                            typeof watch("skills") === "string"
                              ? updatedSkills.join(", ")
                              : updatedSkills
                          );
                        } catch (error) {
                          console.error("Error removing skill:", error);
                        }
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
                {!fileUrl && !resumeFile && (
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                )}
              </span>
            </Label>

            {fileUrl || resumeFile ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <div className="flex-1 truncate">
                  {resumeFile?.name || (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View current resume
                    </a>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setResumeFile(null);
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
                      setResumeFile(e.target.files[0]);
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
