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
  department?: string;
  candidate_source?: "Direct Apply" | "Hiring Partner";
  hiring_partner_id?: string; // UUID reference to organizations table
  Organization: {
    name: string
  }
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
  candidate: Omit<Candidate, "id" | "created_at" | "updated_at">
) {
  // Validate hiring_partner_id for source
  if (candidate.candidate_source === "Direct Apply") {
    candidate.hiring_partner_id = undefined;
  } else if (
    candidate.candidate_source === "Hiring Partner" &&
    !candidate.hiring_partner_id
  ) {
    console.warn(
      "Hiring Partner source selected but no hiring_partner_id provided"
    );
    throw new Error(
      "A hiring partner must be selected when 'Hiring Partner' is the source"
    );
  }

  // ✅ Check for duplicate email or phone under the same job_id
  const { data: existingCandidates, error: checkError } = await supabase
    .from("candidates")
    .select("id, email, phone")
    .or(
      `and(email.eq.${candidate.email},job_id.eq.${candidate.job_id}),and(phone.eq.${candidate.phone},job_id.eq.${candidate.job_id})`
    );

  if (checkError) {
    console.error("Error checking for existing candidate:", checkError);
    throw new Error("Could not verify uniqueness. Please try again.");
  }

  if (existingCandidates && existingCandidates.length > 0) {
    throw new Error(
      "A candidate with the same email or phone has already applied to this job."
    );
  }

  // Normalize skills
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
    stage_id: candidate.stage_id || 1,
    type: candidate.type || "Full Time",
    experience: candidate.experience || "0",
    skills: candidate.skills || "",
    location: candidate.location || "Remote",
    position:
      candidate.position ||
      (candidate.job_id ? undefined : "Unspecified Position"),
    match_score:
      candidate.match_score !== undefined ? candidate.match_score : 0,
    candidate_source: candidate.candidate_source || "Direct Apply",
    hiring_partner_id:
      candidate.candidate_source === "Hiring Partner"
        ? candidate.hiring_partner_id
        : undefined,
  };

  // Fetch job title and calculate match score if needed
  if (candidate.job_id && !candidate.position) {
    try {
      const { data: job } = await supabase
        .from("jobs")
        .select("title, skills")
        .eq("id", candidate.job_id)
        .single();

      if (job) {
        candidateWithDefaults.position = job.title;

        if (
          candidate.match_score === undefined &&
          job.skills &&
          skillsArray.length > 0
        ) {
          const jobSkills = Array.isArray(job.skills)
            ? job.skills.map((s) =>
                typeof s === "string" ? s.toLowerCase() : ""
              )
            : [];

          let matchCount = 0;
          for (const skill of skillsArray) {
            const skillLower = skill.toLowerCase();
            if (
              jobSkills.some(
                (js) =>
                  js === skillLower ||
                  js.includes(skillLower) ||
                  skillLower.includes(js)
              )
            ) {
              matchCount++;
            }
          }

          const matchScore = Math.round(
            (matchCount / jobSkills.length) * 100
          );
          candidateWithDefaults.match_score = Math.min(matchScore, 100);
        }
      }
    } catch (err) {
      console.error("Error fetching job title:", err);
    }
  }

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



// export async function getCandidates() {
//   try {
//     const { data, error } = await supabase
//       .from("candidates")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Supabase error fetching candidates:", error);
//       throw error;
//     }

//     if (!data) {
//       console.warn("No data returned from candidates query");
//       return [];
//     }

//     return data;
//   } catch (error) {
//     console.error("Error in getCandidates:", error);
//     throw error;
//   }
// }
export async function getCandidates() {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        *,
        Organization:hiring_partner_id (
          name
        )
      `)
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
  // Validate hiring_partner_id
  if (updates.candidate_source === "Direct Apply") {
    updates.hiring_partner_id = undefined;
  } else if (
    updates.candidate_source === "Hiring Partner" &&
    !updates.hiring_partner_id
  ) {
    console.warn(
      "Hiring Partner source selected but no hiring_partner_id provided",
    );
    throw new Error(
      "A hiring partner must be selected when 'Hiring Partner' is the source",
    );
  }

  if (
    updates.candidate_source === "Hiring Partner" &&
    updates.hiring_partner_id === undefined
  ) {
    const { data: currentCandidate, error: fetchError } = await supabase
      .from("candidates")
      .select("hiring_partner_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching current candidate data:", fetchError);
      throw fetchError;
    }

    if (!currentCandidate.hiring_partner_id) {
      throw new Error(
        "A hiring partner must be selected when 'Hiring Partner' is the source",
      );
    }
  }

  // 🔒 Check for uniqueness of email or mobile if they are being updated
  // if (updates.email || updates.phone) {
  //   const { data: conflictCandidate, error: conflictError } = await supabase
  //     .from("candidates")
  //     .select("id")
  //     .or(
  //       [
  //         updates.email ? `email.eq.${updates.email}` : null,
  //         updates.phone ? `phone.eq.${updates.phone}` : null,
  //       ]
  //         .filter(Boolean)
  //         .join(","),
  //     )
  //     .neq("id", id) // Ensure we’re not comparing with the same candidate
  //     .maybeSingle();

  //   if (conflictError) {
  //     console.error("Error checking for duplicates:", conflictError);
  //     throw new Error("Could not verify uniqueness. Please try again.");
  //   }

  //   if (conflictCandidate) {
  //     throw new Error(
  //       "This email address or phone  is already linked to another candidate.",
  //     );
  //   }
  // }

  if (updates.email && updates.phone && updates.job_id) {
    const { data: conflictCandidate, error: conflictError } = await supabase
      .from("candidates")
      .select("id")
      .eq("email", updates.email)
      .eq("phone", updates.phone)
      .eq("job_id", updates.job_id)
      .neq("id", id)
      .maybeSingle();
  
    if (conflictError) {
      console.error("Error checking for existing candidate:", conflictError);
      throw new Error("Could not verify uniqueness. Please try again.");
    }
  
    if (conflictCandidate) {
      throw new Error(
        "This candidate (email and phone) has already applied to this job.",
      );
    }
  }
  

  // Set source defaults
  if (updates.candidate_source === "Hiring Partner" && !updates.source) {
    updates.source = "Hiring Partner Referral";
  } else if (updates.candidate_source === "Direct Apply" && !updates.source) {
    updates.source = "Direct Application";
  }

  const { data, error } = await supabase
    .from("candidates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating candidate:", error);
    throw error;
  }

  return data;
}
export async function deleteCandidate(id: string) {
  const { error } = await supabase.from("candidates").delete().eq("id", id);

  if (error) throw error;
  return true;
}
