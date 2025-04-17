
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ResumeInfo from "./resume/ResumeInfo";
import ResumeControls from "./resume/ResumeControls";

interface ResumeFile {
  name: string;
  url: string;
  uploaded_at: string;
  size?: number;
}

export default function ResumeViewer() {
  const [resume, setResume] = useState<ResumeFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchResume();
    }
  }, [user]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .list(user.id);
        
      if (error) {
        throw error;
      }
      
      // Find PDF or DOCX files
      const validFiles = data?.filter(file => {
        const ext = file.name.toLowerCase().split('.').pop();
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
          
        setResume({
          name: latestFile.name,
          url: urlData.publicUrl,
          uploaded_at: latestFile.created_at || new Date().toISOString(),
          size: latestFile.metadata?.size,
        });
      } else {
        setResume(null);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast({
        title: "Error loading resume",
        description: "Could not load your resume",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    if (resume?.url) {
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = resume.url;
      a.download = resume.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const deleteResume = async () => {
    try {
      if (!user?.id || !resume) return;
      
      setDeleting(true);
      const filePath = `${user.id}/${resume.name}`;
      
      const { error } = await supabase.storage
        .from('resumes')
        .remove([filePath]);
        
      if (error) {
        throw error;
      }
      
      setResume(null);
      toast({
        title: "Resume deleted",
        description: "Your resume has been successfully deleted",
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete your resume",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!resume) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No Resume Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a resume to view it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Your Resume</h3>
            <p className="text-sm text-muted-foreground">
              View and manage your uploaded resume
            </p>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <ResumeInfo resume={resume} formatFileSize={formatFileSize} />
            
            <ResumeControls 
              onDownload={downloadResume}
              onDelete={deleteResume}
              deleting={deleting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
