
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Sparkles, Loader2 } from "lucide-react";
import { improveResume } from "@/services/geminiService";

type JobRole = "Frontend Developer" | "Backend Developer" | "Data Analyst" | "Product Manager" | "UX Designer";

interface ResumeTweakerProps {
  resumeContent: string;
  fileName: string;
}

export default function ResumeTweaker({ resumeContent, fileName }: ResumeTweakerProps) {
  const [originalText, setOriginalText] = useState(resumeContent);
  const [improvedText, setImprovedText] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<JobRole>("Frontend Developer");
  const { toast } = useToast();

  useEffect(() => {
    if (resumeContent) {
      setOriginalText(resumeContent);
      // Auto-generate improved version on first load
      handleImprove();
    }
  }, [resumeContent]);

  const handleImprove = async () => {
    try {
      setIsImproving(true);
      const improved = await improveResume(originalText, selectedRole);
      setImprovedText(improved);
    } catch (error) {
      console.error("Error improving resume:", error);
      toast({
        title: "Error",
        description: "Failed to improve resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedText);
    toast({
      title: "Copied!",
      description: "Improved resume copied to clipboard",
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([improvedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    
    // Extract file name without extension
    const baseName = fileName.split('.')[0] || "resume";
    element.download = `${baseName}-improved.txt`;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Resume Tweaker</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground mr-2">Optimize for:</span>
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as JobRole)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
              <SelectItem value="Backend Developer">Backend Developer</SelectItem>
              <SelectItem value="Data Analyst">Data Analyst</SelectItem>
              <SelectItem value="Product Manager">Product Manager</SelectItem>
              <SelectItem value="UX Designer">UX Designer</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleImprove}
            disabled={isImproving || !originalText}
          >
            {isImproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="ml-2">Regenerate</span>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">Original Resume</h4>
            <div className="border rounded-md p-3 h-[400px] overflow-y-auto bg-gray-50 text-sm whitespace-pre-wrap">
              {originalText || "No resume content available"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm text-muted-foreground">Improved Resume</h4>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy}
                  disabled={!improvedText}
                >
                  <Copy className="h-4 w-4" />
                  <span className="ml-1">Copy</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDownload}
                  disabled={!improvedText}
                >
                  <Download className="h-4 w-4" />
                  <span className="ml-1">Download</span>
                </Button>
              </div>
            </div>
            <div className="border rounded-md p-3 h-[400px] overflow-y-auto bg-violet-50 text-sm whitespace-pre-wrap">
              {isImproving ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Improving your resume with AI...</p>
                </div>
              ) : improvedText ? (
                improvedText
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Sparkles className="h-8 w-8 mb-2" />
                  <p>AI-improved version will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
