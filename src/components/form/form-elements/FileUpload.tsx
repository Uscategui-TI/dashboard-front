"use client";

import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

interface FileUploadProps {
  onChange: (url: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onChange }) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // 1. Pedimos URL firmada al backend
    const res = await fetch("/api/s3-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    const { url } = await res.json();

    // 2. Subimos archivo directo a S3
    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    // 3. URL pública (sin el query string de firma)
    const publicUrl = url.split("?")[0];
    onChange(publicUrl);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-100"
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-gray-700">
        {isDragActive ? "Suelta el archivo aquí..." : "Arrastra y suelta un archivo, o haz clic"}
      </p>
    </div>
  );
};
