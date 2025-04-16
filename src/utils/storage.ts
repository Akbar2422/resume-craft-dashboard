
import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a file to Supabase Storage
 * @param file The file to upload
 * @param userId The user ID to associate with the file
 * @returns Object containing upload status and file details
 */
export const uploadResume = async (file: File, userId: string) => {
  try {
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['pdf', 'docx'].includes(fileExt)) {
      return { 
        error: "File type not supported. Please upload a PDF or DOCX file.",
        data: null
      };
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return { 
        error: "File is too large. Maximum size is 5MB.",
        data: null
      };
    }

    // Upload file to user's folder
    const filePath = `${userId}/${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Overwrite if exists
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { 
        error: "Failed to upload file. Please try again.",
        data: null
      };
    }

    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return { 
      error: null, 
      data: {
        name: file.name,
        url: urlData.publicUrl,
        uploaded_at: new Date().toISOString(),
        size: file.size
      }
    };
  } catch (error) {
    console.error('Error in uploadResume:', error);
    return { 
      error: "An unexpected error occurred during upload.",
      data: null
    };
  }
};

/**
 * Extracts text content from a PDF file
 * @param file The PDF file
 * @returns The extracted text content
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  // For now, return a placeholder text since we don't have PDF parsing implemented yet
  return "Professional Frontend Developer with 5 years of experience in React, TypeScript, and modern web technologies. Implemented responsive designs and optimized applications for performance. Worked on cross-functional teams to deliver high-quality web applications. Proficient in UI/UX principles and component-based architecture.";
};
