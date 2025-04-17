
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Create placeholder components for the features that don't have their own implementations yet
export function PlaceholderResumeViewer() {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">Resume viewer component placeholder</p>
      </CardContent>
    </Card>
  );
}

export function PlaceholderResumeTweaker({ resumeContent, fileName }: { resumeContent: string, fileName: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">Resume tweaker component placeholder</p>
        <p>Filename: {fileName}</p>
      </CardContent>
    </Card>
  );
}

export function PlaceholderJobTracker() {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">Job tracker component placeholder</p>
      </CardContent>
    </Card>
  );
}

export function PlaceholderCoverLetterGenerator() {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">Cover letter generator component placeholder</p>
      </CardContent>
    </Card>
  );
}

// Mock ResumeUploader for testing purposes if the real component isn't available
export function PlaceholderResumeUploader({ onUploadSuccess }: { onUploadSuccess: (file: any) => void }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-muted-foreground">Resume uploader component placeholder</p>
          <Button 
            className="mt-4" 
            onClick={() => onUploadSuccess({name: "resume.pdf", url: "#", content: "Sample resume content"})}
          >
            Upload Resume
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
