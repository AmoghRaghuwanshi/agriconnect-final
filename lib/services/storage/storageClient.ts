import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Upload a file to Supabase Storage (replaces AWS S3)
 * Returns the public URL of the uploaded file.
 *
 * Buckets: listing-images (public), farmer-avatars (public),
 *          farm-covers (public), dispute-evidence (private)
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: File | Buffer | Blob,
  contentType: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
      cacheControl: '31536000', // 1 year
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Generate a signed URL for private files (dispute evidence).
 * URL expires after `expiresInSeconds`.
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw new Error(`Failed to create signed URL: ${error.message}`);
  return data.signedUrl;
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}
