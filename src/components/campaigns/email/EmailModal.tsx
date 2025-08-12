"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/ui/modal";
import Button from "@/components/shared/ui/button/Button";
import Input from "@/components/form/input/Input";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select"; // Asumo que tienes un componente Select
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import { EmailTemplate } from "@/components/campaigns/email/EmailTempleate";
import axios from "axios";
import Cookies from "js-cookie";
import { endPointBackend } from "@/api";

type Event = {
  id: number;
  eventName: string | null;
  // otros campos si los necesitas
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  recipients: string[];
  onSend: (payload: {
    subject: string;
    htmlContent: string;
    recipients: string[];
  }) => void;
};

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function EmailModal({ isOpen, onClose, recipients, onSend }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [secondaryButtonUrl, setSecondaryButtonUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [statsSavingStatus, setStatsSavingStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Eventos y selección
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventName, setSelectedEventName] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      // Simula llamada para traer eventos, reemplaza por tu API real
      endPointBackend({ accionBD: "List-Events" }).then((resp) => {
            setEvents(resp.data.active || []);
          });
    }
  }, [isOpen]);

  

  const saveEmailStats = async ({
    subject,
    totalMessagesSent,
    imageUrl,
    status,
    endDate,
    eventName,
    type,
  }: {
    subject: string;
    totalMessagesSent: number;
    imageUrl: string | null;
    status: string;
    endDate: string;
    eventName: string;
    type: string;
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
          subject,
          totalMessagesSent,
          imageUrl: imageUrl || "",
          status,
          date: formattedDate,
          eventName,
          type : "Informativo",
          provedor: "email", 
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

  const handleSubmit = async () => {
    if (!subject || !message) {
      alert("Debes completar el asunto y el mensaje.");
      return;
    }

    setLoading(true);
    setToastError(null);
    setToastSuccess(null);

    const formattedDate = new Date().toISOString().split("T")[0];
    const htmlContent = EmailTemplate({
      content: message,
      imageUrl: imageUrl || undefined,
      buttonUrl1: secondaryButtonUrl || undefined,
    });

    try {
      await onSend({ subject, htmlContent, recipients });

      // Guardar estadísticas con datos completos
      await saveEmailStats({
        subject,
        totalMessagesSent: recipients.length,
        imageUrl,
        status: "Finalizado",
        endDate: formattedDate,
        eventName: selectedEventName,
        type: selectedEventType,
      });

      setToastSuccess("✅ Correo enviado y estadísticas guardadas.");
      // Limpia campos después del envío
      setSubject("");
      setMessage("");
      setSecondaryButtonUrl("");
      setImageUrl(null);
      setSelectedEventName("");
      setSelectedEventType("");

      onClose();
    } catch (error) {
      setToastError("❌ Error al enviar correo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6 lg:p-10">
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

      <div className="flex flex-col px-4 py-5 gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Enviar correo a prospectos
        </h2>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Destinatarios:
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
            {recipients.join(", ")}
          </p>
        </div>


        <div>
          <Label>Asunto del correo</Label>
          <Input
            type="text"
            placeholder="Asunto del correo"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 dark:text-gray-300">
            Mensaje
          </label>
          <textarea
            name="message"
            rows={6}
            placeholder="Escribe el contenido"
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setMessage(e.target.value)
            }
            required
            className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm text-amber-50 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="rounded-md">
          <Label>URL del botón (opcional)</Label>
          <Input
            type="url"
            placeholder="https://tusitio.com/info"
            value={secondaryButtonUrl}
            onChange={(e) => setSecondaryButtonUrl(e.target.value)}
          />
        </div>

        <div>
          <Label>Imagen (opcional)</Label>
          <ImageUpload
            onChange={(value) => setImageUrl(value)}
            value={imageUrl || undefined}
          />
        </div>

        <div>
          <Label>Selecciona tu evento</Label>
          <Select
            value={selectedEventName}
            options={events.map((e) => ({ value: e.eventName || "", label: e.eventName || "Sin nombre" }))}
            placeholder="Selecciona un evento"
            onChange={(e) => setSelectedEventName(e.target.value)}
          />
        </div>

        {/* Mostrar número de mensajes enviados (número de prospectos) */}
        <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md text-center mt-4">
          <p>
            Total mensajes a enviar: <strong>{recipients.length}</strong>
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
