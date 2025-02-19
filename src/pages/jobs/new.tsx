import { useState, useMemo, useEffect } from "react";
import { generateJobDescription } from "@/lib/api/ai";
import { useParams } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  // Load job data if editing
  useEffect(() => {
    if (id && jobs) {
      const jobToEdit = jobs.find((job) => job.id === id);
      if (jobToEdit) {
        setFormData(jobToEdit);
      }
    }
  }, [id, jobs]);
  const { toast } = useToast();

  // Get unique departments from existing jobs
  const departments = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map((job) => job.department))).sort();
  }, [jobs]);

  const [formData, setFormData] = useState<
    Omit<Job, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">
  >({
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
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateJob({ id, updates: formData });
        toast({
          title: "Success",
          description: "Job posting updated successfully",
        });
      } else {
        await createJob(formData);
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
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      });
      setNewRequirement("");
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData({
        ...formData,
        responsibilities: [
          ...formData.responsibilities,
          newResponsibility.trim(),
        ],
      });
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
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
                <Input
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: JobType) =>
                    setFormData({ ...formData, type: value })
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
                <Label>Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: JobLevel) =>
                    setFormData({ ...formData, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry Level">Entry Level</SelectItem>
                    <SelectItem value="Mid Level">Mid Level</SelectItem>
                    <SelectItem value="Senior Level">Senior Level</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: JobStatus) =>
                    setFormData({ ...formData, status: value })
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
                  disabled={!formData.title || !formData.level || isGenerating}
                  onClick={async () => {
                    if (!formData.title || !formData.level) {
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
                        formData.title,
                        formData.level,
                      );

                      setFormData({
                        ...formData,
                        description: generated.description,
                        requirements: generated.requirements,
                        responsibilities: generated.responsibilities,
                        skills: generated.skills,
                      });

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
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Minimum Salary</Label>
                <Input
                  type="number"
                  value={formData.salary_min || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salary_min: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Salary</Label>
                <Input
                  type="number"
                  value={formData.salary_max || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salary_max: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Skills</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={!formData.title || !formData.level || isGenerating}
                onClick={async () => {
                  if (!formData.title || !formData.level) {
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
                      formData.title,
                      formData.level,
                    );

                    setFormData({
                      ...formData,
                      skills: generated.skills,
                    });

                    toast({
                      title: "Success",
                      description: "Skills generated successfully",
                    });
                  } catch (error) {
                    console.error("Error generating skills:", error);
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "Failed to generate skills",
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
                {isGenerating ? "Generating..." : "Generate Skills"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.skills?.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {skill}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        skills: formData.skills?.filter((_, i) => i !== index),
                      })
                    }
                  >
                    ×
                  </Button>
                </Badge>
              ))}
              <Input
                placeholder="Add a skill"
                className="w-32 h-7"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      setFormData({
                        ...formData,
                        skills: [...(formData.skills || []), value],
                      });
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
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
              {formData.requirements.map((req, index) => (
                <li key={index} className="text-sm">
                  {req}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-red-500 hover:text-red-600"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        requirements: formData.requirements.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
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
              {formData.responsibilities.map((resp, index) => (
                <li key={index} className="text-sm">
                  {resp}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-red-500 hover:text-red-600"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        responsibilities: formData.responsibilities.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
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
