import { supabase } from "../supabase";

export async function getDocuments() {
  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      candidates (*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDocumentById(id: string) {
  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      candidates (*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDocument(documentData: any) {
  const { data, error } = await supabase
    .from("documents")
    .insert([documentData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, updates: any) {
  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) throw error;
  return true;
}

export async function uploadDocument(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(path, file);

  if (error) throw error;
  return data;
}

export async function getDocumentUrl(path: string) {
  const { data } = await supabase.storage.from("documents").getPublicUrl(path);
  return data.publicUrl;
}
