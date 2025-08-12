"use client";

import { useState, useEffect } from "react";
import Button from "@/components/shared/ui/button/Button";
import AlertModal from "@/components/shared/ui/modal/AlertModal";
import { Modal } from "@/components/shared/ui/modal";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import axios from "axios";
import Cookies from "js-cookie";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  phoneNumbers: string[];
};

type Template = {
  name: string;
  components: any[];
};

type MyEvent = {
  eventName: string;
  id: number;
  // agrega más propiedades si las necesitas
};

const tokenMeta = process.env.NEXT_PUBLIC_YOUR_ACCESS_TOKEN!;
const whatsappId = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID!;
const version = process.env.NEXT_PUBLIC_GRAPH_API_VERSION || "v23.0";
const urlMeta = process.env.NEXT_PUBLIC_WHATSAPP_URL_META;

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "";

const WhatsAppBroadcastModal = ({ isOpen, onClose, phoneNumbers }: Props) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [success, setSuccess] = useState(false);
  const [statsSavingStatus, setStatsSavingStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Estado para eventos activos
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [selectedEventName, setSelectedEventName] = useState<string>("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(
          `https://graph.facebook.com/${version}/${whatsappId}/message_templates?access_token=${tokenMeta}`
        );
        const data = await res.json();
        setTemplates(data.data || []);
      } catch (err) {
        setError("No se pudieron cargar las plantillas.");
        setShowAlert(true);
      }
    };

    const fetchEvents = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setToastError("❌ Token no disponible para cargar eventos");
          return;
        }
        const response = await axios.get(`${authUrl}/api/v1.0/events/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const eventsArray = response.data?.data?.active;
        if (Array.isArray(eventsArray)) {
          setEvents(eventsArray);
        } else {
          setEvents([]);
          setToastError("❌ Respuesta inesperada al cargar eventos activos");
        }
      } catch (error) {
        setToastError("❌ Error al cargar eventos");
        console.error(error);
      }
    };

    if (isOpen) {
      fetchTemplates();
      fetchEvents();
    }
  }, [isOpen]);

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
        setToastError("❌ Token no disponible");
        setStatsSavingStatus("error");
        return;
      }
      setStatsSavingStatus("saving");

      const formattedDate = new Date().toISOString().split("T")[0];

      await axios.post(
        `${authUrl}/api/v1.0/broadcasts/all`,
        {
          subject: templateName,
          totalMessagesSent,
          imageUrl: imageUrl || "",
          status: "Finalizado",
          date: formattedDate,
          eventName: eventName || "",
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

      setStatsSavingStatus("saved");
      setToastSuccess("✅ Estadísticas guardadas correctamente");
    } catch (error: any) {
      setToastError(
        "❌ Error al guardar estadísticas: " +
          (error.response?.data?.message || error.message)
      );
      setStatsSavingStatus("error");
    }
  };

  const handleSend = async () => {
    if (!selectedTemplate) {
      setError("Debes seleccionar una plantilla.");
      setShowAlert(true);
      return;
    }

    if (!selectedEventName) {
      setError("Debes seleccionar un evento activo.");
      setShowAlert(true);
      return;
    }

    try {
      setLoading(true);
      setToastError(null);
      setToastSuccess(null);

      const res = await fetch(`${urlMeta}/send-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numbers: phoneNumbers,
          messageTemplate: selectedTemplate,
          mediaUrl: imageUrl,
        }),
      });

      const result = await res.json();

      if (result.success) {
        await saveWhatsAppStats({
          templateName: selectedTemplate,
          totalMessagesSent: phoneNumbers.length,
          imageUrl,
          eventName: selectedEventName,
        });

        setSuccess(true);
      } else {
        throw new Error("No se pudo enviar el mensaje.");
      }
    } catch (err) {
      setError("Error al enviar los mensajes.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 lg:p-10">
      {toastError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {toastError}
        </div>
      )}
      {toastSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-4">
          {toastSuccess}
        </div>
      )}

      <div className="space-y-4 text-gray-800 dark:text-white">
        <h2 className="text-xl font-bold">📤 Difusión por WhatsApp</h2>

        <div>
          <label className="block text-sm font-medium mb-1">📑 Selecciona una plantilla</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800"
          >
            <option value="">-- Elige una plantilla --</option>
            {templates.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">📅 Selecciona un evento activo</label>
          <select
            value={selectedEventName}
            onChange={(e) => setSelectedEventName(e.target.value)}
            className="w-full border px-3 py-2 dark:bg-gray-800 rounded-md"
          >
            <option value="">-- Elige un evento --</option>
            {events.map((event) => (
              <option key={event.id} value={event.eventName}>
                {event.eventName || "Sin nombre"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">🖼️ Imagen (opcional)</label>
          <ImageUpload value={imageUrl} onChange={(url) => setImageUrl(url)} />
        </div>

        <Button
          onClick={handleSend}
          disabled={loading}
          variant="primary"
          className="w-full"
        >
          {loading ? "Enviando..." : "Enviar Mensajes"}
        </Button>

        {success && (
          <div className="mt-4 p-3 text-green-700 bg-green-100 rounded-lg">
            ✅ Mensajes enviados correctamente a {phoneNumbers.length} prospectos.
          </div>
        )}

        {showAlert && (
          <AlertModal
            isOpen={showAlert}
            onClose={() => setShowAlert(false)}
            title="Error"
            description={error || "Ocurrió un error inesperado."}
            colorClass="error"
            buttonText="Cerrar"
          />
        )}
      </div>
    </Modal>
  );
};

export default WhatsAppBroadcastModal;
