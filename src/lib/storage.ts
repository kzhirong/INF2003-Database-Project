import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'event-posters';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload an event poster image to Supabase Storage
 * @param file - The image file to upload
 * @param eventId - Optional event ID to use in filename
 * @returns Upload result with public URL or error
 */
export async function uploadEventPoster(
  file: File,
  eventId?: string
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      url: '',
      path: '',
      error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.',
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      url: '',
      path: '',
      error: 'File too large. Maximum size is 5MB.',
    };
  }

  const supabase = createClient();

  // Generate file path
  const fileExt = file.name.split('.').pop();
  const fileName = eventId
    ? `${eventId}.${fileExt}`
    : `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true, // Replace if file already exists
    });

  if (error) {
    console.error('Upload error:', error);
    return {
      url: '',
      path: '',
      error: error.message,
    };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  return {
    url: publicUrl,
    path: fileName,
  };
}

/**
 * Delete an event poster from storage
 * @param path - The file path in storage (e.g., "event-123.jpg")
 * @returns True if deleted successfully
 */
export async function deleteEventPoster(path: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    console.error('Delete error:', error);
    return false;
  }

  return true;
}

/**
 * Get the public URL for an event poster
 * @param path - The file path in storage
 * @returns Public URL
 */
export function getEventPosterUrl(path: string): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return publicUrl;
}
