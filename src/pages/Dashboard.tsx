import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ResumeUploader from "@/components/ResumeUploader";
import ResumeViewer from "@/components/ResumeViewer";
import ResumeTweaker from "@/components/ResumeTweaker";
import JobTracker from "@/components/JobTracker";
import CoverLetterGenerator from "@/components/CoverLetterGenerator";
import { LogOut, User, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface ResumeFile {
  name: string;
  url: string;
  content: string;
}

export default function Dashboard() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [uploadedResume, setUploadedResume] = useState<ResumeFile | null>(null);
  const [legendPoints, setLegendPoints] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<Array<{user_id: string, total_points: number}>>([]);
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchLegendPoints();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchLegendPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('legend_points')
        .select('total_points')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching legend points:', error);
        return;
      }

      setLegendPoints(data?.total_points || 0);
    } catch (error) {
      console.error('Error in fetchLegendPoints:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('legend_points')
        .select('user_id, total_points')
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error in fetchLeaderboard:', error);
    }
  };

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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Resume Craft</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                <Award className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">
                  Legend Score: {legendPoints} pts
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upload">Upload Resume</TabsTrigger>
            <TabsTrigger value="manage">Manage Resume</TabsTrigger>
            <TabsTrigger value="improve">Improve Resume</TabsTrigger>
            <TabsTrigger value="tracker">Job Tracker</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
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
          
          <TabsContent value="cover-letter">
            <CoverLetterGenerator />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Legend Leaderboard</h2>
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.user_id} className="flex items-center space-x-4 py-2 border-b">
                      <span className="text-sm font-medium w-8">{index + 1}.</span>
                      <span className="flex-1 text-sm">
                        {entry.user_id === user?.id ? 'You' : 'User'}
                      </span>
                      <span className="text-sm font-semibold">
                        {entry.total_points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
