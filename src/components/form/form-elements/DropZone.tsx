"use client";

import React from "react";
import { useDropzone } from "react-dropzone";

interface DropzoneComponentProps {
  onFileSelected: (file: File) => void;
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({ onFileSelected }) => {
  const onDrop = (acceptedFiles: File[]) => {
    console.log("entro")
    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]); 
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, 
  });

  return (
    <div className="transition border w-full border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
      <form
        {...getRootProps()}
        className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
      ${
        isDragActive
          ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
          : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
      }`}
        id="demo-upload"
      >
        <input {...getInputProps()} />

        <div className="dz-message flex flex-col items-center">
          <div className="mb-[22px] flex justify-center">
            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
              📁
            </div>
          </div>

          <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
            {isDragActive ? "Soltar archivo aquí": "Arrastrar y soltar archivo aquí"}
          </h4>

          <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
          Arrastre y suelte un archivo CSV aquí o navegue
          </span>

          <span className="font-medium underline text-theme-sm text-brand-500">
          Explorar archivo
          </span>
        </div>
      </form>
    </div>
  );
};

export default DropzoneComponent;
