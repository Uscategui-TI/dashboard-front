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

import { EmailTemplate } from "@/components/campaigns/email/EmailTempleate"; // Ajusta la ruta según tu estructura



export default function EmailBroadcastPage() {
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [totalEmailsSent, setTotalEmailsSent] = useState<number | null>(null);
  const csvFileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({ defaultValues: {} });

  const urlMedia = watch("urlMedia");

  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => setToastError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastError]);

  const onSubmit = async (formData: any) => {
    const csvFile = csvFileRef.current?.files?.[0];
    if (!csvFile) {
      setToastError("❌ Por favor selecciona un archivo CSV.");
      return;
    }

    setLoading(true);
    setIsSending(true);
    setShowSuccessMessage(false);

    try {
    const htmlBody = EmailTemplate({
      content: formData.message,
      imageUrl: formData.urlMedia,
      buttonUrl1: formData.secondaryButtonUrl,
    });

    // Leer CSV y convertir a base64 para enviar en JSON (fetch no envía archivos multipart sin FormData)
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
      reset();
      if (csvFileRef.current) csvFileRef.current.value = "";
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
            <div className="col-span-6 sm:col-span-6">
              <Label>Contenido del correo </Label>
              <TextAreaValidate
                name="message"
                rows={6}
                placeholder="Escribe el contenido que aparecerá en el correo"
                error={!!errors.message}
                hint={typeof errors.message?.message === "string" ? errors.message.message : undefined}
                register={register("message", { required: "El contenido es obligatorio" })}
              />
            </div>
            <div className="col-span-6 sm:col-span-6">
              <Label>URL para botón de "Más información" (opcional)</Label>
              <Input
                type="url"
                placeholder="https://ejemplo.com/info"
                {...register("secondaryButtonUrl")}
              />
            </div>
            <div className="col-span-6 sm:col-span-6">
              <Label>Adjuntar imagen (opcional)</Label>
              <ImageUpload
                onChange={(value) => setValue("urlMedia", value)}
                value={urlMedia || undefined}
              />
            </div>
            <div className="col-span-6 sm:col-span-6">
              <Label>Archivo CSV con correos</Label>
              <FileInput ref={csvFileRef} />
            </div>
            <div className="col-span-6 sm:col-span-6 flex space-x-4">
              <Button
                type="submit"
                disabled={isSending || loading}
                size="sm"
                variant="primary"
              >
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
                }}
              >
                Limpiar formulario
              </Button>
            </div>

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

            {toastError && (
              <p className="text-red-600 font-semibold mt-2">{toastError}</p>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
