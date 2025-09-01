import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/ui/modal";
import Button from "@/components/shared/ui/button/Button";
import axios from "axios";
import Cookies from "js-cookie";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

type SmsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  phoneNumbers: string[];
  onSend: (payload: { message: string; flash: boolean }) => void;
};

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "";

type MyEvent = {
  eventName: string;
  id: number;
  // otras propiedades si las necesitas
};

const isValidMessage = (text: string) => {
  const allowedPattern = /^[a-zA-Z0-9\s.,!?¡¿()'"-]*$/;
  return allowedPattern.test(text);
};

const SmsModal = ({ isOpen, onClose, phoneNumbers, onSend }: SmsModalProps) => {
  const [message, setMessage] = useState("");
  const [isFlash, setIsFlash] = useState(false);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [selectedEventName, setSelectedEventName] = useState<string>("");
  const [statsSavingStatus, setStatsSavingStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [events, setEvents] = useState<MyEvent[]>([]);

  useEffect(() => {
    if (!isOpen) return;

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
          setToastError("❌ Respuesta inesperada al cargar eventos");
        }
      } catch (error) {
        setToastError("❌ Error al cargar eventos");
        console.error(error);
      }
    };

    fetchEvents();
  }, [isOpen]);

  const saveSmsStats = async ({
    message,
    totalMessagesSent,
  }: {
    message: string;
    totalMessagesSent: number;
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
          subject: message.substring(0, 50),
          totalMessagesSent,
          imageUrl: "",
          status: "Finalizado",
          date: formattedDate,
          eventName: selectedEventName,
          type: "Informativo",
          provedor: "sms",
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
    const trimmed = message.trim();
    if (trimmed && trimmed.length <= 160 && isValidMessage(trimmed)) {
      try {
        await onSend({ message: trimmed, flash: isFlash });
        await saveSmsStats({
          message: trimmed,
          totalMessagesSent: phoneNumbers.length,
        });
        onClose();
        setMessage("");
        setSelectedEventName("");
      } catch {
        setToastError("❌ Error al enviar SMS.");
      }
    }
  };

  const invalidChars = !isValidMessage(message);
  const overLimit = message.length > 160;

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

      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Enviar SMS a Prospectos
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Se enviará un mensaje a <strong>{phoneNumbers.length}</strong> prospectos.
        </p>

        <textarea
          rows={5}
          placeholder="Escribe tu mensaje aquí..."
          maxLength={160}
          className="w-full rounded-md border border-gray-300 p-3 text-sm dark:bg-gray-800 dark:text-white"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <span>{message.length}/160 caracteres</span>
          {invalidChars && (
            <span className="text-red-500">⚠️ Caracteres inválidos detectados</span>
          )}
          {overLimit && (
            <span className="text-red-500">⚠️ Superaste el límite de 160 caracteres</span>
          )}
        </div>

        <div className="rounded-md">
          <Label>Selecciona tu evento</Label>
          <Select
            value={selectedEventName}
            options={events.map((e) => ({
              value: e.eventName || "",
              label: e.eventName || "Sin nombre",
            }))}
            placeholder="Selecciona un evento"
            onChange={(e) => setSelectedEventName(e.target.value)}
          />
        </div>
        <div className="col-span-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isFlash}
              onChange={(e) => setIsFlash(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-gray-700 dark:text-gray-200">
              Enviar como SMS Flash
            </span>
          </label>
        </div>


        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={invalidChars || overLimit || message.trim().length === 0}
          >
            Enviar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SmsModal;
