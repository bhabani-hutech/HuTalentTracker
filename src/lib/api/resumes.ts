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
  // Start a transaction by creating the candidate first
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .insert([
      {
        name: resume.name,
        email: resume.email || "",
        position: resume.position,
        source: resume.source || "Manual Upload",
        phone: resume.phone,
        notice_period: resume.notice_period,
        match_score: resume.match_score,
        file_url: resume.file_url || "",
      },
    ])
    .select()
    .single();

  if (candidateError) throw candidateError;

  // Then create the resume with the candidate_id
  const resumeWithDefaults = {
    ...resume,
    source: resume.source || "Manual Upload",
    file_url: resume.file_url || "",
    email: resume.email || "",
    candidate_id: candidate.id, // Link to the created candidate
  };

  const { data: resumeData, error: resumeError } = await supabase
    .from("resumes")
    .insert([resumeWithDefaults])
    .select()
    .single();

  if (resumeError) {
    // If resume creation fails, delete the candidate to maintain consistency
    await supabase.from("candidates").delete().eq("id", candidate.id);
    throw resumeError;
  }

  return {
    ...resumeData,
    candidate,
  };
}

export async function getResumes() {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateResume(id: string, updates: Partial<Resume>) {
  // First get the resume to get the candidate_id
  const { data: existingResume, error: fetchError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Update the resume
  const { data: resumeData, error: resumeError } = await supabase
    .from("resumes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (resumeError) throw resumeError;

  // If we have candidate-related fields, update the candidate too
  if (
    existingResume?.candidate_id &&
    (updates.name ||
      updates.email ||
      updates.position ||
      updates.source ||
      updates.phone ||
      updates.notice_period ||
      updates.match_score)
  ) {
    const candidateUpdates = {
      name: updates.name,
      email: updates.email,
      position: updates.position,
      source: updates.source,
      phone: updates.phone,
      notice_period: updates.notice_period,
      match_score: updates.match_score,
    };

    // Remove undefined values
    Object.keys(candidateUpdates).forEach(
      (key) =>
        candidateUpdates[key] === undefined && delete candidateUpdates[key],
    );

    const { data: candidateData, error: candidateError } = await supabase
      .from("candidates")
      .update(candidateUpdates)
      .eq("id", existingResume.candidate_id)
      .select()
      .single();

    if (candidateError) throw candidateError;

    return {
      ...resumeData,
      candidate: candidateData,
    };
  }

  return resumeData;
}

export async function deleteResume(id: string) {
  // First get the resume to get the candidate_id
  const { data: resume, error: fetchError } = await supabase
    .from("resumes")
    .select("candidate_id")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Delete the resume
  const { error: resumeError } = await supabase
    .from("resumes")
    .delete()
    .eq("id", id);

  if (resumeError) throw resumeError;

  // If there was a linked candidate, delete it too
  if (resume?.candidate_id) {
    const { error: candidateError } = await supabase
      .from("candidates")
      .delete()
      .eq("id", resume.candidate_id);

    if (candidateError) throw candidateError;
  }

  return true;
}
