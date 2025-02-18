import { supabase } from "../supabase";

export interface ParsedData {
  skills?: string[];
  experience?: string[];
  education?: string[];
  certifications?: string[];
  languages?: string[];
  summary?: string;
}

export interface Resume {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  source: string;
  match_score?: number;
  notice_period?: string;
  file_url: string;
  parsed_data?: ParsedData;
  created_at?: string;
  updated_at?: string;
}

export async function uploadResume(file: File): Promise<string> {
  try {
    // Create a clean filename without special characters
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const timestamp = new Date().getTime();
    const filePath = `uploads/${timestamp}_${cleanFileName}`;

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type, // Set the correct content type
        upsert: true, // Allow overwriting in case of duplicate names
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get the public URL
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

export async function createResume(
  resume: Omit<Resume, "id" | "created_at" | "updated_at">,
) {
  // Ensure source is never null
  // Ensure required fields are present
  const resumeWithDefaults = {
    ...resume,
    source: resume.source || "Manual Upload",
    file_url: resume.file_url || "", // This should be provided, but add fallback
    email: resume.email || "", // Ensure email has a default value
  };
  const { data, error } = await supabase
    .from("resumes")
    .insert([resumeWithDefaults])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getResumes() {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteResume(id: string) {
  const { error } = await supabase.from("resumes").delete().eq("id", id);

  if (error) throw error;
  return true;
}
