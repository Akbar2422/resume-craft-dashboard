
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress"; 
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ResumeUploader() {
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
      
      // Find the most recent PDF file
      const pdfFiles = data?.filter(file => file.name.toLowerCase().endsWith('.pdf'));
      
      if (pdfFiles && pdfFiles.length > 0) {
        // Sort by created_at in descending order
        const latestFile = pdfFiles.sort((a, b) => 
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
    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
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

  const uploadResume = async () => {
    if (!file || !user) return;
    
    try {
      setUploading(true);
      setProgress(0);
      
      // Create folder for user if it doesn't exist
      const userId = user.id;
      const filePath = `${userId}/${file.name}`;
      
      // Upload the file
      const { error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      // Since onUploadProgress isn't available, we'll simulate progress
      setProgress(100);
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
      
      // Update the existing resume state
      setExistingResume({
        name: file.name,
        url: urlData.publicUrl,
        uploaded_at: new Date().toISOString(),
      });
      
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been saved",
      });
      
      // Clear the file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Resume Upload</h3>
            <p className="text-sm text-muted-foreground">
              Upload your resume in PDF format (max 5MB)
            </p>
          </div>

          {existingResume && (
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Current Resume</h4>
              <p className="text-sm text-muted-foreground mb-1">{existingResume.name}</p>
              <p className="text-xs text-muted-foreground mb-3">
                Uploaded {formatDistanceToNow(new Date(existingResume.uploaded_at))} ago
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="resume">{existingResume ? "Replace Resume" : "Upload Resume"}</Label>
              <Input
                id="resume"
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress}% uploaded
                </p>
              </div>
            )}
            
            <Button
              onClick={uploadResume}
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
