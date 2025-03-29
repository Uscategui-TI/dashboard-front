"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import PhoneInput from "@/components/form/group-input/PhoneInput";

const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function WhatPanelPage() {
  const [isOpenConect, setIsOpenConect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalMessagesSent, setTotalMessagesSent] = useState<number | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [eventList, setEventList] = useState<string[]>([]);
  const [selectedEventName, setSelectedEventName] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [linkToken, setLinkToken] = useState("");
  const [isRestartDisabled, setIsRestartDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [selectedEventType, setSelectedEventType] = useState<{ value: string; label: string } | null>(null);
const [selectedEventStatus, setSelectedEventStatus] = useState<{ value: string; label: string } | null>(null);
  const [pendingStat, setPendingStat] = useState<null | {
    eventName: string;
    total: number | null;
    imageUrl: string;
    type: string;
    status: string;
    endDate: string;
  }>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: errorsGeneral },
  } = useForm<FieldValues>({ defaultValues: {} });

  const setCustomValue = (id: any, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const urlMedia = watch("urlMedia");
  const eventType = watch("eventType");
  const eventStatus = watch("eventStatus");

  const onSubmitGenreal = async (formData: any) => {
    try {
      setLoading(true);
      setIsBroadcasting(true);

      if (!formData.csvFile || formData.csvFile.length === 0) {
        setIsBroadcasting(false);
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("csvFile", formData.csvFile[0]);
      if (formData.urlMedia) {
        formDataToSend.append("urlMedia", formData.urlMedia);
      }
      formDataToSend.append("message", formData.message);

      await axios.post(`${apiWhatsApp}/upload`, formDataToSend);

      const imageUrl = formData.urlMedia;
      const type = formData.eventType;
      const status = formData.eventStatus;
      const today = new Date().toISOString().split("T")[0];

      setPendingStat({
        eventName: formData.eventName || selectedEventName || "",
        total: null,
        imageUrl,
        type,
        status,
        endDate: today,
      });

      reset();
      setIsBroadcasting(false);
    } catch (error: any) {
      console.error("Error al enviar difusión:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveEventStats = async ({
    eventName,
    total,
    imageUrl,
    type,
    status,
    endDate,
  }: {
    eventName: string;
    total: number;
    imageUrl: string;
    type: string;
    status: string;
    endDate: string;
  }) => {
    try {
      await axios.post(`${authUrl}/api/message-stats/all`, {
        eventName,
        totalMessagesSent: total,
        imageUrl,
        type,
        status,
        endDate,
      });
    } catch (error) {
      console.error("Error al guardar estadísticas:", error);
    }
  };

  useEffect(() => {
    if (!isBroadcasting) return;

    const fetchTotalMessagesSent = async () => {
      try {
        const response = await axios.get(`${apiWhatsApp}/v1/total-messages-sent`);
        setTotalMessagesSent(response.data.totalMessagesSent + 1);
      } catch (error) {
        console.error("Error al obtener el total de mensajes enviados:", error);
      }
    };

    fetchTotalMessagesSent();
    const interval = setInterval(fetchTotalMessagesSent, 5000);
    return () => clearInterval(interval);
  }, [isBroadcasting]);

  useEffect(() => {
    if (!isBroadcasting && totalMessagesSent !== null && pendingStat) {
      saveEventStats({ ...pendingStat, total: totalMessagesSent });
      setPendingStat(null);
  
      // Limpiar selects personalizados
      setSelectedEventName(null);
      setSelectedEventType(null);
      setSelectedEventStatus(null);
  
      // Limpiar formulario
      reset({
        message: "",
        urlMedia: "",
        eventName: "",
        eventType: "",
        eventStatus: "",
        csvFile: null,
      });
    }
  }, [isBroadcasting, totalMessagesSent]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${authUrl}/api/messages/events`);
      const eventsFromDb = response.data.map((e: any) => e.eventName);
      setEventList(eventsFromDb);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const countries = [
    { code: "CO", label: "57" },
    { code: "US", label: "1" },
  ];

  const handlePhoneNumberChange = (phoneNumber: string) => {
    console.log("Updated phone number:", phoneNumber);
  };

  const handleRequestToken = async () => {
    try {
      const response = await axios.post(`${apiWhatsApp}/set-phone-number`, { phoneNumber });
      if (response.data.token) setLinkToken(response.data.token);

      setIsRestartDisabled(true);
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRestartDisabled(false);
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error al enviar el número:", error);
    }
  };

  const handleRestart = async () => {
    try {
      await axios.post(`${apiWhatsApp}/restart-bot`);
      alert("El bot se está reiniciando...");
    } catch (error) {
      console.error("Error al reiniciar el bot:", error);
    }
  };

  useEffect(() => {
    const fromLogin = localStorage.getItem("fromLogin");
    if (fromLogin === "true") {
      localStorage.removeItem("fromLogin");
      window.location.reload();
    }
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="WhatsApp Panel" />
      <div className="min-h-screen rounded-2xl border flex flex-col gap-6 border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmitGenreal)} encType="multipart/form-data">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <Label>Redacta tu mensaje</Label>
              <textarea
                rows={12}
                {...register("message")}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
                placeholder="Redacta el mensaje ideal para tu campaña"
                required
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Adjunta tu archivo multimedia</Label>
              <ImageUpload onChange={(value) => setCustomValue("urlMedia", value)} value={urlMedia || undefined} />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Selecciona tu evento</Label>
              <Select
                value={selectedEventName || ""}
                options={eventList.map((e) => ({ value: e, label: e }))}
                placeholder="Selecciona un evento"
                onChange={(value: string) => {
                  setSelectedEventName(value);
                  setValue("eventName", value);
                }}
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Tipo de evento</Label>
              <Select
                value={selectedEventType?.value || ""}
                options={[
                  { value: "Importante", label: "Importante" },
                  { value: "Informativo", label: "Informativo" },
                ]}
                placeholder="Selecciona el tipo"
                onChange={(value: string) => {
                  const option = { value, label: value };
                  setSelectedEventType(option);
                  setValue("eventType", value);
                }}
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Estado del evento</Label>
              <Select
                value={selectedEventStatus?.value || ""}
                options={[
                  { value: "Finalizado", label: "Finalizado" },
                  { value: "En proceso", label: "En proceso" },
                  { value: "Error", label: "Error" },
                ]}
                placeholder="Selecciona estado"
                onChange={(value: string) => {
                  const option = { value, label: value }; // reconstruir objeto
                  setSelectedEventStatus(option);
                  setValue("eventStatus", value);
                }}
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Adjunta tu listado de difusión</Label>
              <FileInput onChange={(e) => setCustomValue("csvFile", e.target.files)} />
            </div>

            <div className="col-span-6 sm:col-full flex flex-col space-y-6">
              <div className="flex space-x-4">
                <Button size="sm" variant="primary" onClick={() => setIsOpenConect(false)}>
                  Vincular
                </Button>
                <Button size="sm" variant="primary" type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Difusión"}
                </Button>
                <Button size="sm" variant="primary" onClick={() => axios.post(`${apiWhatsApp}/cancel-broadcast`)}>
                  Cancelar Difusión
                </Button>
              </div>
                  {totalMessagesSent !== null && (
                    <div className="bg-cyan-600 text-white px-6 py-3 rounded-lg shadow-md text-center sm:ml-auto sm:w-fit">
                      <p className="text-sm sm:text-base font-medium">
                        Total de mensajes enviados:{" "}
                        <strong className="font-semibold">{totalMessagesSent}</strong>
                      </p>
                    </div>
                  )}
            </div>
            </div>
          </form>
        </div>
      <div
        className={`fixed top-19 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform w-90 bg-white dark:border-gray-200 dark:bg-gray-900 ${
          isOpenConect ? "translate-x-full" : "-translate-x-0"
        }`}
      >
        <h5 className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
          </svg>
          <Label>Vincular Dispositivo</Label>
        </h5>

        {/* Botón para cerrar el drawer */}
        <button
          onClick={() => setIsOpenConect(true)}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>

        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          La difusión masiva de mensajes se realiza por medio de un puente entre tu dispositivo y sesión principal de WhatsApp.{" "}
          <a href="#" className="text-blue-600 underline dark:text-blue-500 hover:no-underline">
            Visita guía de uso
          </a>
        </p>

        <div className="flex flex-col gap-4">
          {/* Input de teléfono */}
          <div>
            <Label>Número de teléfono</Label>
            <PhoneInput
              selectPosition="start"
              countries={countries}
              placeholder="+57 3204084584"
              onChange={(value) => setPhoneNumber(value)}
            />
          </div>

          {/* Token */}
          {linkToken && (
            <div>
              <Label>Token de vinculación</Label>
              <div
                className="mt-2 p-3 border border-gray-300 bg-transparent py-3 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 rounded-lg text-center select-all"
                onClick={() => navigator.clipboard.writeText(linkToken)}
                title="Haz clic para copiar"
              >
                {linkToken}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="grid grid-cols-2 gap-4">
            <Button size="sm" variant="outline" onClick={handleRequestToken}>
              Solicitar Token
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleRestart}
              disabled={isRestartDisabled}
            >
              {isRestartDisabled ? `Actualizar (${countdown}s)` : "Actualizar Proveedor"}
            </Button>
          </div>
        </div>
      </div>
      {!isOpenConect && (
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => setIsOpenConect(false)}
        />
      )}
    </>
  );
}
