// ... existing types ...

export type JobType = "Full Time" | "Part Time" | "Contract" | "Internship";
export type JobLevel =
  | "Entry Level"
  | "Mid Level"
  | "Senior Level"
  | "Lead"
  | "Manager"
  | "Director";
export type JobStatus = "Draft" | "Published" | "Closed" | "On Hold";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  level: JobLevel;
  status: JobStatus;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills?: string[];
  salary_min?: number;
  salary_max?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
