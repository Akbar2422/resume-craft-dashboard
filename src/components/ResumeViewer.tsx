
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, Download, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ResumeInfo from "./resume/ResumeInfo";
import ResumeControls from "./resume/ResumeControls";

interface ResumeVersion {
  id: string;
  original_filename: string;
  tweaked_text: string;
  created_at: string;
  is_default: boolean;
  job_description?: string | null;
}

export default function ResumeViewer() {
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchResumeVersions();
    }
  }, [user]);

  const fetchResumeVersions = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to ensure is_default exists on all items
      const transformedData = data?.map(version => ({
        ...version,
        is_default: version.is_default === true, // Convert to boolean, handles null/undefined
      })) || [];
      
      setResumeVersions(transformedData);
    } catch (error) {
      console.error('Error fetching resume versions:', error);
      toast({
        title: "Error loading resume versions",
        description: "Could not load your resume versions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (versionId: string) => {
    try {
      // Reset all other defaults
      await supabase
        .from('resume_versions')
        .update({ is_default: false })
        .eq('user_id', user?.id || '');

      // Set new default
      await supabase
        .from('resume_versions')
        .update({ is_default: true })
        .eq('id', versionId);

      // Refresh versions
      await fetchResumeVersions();

      toast({
        title: "Default Resume Updated",
        description: "This resume version is now set as default",
      });
    } catch (error) {
      console.error('Error setting default resume:', error);
      toast({
        title: "Error",
        description: "Could not set default resume",
        variant: "destructive",
      });
    }
  };

  const handleDownloadVersion = (version: ResumeVersion) => {
    const blob = new Blob([version.tweaked_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${version.original_filename}-v${version.created_at}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteVersion = async (versionId: string) => {
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('resume_versions')
        .delete()
        .eq('id', versionId);
      
      if (error) throw error;
      
      await fetchResumeVersions();
      
      toast({
        title: "Resume Version Deleted",
        description: "The resume version has been successfully removed",
      });
    } catch (error) {
      console.error('Error deleting resume version:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete resume version",
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

  if (!resumeVersions.length) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No Resume Versions Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a resume to start tracking versions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Resume Versions</h3>
          {resumeVersions.map((version) => (
            <div 
              key={version.id} 
              className={`bg-muted p-4 rounded-md relative ${version.is_default ? 'border-2 border-primary' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{version.original_filename}</h4>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(version.created_at).toLocaleString()}
                  </p>
                  {version.job_description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Job Description: {version.job_description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!version.is_default && (
                    <button 
                      onClick={() => handleSetDefault(version.id)}
                      className="text-yellow-500 hover:text-yellow-600"
                      title="Set as Default"
                    >
                      <Star className="h-5 w-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDownloadVersion(version)}
                    className="text-primary hover:text-primary-600"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteVersion(version.id)}
                    disabled={deleting}
                    className="text-destructive hover:text-destructive-600"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
