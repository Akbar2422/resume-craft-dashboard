
import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerClick: () => void;
  fileName: string | null;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ onChange, onTriggerClick, fileName }, ref) => {
    return (
      <div className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="resume">
            {fileName ? "Replace Resume" : "Upload Resume"}
          </Label>
          <Input
            id="resume"
            type="file"
            ref={ref}
            accept=".pdf,.docx"
            onChange={onChange}
            className="cursor-pointer"
            style={{ display: "none" }}
          />
          <Button onClick={onTriggerClick} variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Select File
          </Button>
          {fileName && (
            <p className="text-sm mt-2">
              Selected file: <span className="font-medium">{fileName}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export default FileInput;
