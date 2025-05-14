"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";
import React, {useEffect, useState, useRef } from "react";
import Button from "@/components/shared/ui/button/Button";
import { useRouter } from "next/navigation";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import CountUp from "react-countup";
import Cookies from "js-cookie";
import GuiaUsoModal from "@/app/guia-uso/page";
import { Modal } from "@/components/shared/ui/modal";


const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function WhatPanelPage() {
  const [isBotConnected, setIsBotConnected] = useState(false);

  const hasNotifiedRef = useRef(false);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
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
  const [statsSavingStatus, setStatsSavingStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const csvFileRef = React.useRef<HTMLInputElement | null>(null);
  const [isRequestDisabled, setIsRequestDisabled] = useState(false);
  const [isGuiaVisible, setIsGuiaVisible] = useState(false);
  const [requestCountdown, setRequestCountdown] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
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

  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => setToastError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastError])
  

  const checkBotConnection = async () => {
    try {
      const res = await axios.get(`${apiWhatsApp}/bot-status`);
      if (res.data.connected) {
        setIsBotConnected(true);
        setToastSuccess((prev) =>
          prev ? prev : "✅ Bot conectado correctamente."
        );
      } else {
        setIsBotConnected(false);
      }
    } catch (err) {
      console.error("❌ Error al consultar estado del bot:", err);
    }
  };


  useEffect(() => {
    checkBotConnection();
  }, []);


  const onSubmitGenreal = async (formData: any) => {
    try {
      setLoading(true);
      setIsBroadcasting(true);

      const csvFile = csvFileRef.current?.files?.[0];
      if (!csvFile) {
        setToastError("❌ Por favor selecciona un archivo CSV.");
        setIsBroadcasting(false);
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("csvFile", csvFile);
      if (formData.urlMedia) formDataToSend.append("urlMedia", formData.urlMedia);
      formDataToSend.append("message", formData.message);

      const response = await axios.post(`${apiWhatsApp}/upload`, formDataToSend);

      if (response.data?.error) {
        setToastError(response.data.error);
        setIsBroadcasting(false);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const newPendingStat = {
        eventName: formData.eventName || selectedEventName || "",
        total: null,
        imageUrl: formData.urlMedia,
        type: formData.eventType,
        status: formData.eventStatus,
        endDate: today,
      };

      setPendingStat(newPendingStat);
      localStorage.setItem("pendingStat", JSON.stringify(newPendingStat));
    } catch (err) {
      console.error("Error al enviar difusión:", err);
      setToastError("❌ Error al enviar difusión.");
      setIsBroadcasting(false);
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
      const token = Cookies.get("token"); // o localStorage.getItem("token")
      if (!token) {
        console.error("❌ Token no disponible");
        setStatsSavingStatus("error");
        return;
      }

      setStatsSavingStatus("saving");

      await axios.post(
        `${authUrl}/api/message-stats/all`,
        {
          eventName,
          totalMessagesSent: total,
          imageUrl,
          type,
          status,
          endDate,
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
  } catch (error) {
    console.error("❌ Error al guardar estadísticas:", error);
    setStatsSavingStatus("error");
  }
};




  useEffect(() => {
    if (!isBroadcasting) return;
  
    const fetchStatusAndMessages = async () => {
      try {
        const res = await axios.get(`${apiWhatsApp}/broadcast-status`);
        const { totalMessagesSent, status } = res.data;
  
        setTotalMessagesSent(totalMessagesSent);

        let formattedStatus = "En proceso";
        if (status === "finalizada") formattedStatus = "Finalizado";
        if (status === "cancelada") formattedStatus = "cancelada";

        // Guardar el estado automáticamente
        setSelectedEventStatus({ value: formattedStatus, label: formattedStatus });
        setValue("eventStatus", formattedStatus);
  
        if ((status === "finalizada" || status === "cancelada") && pendingStat) {
          // 1. Guardar estadísticas
          await saveEventStats({ ...pendingStat, total: totalMessagesSent,status: formattedStatus, });
          
          localStorage.removeItem("pendingStat");
  
          // 2. Limpiar estados
          setPendingStat(null);
          setSelectedEventName(null);
          setSelectedEventType(null);
          setSelectedEventStatus(null);

  
          reset({
            message: "",
            urlMedia: "",
            eventName: "",
            eventType: "",
            eventStatus: "",
            csvFile: null,
          });
          if (csvFileRef.current) {
            csvFileRef.current.value = "";
          }
  
          // 3. Apagar el contador
          setIsBroadcasting(false);
          setLoading(false);
          setPendingStat(null);
          setShowSuccessMessage(true); 
          setTimeout(() => setShowSuccessMessage(false), 2000);
        }
      } catch (error) {
        console.error("Error al obtener estado de difusión:", error);
      }
    };
  
    fetchStatusAndMessages();
    const interval = setInterval(fetchStatusAndMessages, 5000);
    return () => clearInterval(interval);
  }, [isBroadcasting, pendingStat]);

  const fetchEvents = async () => {
  try {
    const response = await axios.get(`${authUrl}/api/messages/events`);

  
    const activeEvents = response.data.active;

    const eventsFromDb = activeEvents.map((e: any) => e.eventName); // asegúrate que sea 'eventName'
    setEventList(eventsFromDb);
  } catch (error) {
    console.error("Error al obtener eventos activos:", error);
  }
};
  

  useEffect(() => {
    fetchEvents();
  }, []);

  const countries = [
    { code: "CO", label: "57" },
    { code: "US", label: "1" },
  ];

  const handleRequestToken = async () => {
    if (isRequestDisabled) return;
  
    try {
      const response = await axios.post(`${apiWhatsApp}/set-phone-number`, { phoneNumber });
      if (response.data.token) setLinkToken(response.data.token);
      const waitUntilConnected = setInterval(async () => {
        try {
          const res = await axios.get(`${apiWhatsApp}/bot-status`);
          if (res.data.connected) {
            clearInterval(waitUntilConnected);
            setIsBotConnected(true);
            setToastSuccess("✅ Bot conectado correctamente.");
          }
        } catch (err) {
          console.error("🔁 Esperando conexión del bot...", err);
        }
      }, 3000);
  
      // 🔒 Desactiva el botón de "Solicitar Token" con contador de 5s
      setIsRequestDisabled(true);
      setRequestCountdown(5);
      const tokenTimer = setInterval(() => {
        setRequestCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(tokenTimer);
            setIsRequestDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
  
      // 🔁 Temporizador de reinicio (30s)
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

  useEffect(() => {
    if (toastSuccess) {
      const timer = setTimeout(() => setToastSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastSuccess]);

  useEffect(() => {
    const savedStat = localStorage.getItem("pendingStat");
    if (savedStat) {
      const parsedStat = JSON.parse(savedStat);
      setPendingStat(parsedStat);
      setIsBroadcasting(true);
    }
  }, []);




  return (
    <>
      {toastError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{toastError}</span>
                <button
                  onClick={() => setToastError(null)}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <svg className="fill-current h-6 w-6 text-red-500" role="button" viewBox="0 0 20 20">
                    <title>Cerrar</title>
                    <path d="M14.348 5.652a1 1 0 00-1.414-1.414L10 7.172 7.066 4.238a1 1 0 10-1.414 1.414L8.586 8.586l-2.934 2.934a1 1 0 101.414 1.414L10 10.828l2.934 2.934a1 1 0 001.414-1.414L11.414 8.586l2.934-2.934z"/>
                  </svg>
                </button>
              </div>
            )}
             {toastSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Éxito: </strong>
                <span className="block sm:inline">{toastSuccess}</span>
                <button
                  onClick={() => setToastSuccess(null)}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <svg className="fill-current h-6 w-6 text-green-500" role="button" viewBox="0 0 20 20">
                    <title>Cerrar</title>
                    <path d="M14.348 5.652a1 1 0 00-1.414-1.414L10 7.172 7.066 4.238a1 1 0 10-1.414 1.414L8.586 8.586l-2.934 2.934a1 1 0 101.414 1.414L10 10.828l2.934 2.934a1 1 0 001.414-1.414L11.414 8.586l2.934-2.934z"/>
                  </svg>
                </button>
              </div>
            )}
            {/* ✅ Toast de éxito (ya lo tenías) */}
            {showSuccessMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                📢 Difusión completada y estadísticas guardadas exitosamente.
              </div>
            )}
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
              <Label>Adjunta tu listado de difusión</Label>
              <FileInput
                ref={csvFileRef}
                onChange={(e) => setCustomValue("csvFile", e.target.files)}
              />
            </div>

            <div className="col-span-6 sm:col-full flex flex-col space-y-6">
              <div className="flex space-x-4">
              <Button
                size="sm"
                variant="primary"
                type="button"
                disabled={isBotConnected}
                onClick={() => setIsOpenConect(true)}
              >
                {isBotConnected ? "Bot Conectado" : "Vincular"}
              </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isBroadcasting || loading}
                >
                  {isBroadcasting || loading ? "Enviando..." : "Enviar Difusión"}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowCancelModal(true)}
                  disabled={!isBroadcasting} 
                  >
                  Cancelar Difusión
                  </Button>
              </div>
              {totalMessagesSent !== null && (
                <div className=" bg-brand-500 text-white px-6 py-3 dark:border-gray-800 dark:bg-white/[0.03] rounded-lg shadow-md text-center sm:ml-auto sm:w-fit">
                  <p className="text-sm sm:text-base font-medium">
                    Total de mensajes enviados:{" "}
                    <strong className="font-semibold">
                      <CountUp end={totalMessagesSent} duration={0.5} />
                    </strong>
                  </p>
                </div>
              )}
            </div>
            </div>
          </form>
        </div>
        <div
            className={`fixed top-19 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform w-90 bg-white dark:border-gray-200 dark:bg-gray-900 ${
              isOpenConect ? "-translate-x-0" : "translate-x-full"
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
          onClick={() => setIsOpenConect(false)}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>

        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          La difusión masiva de mensajes se realiza por medio de un puente entre tu dispositivo y sesión principal de WhatsApp.{" "}
          <a
            onClick={() => setIsGuiaVisible(true)}
            className="cursor-pointer text-blue-600 underline dark:text-blue-500 hover:no-underline"
          >
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
          <Button
            size="sm"
            variant="outline"
            onClick={handleRequestToken}
            disabled={isRequestDisabled}
          >
            {isRequestDisabled ? `Espera ${requestCountdown}s...` : "Solicitar Token"}
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
      {isOpenConect && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          /* onClick={() => setIsOpenConect(false)} */
        />
      )}

      {isGuiaVisible && (
        <>
          {/* Fondo oscuro */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-40"
            onClick={() => setIsGuiaVisible(false)}
          />

          {/* Modal contenido */}
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => setIsGuiaVisible(false)} // click afuera también cierra
            onKeyDown={(e) => e.key === "Escape" && setIsGuiaVisible(false)}
            tabIndex={0}
          >
            <div
              className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg relative transform transition-all duration-300 scale-95 hover:scale-100"
              onClick={(e) => e.stopPropagation()} // prevenir cierre al clickear dentro
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setIsGuiaVisible(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
              >
                ✕
              </button>

              <GuiaUsoModal />
            </div>
          </div>
        </>
      )}
      
      <Modal
          isOpen={showCancelModal}
          onClose={ () => setShowCancelModal(false)}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                ¿Deseas Finalizar la Difusión de mensajes?
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <br/>
                Ten en encuenta que esta acción no se puede reversar y se truncara el proceso en el registro actual para seguir difundiendo debes volver a cargar tus datos. <br/> <br/>
                <span className="text-gray-400 dark:text-gray-300"> ¡ Importante no olvides eliminar los registros ya enviados del CSV !</span>
              </p>
            </div>
  
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Volver
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.post(`${apiWhatsApp}/cancel-broadcast`);
                    setShowCancelModal(false);
                    setToastError("📢 Difusión cancelada.");
                  } catch (error) {
                    console.error("Error al cancelar difusión:", error);
                    setToastError("❌ Error al cancelar difusión.");
                  }
                }}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                Finalizar Difusión
              </button>
            </div> 
          </div>
      </Modal>
    </>
  );
}
