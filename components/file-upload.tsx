"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form";
import axios from "axios";

interface FileUploadProps {
  endpoint: string;
  value: string;
  onChange: (value: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  endpoint, 
  value, 
  onChange 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.fileUrl) {
        onChange(response.data.fileUrl);
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormControl>
      <Input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      {isUploading && <p>Uploading...</p>}
      {value && <p>File uploaded successfully</p>}
    </FormControl>
  );
};