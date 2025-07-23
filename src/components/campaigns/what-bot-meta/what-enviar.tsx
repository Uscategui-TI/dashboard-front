
"use client";

import React, { useState } from "react";
import axios from "axios";

type Props = {
  onClose: () => void;
  templateName: string;
  mediaUrl?: string;
};

const BroadcastUploaderModal = ({ onClose, templateName, mediaUrl = "" }: Props) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [messageTemplate, setMessageTemplate] = useState(templateName || "");
  const [mediaUrlInput, setMediaUrlInput] = useState(mediaUrl);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile || !messageTemplate) {
      alert("📌 El archivo CSV y el nombre de la plantilla son obligatorios.");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", csvFile);
    formData.append("messageTemplate", messageTemplate);
    formData.append("mediaUrl", mediaUrlInput);
    formData.append("language", "es_CO");

    try {
      setLoading(true);
      const res = await axios.post("https://bot-meta-qa.up.railway.app/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-gray-800 dark:text-white">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
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
            className="border px-3 py-2 w-full  cursor-not-allowed"
          />
        </div>

        {mediaUrlInput && (
          <div>
            <label className="block text-sm font-medium mb-1">🖼️ Imagen detectada</label>
            <img src={mediaUrlInput} alt="Imagen" className="w-48 rounded shadow" />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar mensajes"}
        </button>
      </form>

      {response && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 dark:text-white">📊 Resultado:</h3>
          <pre className="bg-gray-100 p-3 mt-2 text-sm overflow-x-auto rounded dark:bg-gray-800 dark:text-white">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BroadcastUploaderModal;