import * as z from "zod";

export const jobFormSchema = z
  .object({
    title: z.string().min(1, "Job title is required"),
    department: z.string().min(1, "Department is required"),
    location: z.string().min(1, "Location is required"),
    type: z.enum(["Full Time", "Part Time", "Contract", "Internship"]),
    level: z.enum([
      "Entry Level",
      "Mid Level",
      "Senior Level",
      "Lead",
      "Manager",
      "Director",
    ]),
    status: z.enum(["Draft", "Published", "Closed", "On Hold"]),
    description: z.string().min(1, "Description is required"),
    requirements: z
      .array(z.string())
      .min(1, "At least one requirement is required"),
    responsibilities: z
      .array(z.string())
      .min(1, "At least one responsibility is required"),
    skills: z.array(z.string()).optional(),
    salary_min: z.number().optional(),
    salary_max: z.number().optional(),
    openings: z.number().min(1, "Number of openings is required"),
    interview_rounds: z
      .array(
        z.object({
          name: z.string().min(1, "Round name is required"),
          type: z.string().min(1, "Round type is required"),
          duration: z.number().min(15, "Duration must be at least 15 minutes"),
        }),
      )
      .min(1, "At least one interview round is required"),
    experience_min: z.number().min(0, "Minimum experience cannot be negative"),
    experience_max: z.number().min(0, "Maximum experience cannot be negative"),
  })
  .refine(
    (data) => {
      if (data.salary_min && data.salary_max) {
        return data.salary_max > data.salary_min;
      }
      return true;
    },
    {
      message: "Maximum salary must be greater than minimum salary",
      path: ["salary_max"],
    },
  )
  .refine(
    (data) => {
      return data.experience_max > data.experience_min;
    },
    {
      message: "Maximum experience must be greater than minimum experience",
      path: ["experience_max"],
    },
  );
