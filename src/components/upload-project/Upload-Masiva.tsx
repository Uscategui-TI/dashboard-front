"use client"

import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import DropzoneComponent from "@/components/form/form-elements/DropZone";


export default function PersonFormPage() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axios.post(`/api/person-form/submit`, data);
      setSuccessMessage("Formulario enviado exitosamente ✅");
      reset();
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleUploadCsv = async () => {
    if (!file) return alert("Por favor selecciona un archivo CSV.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage(response.data || "Archivo subido exitosamente ✅");
      setFile(null);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setSuccessMessage("❌ Error al subir el archivo");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Cargue Masivo de Prospectos" />
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      <div className="min-h-screen rounded-2xl border flex flex-col gap-6 border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Aquí puedes seguir agregando tus campos del formulario si los necesitas */}

          <div className="col-span-6 sm:col-span-3">
            <Label>Adjunta tus prospectos</Label>            
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) setFile(selectedFile);
              }}
              className={`focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 ${file}`}
            />

            <button
              type="button"
              onClick={handleUploadCsv}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {loading ? "Cargando..." : "Subir archivo CSV"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
