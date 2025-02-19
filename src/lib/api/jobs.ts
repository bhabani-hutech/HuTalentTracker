import { supabase } from "../supabase";
import { Job } from "@/types/database";

export async function getJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Job[];
}

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Job;
}

export async function createJob(
  job: Omit<
    Job,
    "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
  >,
) {
  // Convert skills array to string array or empty array if undefined
  const jobData = {
    ...job,
    skills: job.skills || [],
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert([jobData])
    .select()
    .single();

  if (error) throw error;
  return data as Job;
}

export async function updateJob(id: string, updates: Partial<Job>) {
  // Ensure skills is an array if provided
  const jobUpdates = {
    ...updates,
    skills: updates.skills || [],
  };

  const { data, error } = await supabase
    .from("jobs")
    .update(jobUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Job;
}

export async function deleteJob(id: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) throw error;
  return true;
}
