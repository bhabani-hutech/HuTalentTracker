// This file contains types and functions related to resume handling

export interface Resume {
  id: string;
  name: string; 
  email: string;
  phone: string;
  skills?: string[];
  position?: string;
  experience?: string;
  location?: string;
  match_score?: number;
  candidate_id: string;
  file_url: string;
  parsed_data?: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: string;
    education?: string[];
    summary?: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Mock function to fetch resumes
export async function getResumes() {
  // This would be implemented with actual Supabase queries
  return [] as Resume[];
}
