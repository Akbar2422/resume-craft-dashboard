
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ResumeUploader from "@/components/ResumeUploader";
import ResumeViewer from "@/components/ResumeViewer";

import Header from "@/components/dashboard/Header";
import Leaderboard from "@/components/dashboard/Leaderboard";
import HRResponses from "@/components/dashboard/HRResponses";
import JobReminders from "@/components/dashboard/JobReminders";

// The JobTracker component exists but was being shown as a placeholder
import JobTracker from "@/components/JobTracker"; 

// The CoverLetterGenerator component exists but was being shown as a placeholder
import CoverLetterGenerator from "@/components/CoverLetterGenerator";

interface ResumeFile {
  name: string;
  url: string;
  content: string;
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [uploadedResume, setUploadedResume] = useState<ResumeFile | null>(null);
  const [legendPoints, setLegendPoints] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<Array<{user_id: string, total_points: number}>>([]);
  const [hasResume, setHasResume] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchLegendPoints();
      fetchLeaderboard();
      checkForResume();
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

  // Check if user has a resume uploaded
  const checkForResume = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .list(user.id);
        
      if (error) {
        console.error('Error checking for resume:', error);
        return;
      }
      
      // Find valid resume files
      const validFiles = data?.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext === 'pdf' || ext === 'docx';
      });
      
      setHasResume(validFiles && validFiles.length > 0);
    } catch (error) {
      console.error('Error checking for resume:', error);
    }
  };

  const handleResumeUpload = (fileInfo: ResumeFile) => {
    setUploadedResume(fileInfo);
    setHasResume(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header legendPoints={legendPoints} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upload">Upload Resume</TabsTrigger>
            <TabsTrigger value="manage">Manage Resume</TabsTrigger>
            <TabsTrigger value="tracker">Job Tracker</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="hr-responses">HR Responses</TabsTrigger>
            <TabsTrigger value="job-reminders">Job Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <ResumeUploader onUploadSuccess={handleResumeUpload} />
          </TabsContent>
          
          <TabsContent value="manage">
            <ResumeViewer />
          </TabsContent>
          
          <TabsContent value="tracker">
            {/* Use the actual JobTracker component */}
            <JobTracker />
          </TabsContent>
          
          <TabsContent value="cover-letter">
            {!hasResume ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-lg font-medium mb-2">Resume Required</h3>
                <p className="text-gray-500 mb-4">
                  Please upload your resume first to generate a cover letter.
                </p>
                <button 
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                  onClick={() => document.querySelector('[data-value="upload"]')?.click()}
                >
                  Upload Resume
                </button>
              </div>
            ) : (
              <CoverLetterGenerator />
            )}
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Leaderboard leaderboard={leaderboard} />
          </TabsContent>

          <TabsContent value="hr-responses">
            <HRResponses />
          </TabsContent>

          <TabsContent value="job-reminders">
            <JobReminders />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
