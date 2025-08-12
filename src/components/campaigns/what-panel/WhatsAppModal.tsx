"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/ui/modal";
import Button from "@/components/shared/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import axios from "axios";
import CountUp from "react-countup";
import { endPointBackend } from "@/api";
import Cookies from "js-cookie";

const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumbers: string[];
  onSend?: (message: string, urlMedia: string) => void;
}

export default function WhatsAppModal({
  isOpen,
  onClose,
  phoneNumbers,
  onSend,
}: WhatsAppModalProps) {
  const [message, setMessage] = useState("");
  const [urlMedia, setUrlMedia] = useState("");
  const [selectedEventName, setSelectedEventName] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [isBotConnected, setIsBotConnected] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [totalMessagesSent, setTotalMessagesSent] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "enProceso" | "finalizado" | "cancelado">("idle");
  const [pendingStat, setPendingStat] = useState<any>(null);
  const [statsSavingStatus, setStatsSavingStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Cargar eventos y estado pendiente
  useEffect(() => {
    if (isOpen) {
      endPointBackend({ accionBD: "List-Events" }).then((resp) => {
        setEvents(resp.data.active || []);
      });
      checkBotConnection();

      const stored = localStorage.getItem("pendingStat");
      if (stored) {
        setPendingStat(JSON.parse(stored));
        setIsBroadcasting(true);
      }
    }
  }, [isOpen]);

  // Guardar estadísticas
  const saveEventStats = async ({
    id,
    eventName,
    type,
    totalMessagesSent,
    imageUrl,
    status,
    endDate,
    totalBroadcasts,
    provedor,
  }: any) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        console.error("❌ Token no disponible");
        setStatsSavingStatus("error");
        return;
      }

      setStatsSavingStatus("saving");

      // Formatear fecha a yyyy-MM-dd
      const formattedDate = endDate
        ? new Date(endDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      await axios.post(
        `${authUrl}/api/v1.0/broadcasts/all`,
        {
          id: id ?? null,
          eventName,
          type,
          totalMessagesSent,
          imageUrl,
          status,
          endDate: formattedDate,
          totalBroadcasts,
          provedor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setStatsSavingStatus("saved");
      localStorage.removeItem("pendingStat");
    } catch (error: any) {
      console.error("❌ Error al guardar estadísticas:", error.response?.data || error.message);
      setStatsSavingStatus("error");
    }
  };

  // Polling para progreso
  useEffect(() => {
    if (!isBroadcasting) return;

    const fetchStatusAndMessages = async () => {
      try {
        const res = await axios.get(`${apiWhatsApp}/broadcast-status`);
        const { totalMessagesSent: total, status: botStatus } = res.data;

        setTotalMessagesSent(total);

        let formattedStatus = "En proceso";
        if (botStatus === "finalizada") formattedStatus = "Finalizado";
        if (botStatus === "cancelada") formattedStatus = "Cancelado";

        setStatus(
          botStatus === "finalizada"
            ? "finalizado"
            : botStatus === "cancelada"
            ? "cancelado"
            : "enProceso"
        );

        if ((botStatus === "finalizada" || botStatus === "cancelada") && pendingStat) {
          let messages = total;
          let attempts = 0;

          while ((messages === null || messages === 0) && attempts < 3) {
            const retryRes = await axios.get(`${apiWhatsApp}/broadcast-status`);
            messages = retryRes.data.totalMessagesSent;
            attempts++;
            await new Promise((r) => setTimeout(r, 1000));
          }

          await saveEventStats({
            ...pendingStat,
            totalMessagesSent: messages || 0,
            status: formattedStatus,
            endDate: new Date().toISOString(),
          });

          // Limpiar estados
          setPendingStat(null);
          setMessage("");
          setUrlMedia("");
          setSelectedEventName("");
          setSelectedEventType("");
          setTotalMessagesSent(null);
          setIsBroadcasting(false);
          setLoading(false);

          if (botStatus === "finalizada") {
            setToastSuccess("✅ Envío completado.");
          } else {
            setToastError("📢 Difusión cancelada.");
          }

          setTimeout(() => {
            setToastSuccess(null);
            setToastError(null);
          }, 2000);
        }
      } catch (error) {
        console.error("Error al obtener estado de difusión:", error);
      }
    };

    fetchStatusAndMessages();
    const interval = setInterval(fetchStatusAndMessages, 5000);
    return () => clearInterval(interval);
  }, [isBroadcasting, pendingStat]);

  const handleSend = async () => {
    if (!message.trim()) {
      setToastError("❌ El mensaje no puede estar vacío.");
      return;
    }
    if (!selectedEventName || !selectedEventType) {
      setToastError("⚠️ Debes seleccionar evento y tipo.");
      return;
    }

    if (onSend) onSend(message, urlMedia);

    const newPending = {
      id: null,
      eventName: selectedEventName,
      type: selectedEventType,
      totalMessagesSent: 0,
      imageUrl: urlMedia || "",
      status: "En proceso",
      endDate: "",
      totalBroadcasts: 1,
      provedor: "WhatsApp",
    };

    setPendingStat(newPending);
    localStorage.setItem("pendingStat", JSON.stringify(newPending));

    setLoading(true);
    setIsBroadcasting(true);
    setStatus("enProceso");
  };

  const handleCancel = async () => {
    try {
      await axios.post(`${apiWhatsApp}/cancel-broadcast`);
      setIsBroadcasting(false);
      setStatus("cancelado");
      setToastError("📢 Difusión cancelada por el usuario.");
    } catch (error) {
      setToastError("❌ Error al cancelar difusión.");
    }
  };

  const checkBotConnection = async () => {
    try {
      const res = await axios.get(`${apiWhatsApp}/bot-status`);
      if (res.data.connected) {
        setIsBotConnected(true);
        setToastSuccess((prev) => prev || "✅ Bot conectado correctamente.");
      } else {
        setIsBotConnected(false);
        setToastError("⚠️ Bot no conectado.");
      }
    } catch (err) {
      console.error("❌ Error al consultar estado del bot:", err);
      setIsBotConnected(false);
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

      <div className="flex flex-col gap-6 dark:text-amber-50">
        <h2 className="text-2xl font-bold">Enviar WhatsApp</h2>
        <p>
          Enviarás un mensaje a <strong>{phoneNumbers.length}</strong> prospectos.
        </p>

        <div>
          <Label>Redacta tu mensaje</Label>
          <textarea
            rows={6}
            className="shadow-sm bg-gray-50 border rounded-lg w-full p-2.5 dark:bg-gray-700 dark:text-white"
            placeholder="Escribe tu mensaje aquí..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div>
          <Label>Adjunta tu archivo multimedia</Label>
          <ImageUpload onChange={setUrlMedia} value={urlMedia || undefined} />
        </div>

        <div>
          <Label>Selecciona tu evento</Label>
          <Select
            value={selectedEventName}
            options={events.map((e) => ({ value: e.eventName, label: e.eventName }))}
            placeholder="Selecciona un evento"
            onChange={(e) => setSelectedEventName(e.target.value)}
          />
        </div>

        <div>
          <Label>Tipo de evento</Label>
          <Select
            value={selectedEventType}
            options={[
              { value: "Importante", label: "Importante" },
              { value: "Informativo", label: "Informativo" },
            ]}
            placeholder="Selecciona el tipo"
            onChange={(e) => setSelectedEventType(e.target.value)}
          />
        </div>

        {totalMessagesSent !== null && (
          <div className="bg-brand-500 text-white px-6 py-3 rounded-lg shadow-md text-center">
            <p>
              Total enviados:{" "}
              <strong>
                <CountUp end={totalMessagesSent} duration={0.5} />
              </strong>
            </p>
            <p className="text-xs mt-1">
              Estado: {status === "enProceso" && "En proceso..."}
              {status === "finalizado" && "Finalizado ✅"}
              {status === "cancelado" && "Cancelado 🚫"}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {!isBroadcasting ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button onClick={handleSend} disabled={!isBotConnected || loading}>
                {loading ? "Enviando..." : "Enviar"}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleCancel}>
              Cancelar Difusión
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
