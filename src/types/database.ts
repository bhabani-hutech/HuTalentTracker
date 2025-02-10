export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  source?: string;
  match_score?: number;
  notice_period?: string;
  status?:
    | "Rejected in screening"
    | "Rejected -1"
    | "Rejected in -2"
    | "Cleared"
    | "HR round"
    | "Offered";
  created_at?: string;
  updated_at?: string;
}

export interface Interview {
  id: string;
  candidate_id: string;
  interviewer_id: string;
  type: string;
  date: string;
  status?:
    | "Rejected in screening"
    | "Rejected -1"
    | "Rejected in -2"
    | "Cleared"
    | "HR round"
    | "Offered";
  feedback?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
  candidate?: Candidate;
  interviewer?: User;
}

export interface Document {
  id: string;
  candidate_id: string;
  name: string;
  type: string;
  url: string;
  status: "Pending" | "Signed" | "Rejected" | "Expired";
  signed_at?: string;
  created_at?: string;
  updated_at?: string;
  candidate?: Candidate;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "HR" | "Hiring Manager" | "Interviewer";
  department?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
