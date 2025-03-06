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
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Candidate } from "@/lib/api/candidates";
import { supabase } from "@/lib/supabase";
import { useSkills } from "@/lib/api/hooks/useSkills";

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

  // Fetch locations from own organizations
  useEffect(() => {
    const fetchOwnOrgLocations = async () => {
      try {
        const { data: organizations, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("is_own_org", true);

        if (error) throw error;

        // Extract all locations from own organizations
        const allLocations = [];
        for (const org of organizations || []) {
          if (org.locations && Array.isArray(org.locations)) {
            for (const location of org.locations) {
              allLocations.push({
                name: location.name,
                address: [
                  location.address,
                  location.city,
                  location.state,
                  location.country,
                ]
                  .filter(Boolean)
                  .join(", "),
              });
            }
          }
        }
        setOwnOrgLocations(allLocations);
      } catch (error) {
        console.error("Error fetching organization locations:", error);
      }
    };

    fetchOwnOrgLocations();
  }, []);

  // Populate form when candidate data is available
  useEffect(() => {
    if (candidate) {
      reset(candidate); // Reset the form with candidate details
    }
  }, [candidate, reset]);

  const submitForm = async (data: Partial<Candidate>) => {
    if (!candidate) return;
    try {
      await onSubmit(candidate.id, data);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job</Label>
              <Select
                value={watch("job_id") || ""}
                onValueChange={(value) => setValue("job_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled>No jobs available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={watch("type") || ""}
                onValueChange={(value) => setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Experience</Label>
            <Select
              value={watch("experience") || ""}
              onValueChange={(value) => setValue("experience", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1 years">0-1 years</SelectItem>
                <SelectItem value="1-3 years">1-3 years</SelectItem>
                <SelectItem value="3-5 years">3-5 years</SelectItem>
                <SelectItem value="5+ years">5+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={watch("location") || ""}
              onValueChange={(value) => setValue("location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {ownOrgLocations.length > 0 && (
                  <>
                    {ownOrgLocations.map((location, index) => (
                      <SelectItem key={index} value={location.name}>
                        {location.name} - {location.address}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {watch("location") === "Other" && (
              <Input
                className="mt-2"
                {...register("location")}
                placeholder="Enter custom location"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input {...register("name")} placeholder="Enter full name" />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              {...register("email")}
              type="email"
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <Label>Notice Period</Label>
            <Input {...register("notice_period")} placeholder="e.g. 30 days" />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-col gap-2">
              {/* Select Dropdown */}
              <Select
                value=""
                onValueChange={(value) => {
                  try {
                    const currentSkills = watch("skills") || "";
                    const skillsArray = currentSkills
                      ? currentSkills
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : [];

                    if (!skillsArray.includes(value)) {
                      skillsArray.push(value);
                      setValue("skills", skillsArray.join(", "));
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
                {(() => {
                  try {
                    const skillsString = watch("skills") || "";
                    if (!skillsString) return null;

                    const skillsArray = skillsString
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);

                    return skillsArray.map((skill, index) => (
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
                              const currentSkills = watch("skills") || "";
                              const updatedSkills = currentSkills
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s && s !== skill);
                              setValue("skills", updatedSkills.join(", "));
                            } catch (error) {
                              console.error("Error removing skill:", error);
                            }
                          }}
                        >
                          <span className="text-xs">×</span>
                        </Button>
                      </div>
                    ));
                  } catch (error) {
                    console.error("Error rendering skills:", error);
                    return null;
                  }
                })()}
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
