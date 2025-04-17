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

import {
  PlaceholderResumeTweaker as ResumeTweaker,
  PlaceholderJobTracker as JobTracker,
  PlaceholderCoverLetterGenerator as CoverLetterGenerator,
} from "@/components/dashboard/PlaceholderComponents";

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

  const handleResumeUpload = (fileInfo: ResumeFile) => {
    setUploadedResume(fileInfo);
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
            <TabsTrigger value="improve">Improve Resume</TabsTrigger>
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
