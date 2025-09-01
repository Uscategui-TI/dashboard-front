"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, FieldValues } from "react-hook-form";
import Button from "@/components/shared/ui/button/Button";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TextAreaValidate from "@/components/form/input/TextAreaValidate";
import AlertModal from "@/components/shared/ui/modal/AlertModal";
import { softPointBackend } from "@/api";
import axios from "axios";
import Cookies from "js-cookie";

type MyEvent = {
  eventName: string;
  id: number;
};

export default function SmsBroadcastPage() {
  const [loading, setLoading] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const csvFileRef = useRef<HTMLInputElement | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlash, setIsFlash] = useState(false);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({ defaultValues: {} });

  const message = watch("message");

  useEffect(() => {
    // Cargar eventos al montar
    const fetchEvents = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("❌ Token no disponible para cargar eventos");
          setShowErrorAlert(true);
          return;
        }
        const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "";
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

  useEffect(() => {
    const specialCharRegex = /[^a-zA-Z0-9\s.,áéíóúÁÉÍÓÚñÑ]/;
    if (message && specialCharRegex.test(message)) {
      setError("El mensaje no puede contener caracteres especiales.");
      setShowErrorAlert(true);
      setValue("message", message.replace(specialCharRegex, ""));
    }
    if (message && message.length > 160) {
      setError("El mensaje no puede tener más de 160 caracteres.");
      setShowErrorAlert(true);
      setValue("message", message.substring(0, 160));
    }
  }, [message, setValue]);

  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => setToastError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastError]);

  const validateCsvFile = async (file: File) => {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length > 1000) {
      setError("El archivo CSV no puede contener más de 1000 números.");
      setShowErrorAlert(true);
      return false;
    }
    return true;
  };

  // Función para convertir archivo a base64
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject("No se pudo leer el archivo");
      };
      reader.onerror = (error) => reject(error);
    });

  const saveStats = async ({
    message,
    csvCount,
    eventName,
  }: {
    message: string;
    csvCount: number;
    eventName: string;
  }) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("❌ Token no disponible para guardar estadísticas");
        setShowErrorAlert(true);
        return;
      }

      const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "";
      const formattedDate = new Date().toISOString().split("T")[0];

      await axios.post(
        `${authUrl}/api/v1.0/broadcasts/all`,
        {
          subject: message,
          totalMessagesSent: csvCount,
          status: "Finalizado",
          date: formattedDate,
          eventName,
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
    } catch (error: any) {
      setError(
        "❌ Error al guardar estadísticas: " +
          (error.response?.data?.message || error.message)
      );
      setShowErrorAlert(true);
    }
  };

  const onSubmit = async (data: any) => {
    const csvFile = csvFileRef.current?.files?.[0];
    if (!csvFile) {
      setToastError("Debes seleccionar un archivo CSV.");
      return;
    }

    if (!selectedEvent) {
      setToastError("Debes seleccionar un evento.");
      return;
    }

    const isValid = await validateCsvFile(csvFile);
    if (!isValid) return;

    setLoading(true);
    setToastError(null);
    setShowSuccessMessage(false);

    try {
      const csvBase64 = await toBase64(csvFile);

      const body = {
        message: data.message,
        csvFileBase64: csvBase64,
        eventName: selectedEvent,
        flash: isFlash,
      };

      const response = await softPointBackend({
        accionBD: "Send-Sms",
        body,
      });

      const result = await response.json?.();

      setResponseMessage(result?.message || "sin novedades");
      setShowSuccessMessage(true);

      // Guardar estadísticas
      const lines = (await csvFile.text())
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0);
      await saveStats({
        message: data.message,
        csvCount: lines.length,
        eventName: selectedEvent,
      });

      reset();
      if (csvFileRef.current) csvFileRef.current.value = "";
      setSelectedEvent("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setToastError(error.message);
      } else {
        setToastError("Error desconocido al enviar el formulario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Envío Masivo de SMS" />
      <div className="min-h-screen rounded-2xl border flex flex-col gap-6 border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <Label>Mensaje de texto</Label>
              <TextAreaValidate
                name="message"
                rows={6}
                placeholder="Escribe el mensaje que se enviará por SMS"
                error={!!errors.message}
                hint={
                  typeof errors.message?.message === "string"
                    ? errors.message.message
                    : undefined
                }
                register={register("message", {
                  required: "El mensaje es obligatorio",
                })}
              />
            </div>

            <div className="col-span-6">
              <Label>Archivo CSV con números</Label>
              <FileInput ref={csvFileRef} />
            </div>

            <div className="col-span-6 ">
              <Label>Seleccionar evento</Label>
              <select
                className="border px-3 py-2 w-full dark:text-gray-100 bg-gray-800 rounded-md"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
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


            <div className="col-span-6 flex space-x-4">
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                variant="primary"
              >
                {loading ? "Enviando..." : "Enviar SMS"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  reset();
                  if (csvFileRef.current) csvFileRef.current.value = "";
                  setToastError(null);
                  setShowSuccessMessage(false);
                  setSelectedEvent("");
                }}
              >
                Limpiar formulario
              </Button>
            </div>

            {showSuccessMessage && (
              <p className="text-green-600 font-semibold mt-2">
                ✅ SMS enviados correctamente: {responseMessage}
              </p>
            )}

            {toastError && (
              <p className="text-red-600 font-semibold mt-2">{toastError}</p>
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
        </form>
      </div>
    </>
  );
}
