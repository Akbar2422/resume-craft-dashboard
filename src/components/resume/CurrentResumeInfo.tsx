
import React from "react";
import { formatDistanceToNow } from "date-fns";

interface CurrentResumeInfoProps {
  name: string;
  uploadedAt: string;
}

const CurrentResumeInfo: React.FC<CurrentResumeInfoProps> = ({ name, uploadedAt }) => {
  return (
    <div className="bg-muted p-4 rounded-md">
      <h4 className="font-medium mb-2">Current Resume</h4>
      <p className="text-sm text-muted-foreground mb-1">{name}</p>
      <p className="text-xs text-muted-foreground mb-3">
        Uploaded {formatDistanceToNow(new Date(uploadedAt))} ago
      </p>
    </div>
  );
};

export default CurrentResumeInfo;
