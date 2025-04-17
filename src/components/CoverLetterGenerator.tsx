
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { improveResumeForJob } from "@/services/geminiService";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Briefcase } from "lucide-react";

interface ResumeFile {
  name: string;
  url: string;
  content: string;
}

export default function CoverLetterGenerator() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResume, setSelectedResume] = useState<ResumeFile | null>(null);
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUploadedResumes();
  }, [user]);

  const fetchUploadedResumes = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase.storage
        .from('resumes')
        .list(user.id, { limit: 10 });

      if (error) {
        console.error('Error fetching resumes:', error);
        return;
      }

      const resumePromises = data.map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from('resumes')
          .getPublicUrl(`${user.id}/${file.name}`);

        // Placeholder text extraction - you'll want to replace this with actual PDF/DOCX parsing
        const content = "Professional experience in web development with expertise in React and TypeScript.";

        return {
          name: file.name,
          url: urlData.publicUrl,
          content
        };
      });

      const resumeFiles = await Promise.all(resumePromises);
      setResumes(resumeFiles);
    } catch (error) {
      console.error('Error in fetchUploadedResumes:', error);
    }
  };

  const handleGenerateCoverLetter = async () => {
    try {
      if (!selectedResume) {
        toast({
          title: "Missing Resume",
          description: "Please select a resume first.",
          variant: "destructive"
        });
        return;
      }

      if (!jobTitle || !companyName || !jobDescription) {
        toast({
          title: "Missing Details",
          description: "Please fill in all job details.",
          variant: "destructive"
        });
        return;
      }

      setIsGenerating(true);
      const coverLetterText = await improveResumeForJob(
        selectedResume.content, 
        `Job Title: ${jobTitle}\nCompany: ${companyName}\n\n${jobDescription}`, 
        selectedResume.name
      );

      // Save cover letter to Supabase
      const { data: coverLetterData, error } = await supabase
        .from('cover_letters')
        .insert({
          user_id: user?.id,
          job_title: jobTitle,
          company_name: companyName,
          job_description: jobDescription,
          resume_id: selectedResume.name,
          content: coverLetterText
        })
        .select();

      if (error) {
        throw error;
      }

      setGeneratedCoverLetter(coverLetterText);
      toast({
        title: "Cover Letter Generated",
        description: "Your personalized cover letter is ready!",
      });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        title: "Error",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(generatedCoverLetter);
    toast({
      title: "Copied!",
      description: "Cover letter copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover Letter Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Select Resume</label>
              <Select 
                onValueChange={(value) => {
                  const resume = resumes.find(r => r.name === value);
                  setSelectedResume(resume || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.name} value={resume.name}>
                      {resume.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Job Title</label>
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Company Name</label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g. Tech Innovations Inc."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Job Description</label>
              <Textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="min-h-[150px]"
              />
            </div>
            
            <Button 
              onClick={handleGenerateCoverLetter} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Briefcase className="mr-2 h-4 w-4" />
              )}
              Generate Cover Letter
            </Button>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Generated Cover Letter</label>
            <div className="border rounded-md p-3 min-h-[500px] bg-gray-50 text-sm whitespace-pre-wrap overflow-y-auto">
              {generatedCoverLetter ? (
                <>
                  {generatedCoverLetter}
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="secondary" 
                      onClick={handleCopyCoverLetter}
                    >
                      Copy
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Your generated cover letter will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

