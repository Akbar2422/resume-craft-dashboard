
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadResume } from "@/utils/storage";
import FileInput from "./resume/FileInput";
import UploadProgress from "./resume/UploadProgress";
import CurrentResumeInfo from "./resume/CurrentResumeInfo";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ResumeUploaderProps {
  onUploadSuccess?: (fileInfo: { name: string; url: string; content: string }) => void;
}

export default function ResumeUploader({ onUploadSuccess }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [existingResume, setExistingResume] = useState<{
    name: string;
    url: string;
    uploaded_at: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExistingResume();
    }
  }, [user]);

  // Fetch any existing resume for the current user
  const fetchExistingResume = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .list(user.id);
        
      if (error) {
        console.error('Error fetching resume:', error);
        return;
      }
      
      // Find the most recent PDF or DOCX file
      const validFiles = data?.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext === 'pdf' || ext === 'docx';
      });
      
      if (validFiles && validFiles.length > 0) {
        // Sort by created_at in descending order
        const latestFile = validFiles.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        )[0];
        
        const { data: urlData } = await supabase.storage
          .from('resumes')
          .getPublicUrl(`${user.id}/${latestFile.name}`);
          
        setExistingResume({
          name: latestFile.name,
          url: urlData.publicUrl,
          uploaded_at: latestFile.created_at || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error in fetchExistingResume:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    // Check file type
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['pdf', 'docx'].includes(fileExt)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  // Trigger file input click when Upload Resume button is clicked
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    try {
      setUploading(true);
      setProgress(10); // Start progress
      
      // Use our uploadResume utility function
      const { error, data } = await uploadResume(file, user.id);
      
      // Simulate progress for better UX
      setProgress(70);
      
      if (error) {
        toast({
          title: "Upload failed",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setProgress(100);
        
        // Update the existing resume state
        setExistingResume({
          name: data.name,
          url: data.url,
          uploaded_at: data.uploaded_at,
        });
        
        toast({
          title: "Resume uploaded successfully",
          description: "Your resume has been saved",
        });

        // Extract text from the file (currently placeholder)
        import("@/utils/storage").then(module => {
          module.extractTextFromFile(file).then(content => {
            // Call the onUploadSuccess callback if provided
            if (onUploadSuccess) {
              onUploadSuccess({
                name: data.name,
                url: data.url,
                content
              });
            }
          });
        });
        
        // Clear the file input
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Resume Upload</h3>
            <p className="text-sm text-muted-foreground">
              Upload your resume in PDF or DOCX format (max 5MB)
            </p>
          </div>

          {existingResume && (
            <CurrentResumeInfo 
              name={existingResume.name} 
              uploadedAt={existingResume.uploaded_at} 
            />
          )}

          <div className="space-y-4">
            <FileInput
              ref={fileInputRef}
              onChange={handleFileChange}
              onTriggerClick={triggerFileInput}
              fileName={file?.name || null}
            />
            
            {uploading && <UploadProgress progress={progress} />}
            
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {existingResume ? "Replace Resume" : "Upload Resume"}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
