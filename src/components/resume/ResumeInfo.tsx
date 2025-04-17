
import React from 'react';
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ResumeFile {
  name: string;
  url: string;
  uploaded_at: string;
  size?: number;
}

interface ResumeInfoProps {
  resume: ResumeFile;
  formatFileSize: (bytes?: number) => string;
}

const ResumeInfo: React.FC<ResumeInfoProps> = ({ resume, formatFileSize }) => {
  return (
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
  );
};

export default ResumeInfo;
