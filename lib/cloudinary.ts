/**
 * Utility for uploading images to Cloudinary.
 */

export const uploadToCloudinary = async (
  base64DataUri: string, 
  cloudName: string = 'kmkkthdk', 
  uploadPreset: string = 'foreman_uploads'
): Promise<string> => {
  try {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', base64DataUri);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

/**
 * Automatically applies a text watermark using Cloudinary's URL transformations.
 * This completely eliminates the need for manual canvas drawing!
 */
export const getWatermarkedCloudinaryUrl = (originalUrl: string, jobName: string): string => {
  if (!originalUrl || !originalUrl.includes('res.cloudinary.com')) return originalUrl;

  // We want to insert transformations after '/upload/'
  // Example text overlay: l_text:Arial_40_bold:JOB%20NAME,g_south,y_40,co_white,b_black_50
  
  const cleanJobName = encodeURIComponent(jobName.substring(0, 30));
  const transform = `l_text:Arial_40_bold:${cleanJobName},g_south,y_40,co_white,b_black_50`;

  return originalUrl.replace('/upload/', `/upload/${transform}/`);
};
