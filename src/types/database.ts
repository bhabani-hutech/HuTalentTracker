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
  openings?: number;
  interview_rounds?: any[];
  experience_min?: number;
  experience_max?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  location?: string;
  type?: JobType;
  experience?: string;
  skills?: string;
  job_id?: string;
  source?: string;
  match_score?: number;
  notice_period?: string;
  file_url?: string;
  stage_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "HR" | "Hiring Manager" | "Interviewer";
  department?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InterviewFeedback {
  id: string;
  interview_id?: string;
  candidate_id?: string;
  interviewer_id?: string;
  recommendation?: string;
  comments?: string;
  strengths?: string;
  improvements?: string;
  technical_skills?: number;
  communication_skills?: number;
  problem_solving?: number;
  cultural_fit?: number;
  experience_fit?: number;
  created_at?: string;
  updated_at?: string;
  candidate?: Candidate;
  interviewer?: User;
}

export interface Interview {
  id: string;
  candidate_id?: string;
  interviewer_id?: string;
  date: string;
  type: string;
  status?:
    | "Rejected in screening"
    | "Rejected -1"
    | "Rejected in -2"
    | "HR round"
    | "Cleared"
    | "Offered";
  feedback?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
  candidate?: {
    id: string;
    name: string;
    position?: string;
    job_id?: string;
    stage_id?: string;
    job?: {
      id: string;
      title: string;
    };
    stage?: {
      id: string;
      stage: string;
    };
  };
  interviewer?: {
    id: string;
    name: string;
  };
}
