import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary with credentials
 * This should be called before any other Cloudinary operations
 */
export function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Upload an image to Cloudinary
 * @param file The file buffer to upload
 * @param folder The folder to store the file in (e.g., 'advertisements')
 * @returns The URL of the uploaded image
 */
export async function uploadImage(
  fileBuffer: Buffer,
  folder: string = 'advertisements'
): Promise<string> {
  try {
    // Configure Cloudinary
    configureCloudinary();

    // Convert buffer to base64 for Cloudinary upload
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64Data}`;

    // Upload to Cloudinary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder,
          resource_type: 'image',
          // Optional transformations can be added here
          transformation: [
            { width: 1000, crop: 'limit' }, // Resize to max width of 1000px
            { quality: 'auto:good' } // Optimize quality
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    // Return the secure URL of the uploaded image
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}

/**
 * Generate a transformed URL for an existing Cloudinary image
 * @param publicId The public ID of the image
 * @param options Transformation options
 * @returns The transformed image URL
 */
export function getTransformedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): string {
  // Configure Cloudinary
  configureCloudinary();

  // Set default options
  const { width, height, crop = 'fill', quality = 'auto:good' } = options;

  // Generate the URL with transformations
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    secure: true
  });
}