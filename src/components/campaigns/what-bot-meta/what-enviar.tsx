"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import AlertModal from "@/components/shared/ui/modal/AlertModal";
import Cookies from "js-cookie";

const urlMeta = process.env.NEXT_PUBLIC_WHATSAPP_URL_META;
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "";

type Props = {
  onClose: () => void;
  templateName: string;
  mediaUrl?: string;
};

type MyEvent = {
  eventName: string;
  id: number;
};

const BroadcastUploaderModal = ({
  onClose,
  templateName,
  mediaUrl = "",
}: Props) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [messageTemplate, setMessageTemplate] = useState(templateName || "");
  const [eventName, setEventName] = useState<string>("");
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Cargar eventos al abrir modal
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("❌ Token no disponible para cargar eventos");
          setShowErrorAlert(true);
          return;
        }

        const response = await axios.get(`${authUrl}/api/v1.0/events/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const eventsArray = response.data?.data?.active;
        if (Array.isArray(eventsArray)) {
          setEvents(eventsArray);
        } else {
          setEvents([]);
          setError("❌ Respuesta inesperada al cargar eventos");
          setShowErrorAlert(true);
        }
      } catch (error) {
        setError("❌ Error al cargar eventos");
        setShowErrorAlert(true);
        console.error(error);
      }
    };

    fetchEvents();
  }, []);

  const resetForm = () => {
    setCsvFile(null);
    setImageUrl("");
    setResponse(null);
    setError(null);
    setEventName("");
  };

  const validateCsvPhoneLimit = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length > 1000) {
        setError("⚠️ El archivo CSV no puede contener más de 1.000 números de teléfono.");
        setShowErrorAlert(true);
        return false;
      }

      return true;
    } catch {
      setError("❌ Error al leer el archivo CSV.");
      setShowErrorAlert(true);
      return false;
    }
  };

  const saveWhatsAppStats = async ({
    templateName,
    totalMessagesSent,
    imageUrl,
    eventName,
  }: {
    templateName: string;
    totalMessagesSent: number;
    imageUrl: string;
    eventName: string;
  }) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("❌ Token no disponible para guardar estadísticas");
        setShowErrorAlert(true);
        return;
      }

      const formattedDate = new Date().toISOString().split("T")[0];

      await axios.post(
        `${authUrl}/api/v1.0/broadcasts/all`,
        {
          subject: templateName,
          totalMessagesSent,
          imageUrl: imageUrl || "",
          status: "Finalizado",
          date: formattedDate,
          eventName,
          type: "Informativo",
          provedor: "whatsapp✅",
          endDate: formattedDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      setError(
        "❌ Error al guardar estadísticas: " +
          (error.response?.data?.message || error.message)
      );
      setShowErrorAlert(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile || !messageTemplate) {
      setError("📌 El archivo CSV y el nombre de la plantilla son obligatorios.");
      setShowErrorAlert(true);
      return;
    }

    if (!csvFile.name.endsWith(".csv")) {
      setError("⚠️ El archivo debe ser un CSV válido (.csv).");
      setShowErrorAlert(true);
      return;
    }

    if (!eventName) {
      setError("📌 Debes seleccionar un evento.");
      setShowErrorAlert(true);
      return;
    }

    const isValid = await validateCsvPhoneLimit(csvFile);
    if (!isValid) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("csvFile", csvFile);
      formData.append("messageTemplate", messageTemplate);
      formData.append("mediaUrl", imageUrl);

      const res = await axios.post(`${urlMeta}/upload`, formData);

      setResponse(res.data);

      if (res.data.success) {
        await saveWhatsAppStats({
          templateName: messageTemplate,
          totalMessagesSent: res.data.results.length,
          imageUrl,
          eventName,
        });

        // resetForm();
        // onClose();
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
        📤 Envío Masivo para:{" "}
        <span className="text-blue-600">{messageTemplate}</span>
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
          <label className="block text-sm font-medium mb-1">🎉 Seleccionar evento</label>
          <select
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="border px-3 py-2 w-full dark:text-gray-100 bg-gray-800"
            required
          >
            <option value="">-- Selecciona un evento --</option>
            {events.map((e) => (
              <option key={e.id} value={e.eventName}>
                {e.eventName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            🖼️ Adjuntar imagen (opcional)
          </label>
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
          ✅ Se enviaron correctamente{" "}
          <strong>{response.results.length}</strong> mensajes.
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
