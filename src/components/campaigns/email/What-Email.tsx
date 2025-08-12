"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, FieldValues } from "react-hook-form";
import Button from "@/components/shared/ui/button/Button";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import TextAreaValidate from "@/components/form/input/TextAreaValidate";
import CountUp from "react-countup";
import { softPointBackend } from "@/api";
import AlertModal from "@/components/shared/ui/modal/AlertModal";
import { EmailTemplate } from "@/components/campaigns/email/EmailTempleate";
import axios from "axios";
import Cookies from "js-cookie";

type MyEvent = {
  eventName: string;
  id: number;
};

export default function EmailBroadcastPage() {
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [totalEmailsSent, setTotalEmailsSent] = useState<number | null>(null);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [eventName, setEventName] = useState<string>("");

  const csvFileRef = useRef<HTMLInputElement | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({ defaultValues: {} });

  const urlMedia = watch("urlMedia");

  // Cargar eventos al montar
  useEffect(() => {
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
    if (toastError) {
      const timer = setTimeout(() => setToastError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastError]);

  const validateCsvEmailFile = async (file: File): Promise<number | false> => {
    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length > 1000) {
        setError("El archivo CSV no puede contener más de 1.000 correos.");
        setShowErrorAlert(true);
        return false;
      }

      return lines.length; // Retornamos la cantidad de correos
    } catch (e) {
      setError("Error al leer el archivo CSV.");
      setShowErrorAlert(true);
      return false;
    }
  };

  // Función para guardar info del envío incluyendo evento
  const saveEmailStats = async ({
    subject,
    totalEmailsSent,
    imageUrl,
    eventName,
  }: {
    subject: string;
    totalEmailsSent: number;
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

      const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "";
      const formattedDate = new Date().toISOString().split("T")[0];

      await axios.post(
        `${authUrl}/api/v1.0/broadcasts/all`,
        {
          subject,
          totalMessagesSent: totalEmailsSent,
          imageUrl: imageUrl || "",
          status: "Finalizado",
          date: formattedDate,
          eventName,
          type: "Informativo",
          provedor: "Email",
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

  const onSubmit = async (formData: any) => {
    const csvFile = csvFileRef.current?.files?.[0];
    if (!csvFile) {
      setToastError("❌ Por favor selecciona un archivo CSV.");
      return;
    }

    if (!eventName) {
      setToastError("❌ Por favor selecciona un evento.");
      return;
    }

    const totalEmails = await validateCsvEmailFile(csvFile);
    if (!totalEmails) return; // Si es false, hay error

    setLoading(true);
    setIsSending(true);
    setShowSuccessMessage(false);

    try {
      const htmlBody = EmailTemplate({
        content: formData.message,
        imageUrl: formData.urlMedia,
        buttonUrl1: formData.secondaryButtonUrl,
      });

      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            if (typeof reader.result === "string") resolve(reader.result);
            else reject("No se pudo leer el archivo");
          };
          reader.onerror = error => reject(error);
        });

      const csvBase64 = await toBase64(csvFile);

      const body = {
        csvFileBase64: csvBase64,
        subject: formData.subject,
        htmlContent: htmlBody,
      };

      const response = await softPointBackend({
        accionBD: "Send-Email",
        body,
      });

      if (response.error) {
        setToastError(response.error);
      } else {
        setShowSuccessMessage(true);
        setTotalEmailsSent(response.totalSent || null);

        // Guardar estadísticas con el total del CSV, no solo el enviado
        await saveEmailStats({
          subject: formData.subject,
          totalEmailsSent: totalEmails, // Aquí usamos el total leído del CSV
          imageUrl: formData.urlMedia || "",
          eventName,
        });

        reset();
        if (csvFileRef.current) csvFileRef.current.value = "";
        setEventName("");
      }
    } catch (error: any) {
      setToastError("❌ Error al enviar los correos.");
      console.error(error);
    } finally {
      setLoading(false);
      setIsSending(false);
    }
  };


  return (
    <>
      <PageBreadcrumb pageTitle="Envío Masivo de Emails" />
      <div className="min-h-screen rounded-2xl border flex flex-col gap-6 border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className="grid grid-cols-6 gap-6">
            {/* Asunto */}
            <div className="col-span-6 sm:col-span-6">
              <Label>Asunto del correo</Label>
              <Input
                type="text"
                placeholder="Asunto del correo"
                {...register("subject", { required: true })}
                error={!!errors.subject}
                hint={errors.subject ? "El asunto es obligatorio" : undefined}
              />
            </div>

            {/* Contenido */}
            <div className="col-span-6 sm:col-span-6">
              <Label>Contenido del correo </Label>
              <TextAreaValidate
                name="message"
                rows={6}
                placeholder="Escribe el contenido que aparecerá en el correo"
                error={!!errors.message}
                hint={
                  typeof errors.message?.message === "string"
                    ? errors.message.message
                    : undefined
                }
                register={register("message", { required: "El contenido es obligatorio" })}
              />
            </div>

            {/* URL botón */}
            <div className="col-span-6 sm:col-span-6">
              <Label>URL para botón de "Más información" (opcional)</Label>
              <Input
                type="url"
                placeholder="https://ejemplo.com/info"
                {...register("secondaryButtonUrl")}
              />
            </div>

            {/* Imagen */}
            <div className="col-span-6 sm:col-span-6">
              <Label>Adjuntar imagen (opcional)</Label>
              <ImageUpload
                onChange={(value) => setValue("urlMedia", value)}
                value={urlMedia || undefined}
              />
            </div>

            {/* Evento */}
            <div className="col-span-6 sm:col-span-6">
              <Label>Seleccionar evento</Label>
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

            {/* Archivo CSV */}
            <div className="col-span-6 sm:col-span-6">
              <Label>Archivo CSV con correos</Label>
              <FileInput ref={csvFileRef} />
            </div>

            {/* Botones */}
            <div className="col-span-6 sm:col-span-6 flex space-x-4">
              <Button type="submit" disabled={isSending || loading} size="sm" variant="primary">
                {isSending || loading ? "Enviando..." : "Enviar correos"}
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
                  setEventName("");
                }}
              >
                Limpiar formulario
              </Button>
            </div>

            {/* Mensajes de éxito y error */}
            {totalEmailsSent !== null && (
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md text-center sm:ml-auto sm:w-fit">
                <p className="text-sm sm:text-base font-medium">
                  Total de correos enviados:{" "}
                  <strong>
                    <CountUp end={totalEmailsSent} duration={0.5} />
                  </strong>
                </p>
              </div>
            )}

            {showSuccessMessage && (
              <p className="text-green-600 font-semibold mt-2">Correo enviado correctamente.</p>
            )}

            {toastError && <p className="text-red-600 font-semibold mt-2">{toastError}</p>}

            {showErrorAlert && (
              <AlertModal
                isOpen={showErrorAlert}
                onClose={() => setShowErrorAlert(false)}
                title="❌ Error"
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
