import { supabase } from "../supabase";
import { Job } from "@/types/database";

export async function getJobs() {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }

    return data as Job[];
  } catch (error) {
    console.error("Error in getJobs:", error);
    throw error;
  }
}

export async function getJobById(id: string) {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching job by ID:", error);
      throw error;
    }

    return data as Job;
  } catch (error) {
    console.error("Error in getJobById:", error);
    throw error;
  }
}

export async function createJob(
  job: Omit<
    Job,
    "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
  >,
) {
  try {
    // Convert skills array to string array or empty array if undefined
    const jobData = {
      ...job,
      skills: job.skills || [],
    };

    console.log("Creating job with data:", jobData);

    const { data, error } = await supabase
      .from("jobs")
      .insert([jobData])
      .select()
      .single();

    if (error) {
      console.error("Error creating job:", error);
      throw error;
    }

    console.log("Job created successfully:", data);
    return data as Job;
  } catch (error) {
    console.error("Error in createJob:", error);
    throw error;
  }
}

export async function updateJob(id: string, updates: Partial<Job>) {
  try {
    console.log("Updating job with ID:", id, "Updates:", updates);

    // Ensure skills is an array if provided
    const jobUpdates = {
      ...updates,
      skills: updates.skills || [],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("jobs")
      .update(jobUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error);
      throw error;
    }

    console.log("Job updated successfully:", data);
    return data as Job;
  } catch (error) {
    console.error("Error in updateJob:", error);
    throw error;
  }
}

export async function deleteJob(id: string) {
  try {
    console.log("Deleting job with ID:", id);

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting job:", error);
      throw error;
    }

    console.log("Job deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteJob:", error);
    throw error;
  }
}
