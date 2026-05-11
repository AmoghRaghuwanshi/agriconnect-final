/**
 * Storage client — stubbed.
 * Previously used Supabase Storage. When file uploads are needed,
 * wire this to Neon + a blob storage service (Netlify Blobs, Cloudinary, etc.)
 */

export async function uploadToStorage(
  _bucket: string,
  _path: string,
  _file: File | Buffer | Blob,
  _contentType: string
): Promise<string> {
  console.warn('[storage] uploadToStorage not implemented — no storage backend configured');
  return '/placeholder-image.png';
}

export async function getSignedUrl(
  _bucket: string,
  _path: string,
  _expiresInSeconds = 3600
): Promise<string> {
  console.warn('[storage] getSignedUrl not implemented');
  return '/placeholder-image.png';
}

export async function deleteFromStorage(
  _bucket: string,
  _path: string
): Promise<void> {
  console.warn('[storage] deleteFromStorage not implemented');
}
