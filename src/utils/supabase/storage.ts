import { createClient as createServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param path The path to store the file at (e.g., 'advertisements')
 * @param fileName Optional custom file name
 * @returns The URL of the uploaded file
 */
export async function uploadImage(
  file: File,
  path: string = 'find-bucket',
  fileName?: string
): Promise<string> {
  try {
    // Get server-side Supabase client
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);

    // Generate a unique file name if not provided
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(path)
      .upload(uniqueFileName, file);

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(path)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * This function is kept for backward compatibility but now just returns true
 * as we're using an existing bucket instead of creating a new one
 * @param bucketName The name of the bucket (ignored, using existing bucket)
 * @param isPublic Whether the bucket should be public (ignored, using existing bucket)
 * @returns Always returns true
 */
export async function createBucketIfNotExists(
  bucketName: string = 'find-bucket',
  isPublic: boolean = true
): Promise<boolean> {
  // Simply return true as we're using an existing bucket
  return true;
}

/**
 * Create a Supabase client using the S3 credentials from the .env file
 * @returns A Supabase client configured with S3 credentials
 */
export function createS3Client() {
  // Use the Supabase URL from the environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Create a client with the S3 credentials
  return createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
      // The client will use the existing bucket with the provided credentials
      // No need to create a new bucket
    }
  );
}
