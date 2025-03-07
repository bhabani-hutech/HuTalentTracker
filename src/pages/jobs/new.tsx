import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { jobFormSchema } from "@/lib/schemas/job"; // Adjust path as needed
import { generateJobDescription } from "@/lib/api/ai"; // Adjust path as needed
import { useParams, useNavigate } from "react-router-dom";
import { Wand2, Loader2 } from "lucide-react"; // Make sure you have lucide-react installed
import { useJobs } from "@/lib/api/hooks/useJobs"; // Adjust path as needed
import { useDepartments } from "@/lib/api/hooks/useDepartments"; // Adjust path as needed
import { useToast } from "@/components/ui/use-toast"; // Adjust path as needed
import { SkillSelector } from "@/components/jobs/skill-selector"; // Adjust path as needed
import { Button } from "@/components/ui/button"; // Adjust path as needed
import { Input } from "@/components/ui/input"; // Adjust path as needed
import { Label } from "@/components/ui/label"; // Adjust path as needed
import { Textarea } from "@/components/ui/textarea"; // Adjust path as needed
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust path as needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Adjust path as needed
import { JobType, JobStatus } from "@/types/database"; // Adjust path as needed
import { supabase } from "@/lib/supabase";

export default function NewJob() {
  const { id } = useParams();
  const { jobs, createJob, updateJob } = useJobs();
  const { departments } = useDepartments();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [locations, setLocations] = useState<
    { id: number; name: string; address: string }[]
  >([]);

  const form = useForm<z.infer<typeof jobFormSchema>>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      department: "",
      location: "",
      type: "Full Time",
      level: "Mid Level", // If you have a job level type, replace string with it
      status: "Draft",
      description: "",
      requirements: [],
      responsibilities: [],
      skills: [],
      domain_skills: [],
      technical_skills: [],
      soft_skills: [],
      openings: 1,
      interview_rounds: [
        { name: "Initial Screening", type: "HR", duration: 30 },
      ],
      experience_min: 1,
      experience_max: 3,
    },
    mode: "onChange",
  });

  console.log(form);
  console.log(form.formState.errors);

  const [newRequirement, setNewRequirement] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
  } = form; // Destructure handleSubmit and errors

  const onSubmit = useCallback(
    async (data: z.infer<typeof jobFormSchema>) => {
      try {
        if (id) {
          await updateJob({ id, updates: data });
          toast({
            title: "Success",
            description: "Job posting updated successfully",
          });
        } else {
          await createJob(data);
          toast({
            title: "Success",
            description: "Job posting created successfully",
          });
        }
        navigate("/jobs");
      } catch (error) {
        console.error("Error submitting job:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save job posting",
        });
      }
    },
    [id, createJob, updateJob, navigate, toast],
  );

  useEffect(() => {
    if (id && jobs) {
      const jobToEdit = jobs.find((job) => job.id === id);
      if (jobToEdit) {
        form.reset(jobToEdit);
      }
    }
  }, [id, jobs, form]);

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
                id: Date.now() + Math.random(), // Generate a unique ID
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
        setLocations(allLocations);
      } catch (error) {
        console.error("Error fetching organization locations:", error);
      }
    };

    fetchOwnOrgLocations();
  }, []);

  // Alternative approach using the API hook (commented out for reference)
  // const { locations: orgLocations, isLoading: isLoadingLocations } = useLocations();

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const currentRequirements = form.getValues("requirements") || [];
      form.setValue("requirements", [
        ...currentRequirements,
        newRequirement.trim(),
      ]);
      form.trigger("requirements");
      setNewRequirement("");
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      const currentResponsibilities = form.getValues("responsibilities") || [];
      form.setValue("responsibilities", [
        ...currentResponsibilities,
        newResponsibility.trim(),
      ]);
      form.trigger("responsibilities");
      setNewResponsibility("");
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? "Edit Job" : "Post New Job"}
        </h1>
        <p className="text-muted-foreground">Create a new job posting</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input {...form.register("title")} />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  name="department"
                  value={form.watch("department") || ""}
                  onValueChange={(value) => {
                    const dept = departments?.find((d) => d.name === value);
                    form.setValue("department", value);
                    // No need to set department_id as it's not in the form schema
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.department && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.department.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={form.watch("location") || ""}
                  onValueChange={(value) => form.setValue("location", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.length > 0 ? (
                      locations.map((location) => (
                        <SelectItem key={location.id} value={location.name}>
                          {location.name} - {location.address}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="custom">Custom Location</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {form.watch("location") === "custom" && (
                  <Input
                    className="mt-2"
                    placeholder="Enter custom location"
                    value={
                      form.watch("location") === "custom"
                        ? ""
                        : form.watch("location")
                    }
                    onChange={(e) => form.setValue("location", e.target.value)}
                  />
                )}
                {form.formState.errors.location && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select
                  name="type"
                  value={form.watch("type") || ""}
                  onValueChange={(value: JobType) =>
                    form.setValue("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Time">Full Time</SelectItem>
                    <SelectItem value="Part Time">Part Time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.type.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Experience Range</Label>
                <div className="flex gap-4">
                  {/* Min Experience */}
                  <Select
                    name="experience_min"
                    value={form.watch("experience_min")?.toString() || ""}
                    onValueChange={(value) => {
                      form.setValue("experience_min", parseInt(value));
                      // Ensure min is less than max
                      if (
                        form.watch("experience_max") &&
                        parseInt(value) > form.watch("experience_max")
                      ) {
                        form.setValue("experience_max", parseInt(value));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map(
                        (year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year} {year === 1 ? "year" : "years"}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>

                  <span className="flex items-center">to</span>

                  {/* Max Experience */}
                  <Select
                    name="experience_max"
                    value={form.watch("experience_max")?.toString() || ""}
                    onValueChange={(value) => {
                      form.setValue("experience_max", parseInt(value));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(
                        (year) => (
                          <SelectItem
                            key={year}
                            value={year.toString()}
                            disabled={
                              form.watch("experience_min") &&
                              year < form.watch("experience_min")
                            }
                          >
                            {year} {year === 1 ? "year" : "years"}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Messages */}
                {form.formState.errors.experience_min && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.experience_min.message}
                  </p>
                )}
                {form.formState.errors.experience_max && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.experience_max.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={form.watch("status") || ""}
                  onValueChange={(value: JobStatus) =>
                    form.setValue("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={
                    !form.getValues("title") ||
                    !form.getValues("level") ||
                    isGenerating
                  }
                  onClick={async () => {
                    const title = form.getValues("title");
                    const level = form.getValues("level");
                    if (!title || !level) {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description:
                          "Please enter a job title and select a level first",
                      });
                      return;
                    }

                    setIsGenerating(true);
                    try {
                      const generated = await generateJobDescription(
                        title,
                        level,
                      );

                      form.setValue("description", generated.description);
                      form.setValue("requirements", generated.requirements);
                      form.setValue(
                        "responsibilities",
                        generated.responsibilities,
                      );
                      form.setValue("skills", generated.skills);

                      toast({
                        title: "Success",
                        description: "Job description generated successfully",
                      });
                    } catch (error) {
                      console.error("Error generating description:", error);
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to generate job description",
                      });
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                {...form.register("description")}
                className="min-h-[100px]"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Number of Openings</Label>
                <Input
                  type="number"
                  min="1"
                  {...form.register("openings", { valueAsNumber: true })}
                />
                {form.formState.errors.openings && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.openings.message}
                  </p>
                )}
              </div>
            </div>

            <SkillSelector
              skillType="domain"
              label="Domain Skills"
              selectedSkills={(form.watch("domain_skills") as any) || []}
              onChange={(skills) =>
                form.setValue("domain_skills", skills as any)
              }
            />

            <SkillSelector
              skillType="technical"
              label="Technical Skills"
              selectedSkills={(form.watch("technical_skills") as any) || []}
              onChange={(skills) =>
                form.setValue("technical_skills", skills as any)
              }
            />

            <SkillSelector
              skillType="soft"
              label="Soft Skills"
              selectedSkills={(form.watch("soft_skills") as any) || []}
              onChange={(skills) => form.setValue("soft_skills", skills as any)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement"
              />
              <Button type="button" onClick={addRequirement}>
                Add
              </Button>
            </div>

            {form.formState.errors.requirements && (
              <p className="text-sm text-red-500">
                {form.formState.errors.requirements.message}
              </p>
            )}

            <ul className="list-disc pl-6 space-y-2">
              {form.getValues("requirements")?.map((req, index) => (
                <li key={index} className="text-sm">
                  {req}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-red-500 hover:text-red-600"
                    onClick={() => {
                      const currentRequirements =
                        form.getValues("requirements");
                      const updatedRequirements = currentRequirements.filter(
                        (_, i) => i !== index,
                      );
                      form.setValue("requirements", updatedRequirements);
                      form.trigger("requirements"); // Trigger validation
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                placeholder="Add a responsibility"
              />
              <Button type="button" onClick={addResponsibility}>
                Add
              </Button>
            </div>

            {form.formState.errors.responsibilities && (
              <p className="text-sm text-red-500">
                {form.formState.errors.responsibilities.message}
              </p>
            )}

            <ul className="list-disc pl-6 space-y-2">
              {form.getValues("responsibilities")?.map((resp, index) => (
                <li key={index} className="text-sm">
                  {resp}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-red-500 hover:text-red-600"
                    onClick={() => {
                      const currentResponsibilities =
                        form.getValues("responsibilities");
                      const updatedResponsibilities =
                        currentResponsibilities.filter((_, i) => i !== index);
                      form.setValue(
                        "responsibilities",
                        updatedResponsibilities,
                      );
                      form.trigger("responsibilities"); // Trigger validation
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/jobs")}
          >
            Cancel
          </Button>
          <Button type="submit">
            {id ? "Update Job Posting" : "Create Job Posting"}
          </Button>
        </div>
      </form>
    </div>
  );
}
