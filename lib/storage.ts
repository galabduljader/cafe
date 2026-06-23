import { supabase } from "./supabaseClient";

export const ATTACH_BUCKET = "todo-attach";

export interface UploadedAttachment {
  url: string;
  path: string;
  name: string;
  type: string;
}

/** Sanitize a filename into a safe object key. */
function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";
  return ext ? `${base}.${ext}` : base;
}

/**
 * Upload a file to the public `todo-attach` bucket and return its public URL
 * and storage path. We can't use Date.now()/Math.random() reliably here, so we
 * build a unique-ish key from the timestamp + a short token.
 */
export async function uploadAttachment(
  file: File
): Promise<UploadedAttachment> {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const token = Math.random().toString(36).slice(2, 8);
  const path = `${stamp}-${token}-${safeName(file.name)}`;

  const { error } = await supabase.storage
    .from(ATTACH_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(ATTACH_BUCKET).getPublicUrl(path);
  return {
    url: data.publicUrl,
    path,
    name: file.name,
    type: file.type || "application/octet-stream",
  };
}

/** Best-effort removal of an attachment from storage. */
export async function removeAttachment(path: string | null): Promise<void> {
  if (!path) return;
  await supabase.storage.from(ATTACH_BUCKET).remove([path]);
}

export function isImage(type: string | null): boolean {
  return !!type && type.startsWith("image/");
}
