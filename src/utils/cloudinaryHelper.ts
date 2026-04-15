import { toast } from 'react-toastify';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Validates an image file based on type and size.
 * @param {File} file - The file to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const validateImageFile = (file) => {
  if (!file) return false;

  // Validate file type
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!acceptedTypes.includes(file.type)) {
    toast.error("Invalid file type. Please select a JPG, PNG, WEBP, or GIF.");
    return false;
  }

  // Validate file size (max 5MB)
  const maxSizeInBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    toast.error("File size exceeds 5MB. Please choose a smaller image.");
    return false;
  }

  return true;
};

/**
 * Uploads an image to Cloudinary.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string|null>} - The secure URL of the uploaded image, or null on failure.
 */
export const uploadImageToCloudinary = async (file) => {
  if(!validateImageFile(file)){
    return null;
  }

  if(!CLOUD_NAME || !UPLOAD_PRESET){
    toast.error("Cloudinary environment variables are not configured.");
    console.error("VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET must be set in .env");
    return null;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try{
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if(!response.ok){
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.secure_url;
  } 
  catch(error){
    console.error("Error uploading to Cloudinary:", error);
    toast.error("Image upload failed. Please try again.");
    return null;
  }
};
