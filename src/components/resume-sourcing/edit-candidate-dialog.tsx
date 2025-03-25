import { useEffect, useState } from "react";
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
import { Candidate } from "@/lib/api/candidates";
import { useSkills } from "@/lib/api/hooks/useSkills";
import { useLocations } from "@/lib/api/hooks/useLocations";
import { useJobs } from "@/lib/api/hooks/useJobs";

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

  // Use the locations hook instead of fetching directly
  const { locations, isLoading: isLoadingLocations } = useLocations();

  // State to store the selected job details
  const [selectedJob, setSelectedJob] = useState<any>(null);

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
      reset(candidate); // Reset the form with candidate details

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
      // Only submit the fields that are editable
      const updates: Partial<Candidate> = {
        name: data.name,
        notice_period: data.notice_period,
        skills:
          typeof data.skills === "string"
            ? data.skills
            : data.skills?.join(", "),
      };

      await onSubmit(candidate.id, updates);
      onClose();
    } catch (error) {
      console.error("Error updating candidate:", error);
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
      <DialogContent className="sm:max-w-[600px]">
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

          {/* Skills - Editable */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-col gap-2">
              {/* Select Dropdown */}
              <Select
                value=""
                onValueChange={(value) => {
                  try {
                    const skillsArray = getSkillsArray();

                    if (!skillsArray.includes(value)) {
                      const newSkillsArray = [...skillsArray, value];
                      setValue(
                        "skills",
                        typeof watch("skills") === "string"
                          ? newSkillsArray.join(", ")
                          : newSkillsArray,
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
                            (s) => s !== skill,
                          );

                          setValue(
                            "skills",
                            typeof watch("skills") === "string"
                              ? updatedSkills.join(", ")
                              : updatedSkills,
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
