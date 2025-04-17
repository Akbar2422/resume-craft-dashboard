
import React from "react";
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress }) => {
  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-center text-muted-foreground">
        {progress}% uploaded
      </p>
    </div>
  );
};

export default UploadProgress;
