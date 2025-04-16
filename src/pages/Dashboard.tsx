
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ResumeUploader from "@/components/ResumeUploader";
import ResumeViewer from "@/components/ResumeViewer";
import ResumeTweaker from "@/components/ResumeTweaker";
import JobTracker from "@/components/JobTracker";
import { LogOut, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResumeFile {
  name: string;
  url: string;
  content: string;
}

export default function Dashboard() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [uploadedResume, setUploadedResume] = useState<ResumeFile | null>(null);
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  // Show loading or redirect if not authenticated
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleResumeUpload = (fileInfo: ResumeFile) => {
    setUploadedResume(fileInfo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Resume Craft</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Resume Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage and improve your resume in one place
            </p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="upload">Upload Resume</TabsTrigger>
              <TabsTrigger value="manage">Manage Resume</TabsTrigger>
              <TabsTrigger value="improve">Improve Resume</TabsTrigger>
              <TabsTrigger value="tracker">Job Tracker</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <ResumeUploader onUploadSuccess={handleResumeUpload} />
            </TabsContent>
            
            <TabsContent value="manage">
              <ResumeViewer />
            </TabsContent>
            
            <TabsContent value="improve">
              {uploadedResume ? (
                <ResumeTweaker 
                  resumeContent={uploadedResume.content}
                  fileName={uploadedResume.name}
                />
              ) : (
                <div className="text-center p-12">
                  <p className="text-muted-foreground">
                    Please upload a resume first to use the improvement feature
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tracker">
              <JobTracker />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
