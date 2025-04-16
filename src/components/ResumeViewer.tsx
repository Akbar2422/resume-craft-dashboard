
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
      
      // Find PDF files
      const pdfFiles = data?.filter(file => file.name.toLowerCase().endsWith('.pdf'));
      
      if (pdfFiles && pdfFiles.length > 0) {
        // Sort by created_at in descending order
        const latestFile = pdfFiles.sort((a, b) => 
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

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">{resume.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  Uploaded {formatDistanceToNow(new Date(resume.uploaded_at))} ago
                </p>
                {resume.size && (
                  <p className="text-xs text-muted-foreground">
                    Size: {formatFileSize(resume.size)}
                  </p>
                )}
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>{resume.name}</DialogTitle>
                    <DialogDescription>
                      Uploaded {formatDistanceToNow(new Date(resume.uploaded_at))} ago
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-2 flex-1 overflow-hidden">
                    <iframe 
                      src={resume.url} 
                      className="w-full h-[600px] border rounded"
                      title="Resume Preview"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={downloadResume} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your resume? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={deleteResume}
                      disabled={deleting}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
