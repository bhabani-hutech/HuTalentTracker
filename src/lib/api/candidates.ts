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
  position?: string;
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
  console.log("Creating candidate with data:", candidate);
  // Convert skills from string to array if needed for match score calculation
  const skillsArray =
    typeof candidate.skills === "string"
      ? candidate.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(candidate.skills)
        ? candidate.skills
        : [];
  const candidateWithDefaults = {
    ...candidate,
    source: candidate.source || "Manual Upload",
    email: candidate.email || "",
    stage_id: candidate.stage_id || 1, // Default to stage 1 (Screening) if not provided
    type: candidate.type || "Full Time",
    experience: candidate.experience || "0-1 years",
    skills: candidate.skills || "",
    location: candidate.location || "Remote",
    position:
      candidate.position ||
      (candidate.job_id ? undefined : "Unspecified Position"),
    match_score:
      candidate.match_score !== undefined ? candidate.match_score : 0, // Use provided match_score if available
  };

  // If job_id is provided but position isn't, try to get the job title
  if (candidate.job_id && !candidate.position) {
    try {
      const { data: job } = await supabase
        .from("jobs")
        .select("title, skills")
        .eq("id", candidate.job_id)
        .single();

      if (job) {
        candidateWithDefaults.position = job.title;

        // If match_score isn't provided and we have job skills, calculate a basic match score
        if (
          candidate.match_score === undefined &&
          job.skills &&
          skillsArray.length > 0
        ) {
          const jobSkills = Array.isArray(job.skills)
            ? job.skills.map((s) =>
                typeof s === "string" ? s.toLowerCase() : "",
              )
            : [];

          if (jobSkills.length > 0) {
            let matchCount = 0;
            for (const skill of skillsArray) {
              const skillLower = skill.toLowerCase();
              if (
                jobSkills.some(
                  (js) =>
                    js === skillLower ||
                    js.includes(skillLower) ||
                    skillLower.includes(js),
                )
              ) {
                matchCount++;
              }
            }

            // Calculate percentage match
            const matchScore = Math.round(
              (matchCount / jobSkills.length) * 100,
            );
            candidateWithDefaults.match_score = Math.min(matchScore, 100); // Cap at 100%
          }
        }
      }
    } catch (err) {
      console.error("Error fetching job title:", err);
    }
  }

  // Set the stage_id to the screening stage (1) by default for new candidates
  if (!candidateWithDefaults.stage_id) {
    candidateWithDefaults.stage_id = 1; // Default to screening stage
  }

  console.log("Final candidate data to insert:", candidateWithDefaults);

  const { data, error } = await supabase
    .from("candidates")
    .insert([candidateWithDefaults])
    .select()
    .single();

  if (error) {
    console.error("Error creating candidate:", error);
    throw error;
  }

  console.log("Created candidate:", data);
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
