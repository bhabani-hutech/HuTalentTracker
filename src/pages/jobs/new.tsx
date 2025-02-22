import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { jobFormSchema } from "@/lib/schemas/job";
import { generateJobDescription } from "@/lib/api/ai";
import { useParams, useNavigate } from "react-router-dom";
import { Wand2, Loader2 } from "lucide-react";
import { useJobs } from "@/lib/api/hooks/useJobs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Job, JobLevel, JobType, JobStatus } from "@/types/database";

export default function NewJob() {
  const { id } = useParams();
  const { jobs, createJob, updateJob } = useJobs();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof jobFormSchema>>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      department: "",
      location: "",
      type: "Full Time",
      level: "Mid Level",
      status: "Draft",
      description: "",
      requirements: [],
      responsibilities: [],
      skills: [],
      salary_min: undefined,
      salary_max: undefined,
      openings: 1,
      interview_rounds: [],
      experience_min: 1,
      experience_max: 3,
    },
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Load job data if editing
  useEffect(() => {
    if (id && jobs) {
      const jobToEdit = jobs.find((job) => job.id === id);
      if (jobToEdit) {
        form.reset(jobToEdit);
      }
    }
  }, [id, jobs, form]);

  // Get unique departments from existing jobs
  const departments = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map((job) => job.department))).sort();
  }, [jobs]);

  const handleSubmit = async (data: z.infer<typeof jobFormSchema>) => {
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
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const currentRequirements = form.getValues("requirements") || [];
      form.setValue("requirements", [
        ...currentRequirements,
        newRequirement.trim(),
      ]);
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

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input {...form.register("title")} />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.getValues("department")}
                  onValueChange={(value) => form.setValue("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input {...form.register("location")} />
              </div>

              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={form.getValues("type")}
                  onValueChange={(value: JobType) =>
                    form.setValue("type", value)
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

              <div className="space-y-2">
                <Label>Experience Range</Label>
                <div className="flex gap-4">
                  <Select
                    value={form.getValues("experience_min")?.toString()}
                    onValueChange={(value) =>
                      form.setValue("experience_min", parseInt(value))
                    }
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
                  <Select
                    value={form.getValues("experience_max")?.toString()}
                    onValueChange={(value) =>
                      form.setValue("experience_max", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(
                        (year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year} {year === 1 ? "year" : "years"}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.getValues("status")}
                  onValueChange={(value: JobStatus) =>
                    form.setValue("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Number of Openings</Label>
                <Input
                  type="number"
                  min="1"
                  {...form.register("openings", { valueAsNumber: true })}
                />
              </div>
            </div>
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
                      form.setValue(
                        "requirements",
                        currentRequirements.filter((_, i) => i !== index),
                      );
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
                      form.setValue(
                        "responsibilities",
                        currentResponsibilities.filter((_, i) => i !== index),
                      );
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
