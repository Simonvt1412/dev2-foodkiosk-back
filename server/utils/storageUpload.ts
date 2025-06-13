import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import { supabase } from '../config/supabaseClient';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Setup multer for temporary storage
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Alleen afbeeldingen zijn toegestaan (JPEG, PNG, GIF, WEBP, SVG)'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to upload file to Supabase Storage
export const uploadToStorage = async (file: Express.Multer.File): Promise<string | null> => {
  try {
    console.log('Starting upload to Supabase Storage...');
    
    // Check if Supabase client is initialized
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Missing Supabase credentials for storage operations');
      return null;
    }

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = `products/${fileName}`;

    console.log(`Uploading file: ${filePath}, size: ${file.size} bytes, type: ${file.mimetype}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('foodkiosk')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      return null;
    }

    console.log('File uploaded successfully:', data?.path);

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('foodkiosk')
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrlData?.publicUrl);

    return publicUrlData?.publicUrl || null;
  } catch (error) {
    console.error('Error in uploadToStorage:', error);
    return null;
  }
};

// Function to delete a file from Supabase Storage
export const deleteFromStorage = async (url: string): Promise<boolean> => {
  try {
    // Extract path from URL
    // Example URL: https://ltsmcfchbqltxdjmeetn.supabase.co/storage/v1/object/public/foodkiosk/products/filename.jpg
    const urlParts = url.split('/foodkiosk/');
    if (urlParts.length < 2) {
      console.error('Invalid Supabase Storage URL format');
      return false;
    }

    const filePath = urlParts[1]; // "products/filename.jpg"
    
    console.log('Deleting file from storage:', filePath);
    
    const { error } = await supabase.storage
      .from('foodkiosk')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting from Supabase Storage:', error);
      return false;
    }

    console.log('File deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteFromStorage:', error);
    return false;
  }
};

export default upload;