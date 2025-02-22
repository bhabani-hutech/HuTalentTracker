import { supabase } from "../supabase";

export interface Candidate {
  experience: string;
  type: "Full Time" | "Part Time" | "Contract" | "Internship";
  skills: string;
  location: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  job_id: string; // UUID reference to jobs table
  source: string;
  stage_id: number; // Reference to stage table's id (int8)
  match_score?: number;
  notice_period?: string;
  file_url?: string;
  created_at?: string;
  updated_at?: string;
}

export async function uploadResume(file: File): Promise<string> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const timestamp = new Date().getTime();
    const filePath = `uploads/${timestamp}_${cleanFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadResume:", error);
    throw error;
  }
}

export async function createCandidate(
  candidate: Omit<Candidate, "id" | "created_at" | "updated_at">,
) {
  const candidateWithDefaults = {
    ...candidate,
    source: candidate.source || "Manual Upload",
    email: candidate.email || "",
    stage_id: candidate.stage_id || 1, // Default to stage 1 if not provided
  };

  const { data, error } = await supabase
    .from("candidates")
    .insert([candidateWithDefaults])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCandidates() {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching candidates:", error);
      throw error;
    }

    if (!data) {
      console.warn("No data returned from candidates query");
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in getCandidates:", error);
    throw error;
  }
}

export async function updateCandidate(id: string, updates: Partial<Candidate>) {
  const { data, error } = await supabase
    .from("candidates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCandidate(id: string) {
  const { error } = await supabase.from("candidates").delete().eq("id", id);

  if (error) throw error;
  return true;
}
