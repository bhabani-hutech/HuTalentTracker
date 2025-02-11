import { supabase } from "../supabase";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getUserRole() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;

  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) throw profileError;
  return profile?.role;
}
