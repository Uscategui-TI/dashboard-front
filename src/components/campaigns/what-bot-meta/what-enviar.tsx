"use client";

import React, { useState } from "react";
import axios from "axios";

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
  const [messageTemplate, setMessageTemplate] = useState(templateName || "");
  const [mediaUrlInput, setMediaUrlInput] = useState(mediaUrl);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCsvFile(null);
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

    const formData = new FormData();
    formData.append("csvFile", csvFile);
    formData.append("messageTemplate", messageTemplate);
    formData.append("mediaUrl", mediaUrlInput);

    try {
      setLoading(true);
      setError(null);

      const res = await axios.post("https://bot-meta-qa.up.railway.app/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResponse(res.data);

      // Cerrar el modal automáticamente después de 2 segundos si fue exitoso
      if (res.data.success) {
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "❌ Ocurrió un error inesperado al enviar.";
      setResponse(null);
      setError(message);
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

        {mediaUrlInput && (
          <div>
            <label className="block text-sm font-medium mb-1">🖼️ Imagen detectada</label>
            <img
              src={mediaUrlInput}
              alt="Media"
              className="w-48 h-auto rounded shadow"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar mensajes"}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600 bg-red-100 p-2 rounded">
          ⚠️ {error}
        </div>
      )}

      {response?.results && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 dark:text-white">
            📊 Resultados:
          </h3>
          <ul className="bg-gray-100 dark:bg-gray-800 p-3 mt-2 rounded text-sm space-y-1 max-h-64 overflow-auto">
            {response.results.map((r: any, index: number) => (
              <li key={index}>
                <span className="font-medium text-green-600">{r.number}</span> —{" "}
                <span>{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BroadcastUploaderModal;
