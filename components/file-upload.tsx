"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  endpoint: string;
  value: string;
  name: string;
  onChange: (value: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  name,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.fileUrl) {
        onChange(response.data.fileId);
        toast.success(`Ficher ${name} envoyé avec succès`);
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Input
        className={cn(value && "hidden")}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      {isUploading && <p>Envoi en cours...</p>}
      {value && (
        <p className="text-emerald-700 p-4 border border-emerald-800 bg-emerald-100 rounded-lg md:w-fit">
          {name} File uploaded successfully
        </p>
      )}
    </>
  );
};
