"use client";

import React, { useState } from "react";
import axios from "axios";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import AlertModal from "@/components/shared/ui/modal/AlertModal";


type Props = {
  onClose: () => void;
  templateName: string;
  mediaUrl?: string;
};

const BroadcastUploaderModal = ({
  onClose,
  templateName,
  mediaUrl = "",
}: Props) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [messageTemplate, setMessageTemplate] = useState(templateName || "");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);


  

  const resetForm = () => {
    setCsvFile(null);
    setImageUrl("");
    setResponse(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile || !messageTemplate) {
      setError("📌 El archivo CSV y el nombre de la plantilla son obligatorios.");
      return;
    }

    if (!csvFile.name.endsWith(".csv")) {
      setError("⚠️ El archivo debe ser un CSV válido (.csv).");
      return;
    }
    

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("csvFile", csvFile);
      formData.append("messageTemplate", messageTemplate);
      formData.append("mediaUrl", imageUrl); // URL ya subida desde Cloudinary

      const res = await axios.post("https://bot-meta-qa.up.railway.app/upload", formData);

      setResponse(res.data);

      if (res.data.success) {
        // setTimeout(() => {
        //   resetForm();
        //   onClose();
        // }, 2000);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "❌ Ocurrió un error inesperado al enviar.";
      setResponse(null);
      setError(message);
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-gray-800 dark:text-white">
      <h2 className="text-xl font-bold">
        📤 Envío Masivo para: <span className="text-blue-600">{messageTemplate}</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">📄 Archivo CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="border px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">📝 Nombre de plantilla</label>
          <input
            type="text"
            value={messageTemplate}
            disabled
            className="border px-3 py-2 w-full cursor-not-allowed bg-gray-100 dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">🖼️ Adjuntar imagen (opcional)</label>
          <ImageUpload onChange={(url) => setImageUrl(url)} value={imageUrl} />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar mensajes"}
        </button>
      </form>
      {response?.results && (
        <div className="mt-6 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-lg text-center">
          ✅ Se enviaron correctamente <strong>{response.results.length}</strong> mensajes.
        </div>
      )}
      {showErrorAlert && (
        <AlertModal
          isOpen={showErrorAlert}
          onClose={() => setShowErrorAlert(false)}
          title="❌ Error al enviar"
          description={error || "Ocurrió un error inesperado."}
          colorClass="error"
          buttonText="Cerrar"
        />
      )}
    </div>
  );
};

export default BroadcastUploaderModal;
