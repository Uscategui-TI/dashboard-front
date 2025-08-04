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

export default function SmsBroadcastPage() {
  const [loading, setLoading] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
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

  const message = watch("message");
  
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
      .map(line => line.trim())
      .filter(line => line.length > 0);

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
      reader.onerror = error => reject(error);
    });

  const onSubmit = async (data: any) => {
    const csvFile = csvFileRef.current?.files?.[0];
    if (!csvFile) {
      setToastError("Debes seleccionar un archivo CSV.");
      return;
    }

    // ✅ Validación del CSV antes de enviar
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
      };

      const response = await softPointBackend({
        accionBD: "Send-Sms",
        body,
      });

      const result = await response.json?.();

      setResponseMessage(result?.message || "sin novedades");
      setShowSuccessMessage(true);
      reset();
      if (csvFileRef.current) csvFileRef.current.value = "";
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
                hint={typeof errors.message?.message === "string" ? errors.message.message : undefined}
                register={register("message", { required: "El mensaje es obligatorio" })}
              />
            </div>

            <div className="col-span-6">
              <Label>Archivo CSV con números</Label>
              <FileInput ref={csvFileRef} />
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
