"use client"

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ChevronDownIcon, PlusIcon } from "@/icons";
import { Controller,FieldValues, useForm } from "react-hook-form";
import axios from "axios";




// import { Metadata } from "next";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import PhoneInput from "@/components/form/group-input/PhoneInput";


// export const metadata: Metadata = {
//   title:
//     "Uscategui Panel",
//   description: "Gestiona, organiza y parametriza actividades",
// };

const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function WhatPanelPage() {
    const [messageTwo, setMessageTwo] = useState("");
    const [isOpenConect, setIsOpenConect] = useState(false);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          console.log("Selected file:", file.name);
        }
    };

    const options = [
      { value: "marketing", label: "Marketing" },
      { value: "template", label: "Template" },
      { value: "development", label: "Development" },
    ];
      
    const handleSelectChange = (value: string) => {
      console.log("Selected value:", value);
    };

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [totalMessagesSent, setTotalMessagesSent] = useState<number | null>(null);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [eventList, setEventList] = useState<string[]>([]);
    const [selectedEventName, setSelectedEventName] = useState<string | null>(null); // nuevo estado
    const [phoneNumber, setPhoneNumber] = useState("");
    const [linkToken, setLinkToken] = useState("");
    const [isRestartDisabled, setIsRestartDisabled] = useState(true);
    const [countdown, setCountdown] = useState(30);
    

  
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      reset,
      formState: { errors: errorsGeneral }
    } = useForm<FieldValues>({ defaultValues: {} });
  
    const setCustomValue = (id: any, value: any) => {
      setValue(id, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    };
  
    const urlMedia = watch('urlMedia');
  
    const onSubmitGenreal = async (formData: any) => {
      try {
        setLoading(true);
        setIsBroadcasting(true);
  
        if (!formData.csvFile || formData.csvFile.length === 0) {
          // toast.error('❌ Por favor, sube un archivo CSV.');
          setIsBroadcasting(false);
          setLoading(false);
          return;
        }
  
        const formDataToSend = new FormData();
        formDataToSend.append('csvFile', formData.csvFile[0]);
        if (formData.urlMedia) {
          formDataToSend.append('urlMedia', formData.urlMedia);
        }
        formDataToSend.append('message', formData.message);
  
        await axios.post(`${apiWhatsApp}/upload`, formDataToSend);
        // toast.success('Envio de mensajes exitoso');
  
        router.refresh();
        reset(); // esto limpia el form pero ya no afecta el evento seleccionado
        setIsBroadcasting(false);
      } catch (error: any) {
        // toast.error('¡Oops! Algo salió mal.');
      } finally {
        setLoading(false);
      }
    };
  
    const cancelBroadcast = async () => {
      try {
        const response = await axios.post(`${apiWhatsApp}/cancel-broadcast`);
        console.log(response.data);
        alert('Difusión cancelada');
      } catch (error) {
        console.error('Error al cancelar la difusión:', error);
      }
    };
  
    useEffect(() => {
      if (!isBroadcasting) return;
  
      const fetchTotalMessagesSent = async () => {
        try {
          const response = await axios.get(`${apiWhatsApp}/v1/total-messages-sent`);
          setTotalMessagesSent(response.data.totalMessagesSent + 1);
        } catch (error) {
          console.error('Error al obtener el total de mensajes enviados:', error);
        }
      };
  
      fetchTotalMessagesSent();
      const interval = setInterval(fetchTotalMessagesSent, 5000);
      return () => clearInterval(interval);
    }, [isBroadcasting]);
  
    // Nuevo useEffect para guardar estadísticas al finalizar difusión
    useEffect(() => {
      if (!isBroadcasting && selectedEventName && totalMessagesSent !== null) {
        saveEventStats(selectedEventName, totalMessagesSent);
        setTotalMessagesSent(null); // Evita duplicación
      }
    }, [isBroadcasting, totalMessagesSent]);
  
    const createMessageEvent = async () => {
      if (!newEventName.trim()) {
        // toast.error("Por favor escribe un nombre para el evento.");
        return;
      }
  
      try {
        const response = await axios.post(`${authUrl}/api/messages/create`, {
          eventName: newEventName,
        });
  
        const createdEvent = response.data.eventName;
        // toast.success("✅ Evento creado exitosamente");
  
        setEventList(prev => [...prev, createdEvent]);
        setNewEventName('');
      } catch (error) {
        console.error("Error al crear el evento:", error);
        // toast.error("Error al crear el evento");
      }
    };
  
    const saveEventStats = async (eventName: string, total: number) => {
      try {
        await axios.post(`${authUrl}/api/message-stats/all`, {
          eventName,
          totalMessagesSent: total
        });
        // toast.success("📊 Estadísticas guardadas correctamente");
      } catch (error) {
        console.error("Error al guardar estadísticas:", error);
        // toast.error("❌ No se pudieron guardar las estadísticas del evento");
      }
    };
  
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${authUrl}/api/messages/events`);
        const eventsFromDb = response.data.map((e: any) => e.eventName);
        setEventList(eventsFromDb);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
        // toast.error("❌ No se pudieron cargar los eventos");
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
        const response = await axios.post(`${apiWhatsApp}/set-phone-number`, 
          { phoneNumber }, 
          { headers: { "Content-Type": "application/json" } }
        );
    
        console.log("Respuesta del servidor:", response.data);
    
        if (response.data.message) alert(response.data.message);
        if (response.data.token) {
          setLinkToken(response.data.token);
          console.log("Token recibido:", response.data.token);
        }
    
        // Temporizador
        setIsRestartDisabled(true);
        setCountdown(30);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsRestartDisabled(false);
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error) {
        console.error("Error al enviar el número:", error);
        alert("Hubo un error al guardar el número.");
      }
    };

    const handleRestart = async () => {
      try {
        const response = await axios.post(`${apiWhatsApp}/restart-bot`, {}, {
          headers: { "Content-Type": "application/json" }
        });
        console.log("Reinicio solicitado:", response.data);
        alert("El bot se está reiniciando...");
      } catch (error) {
        console.error("Error al reiniciar el bot:", error);
        alert("Error al intentar reiniciar el bot.");
      }
    };

    

  return (
  
    <>
      <div>
        <PageBreadcrumb pageTitle="WhatsApp Panel" />
        <div className="min-h-screen rounded-2xl border flex flex-col gap-6 border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <div className="mx-auto w-full max-w-[630px] text-center">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Personaliza tu difusión
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
              Bienvenido al panel de difusión masiva en el cual podras realizar campañas por medio de WhatsApp
            </p>
          </div>
          <div>
          <form onSubmit={handleSubmit(onSubmitGenreal)} encType="multipart/form-data">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <div>
                    <Label>Redacta tu mensaje</Label>
                    <textarea
                  rows={12}
                  id="message"
                  {...register('message')}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
                  placeholder="Redacta el mensaje ideal para tu campaña"
                  required
                />
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label>Adjunta tu archivo multimedia</Label>
                  <ImageUpload
                    onChange={(value) => setCustomValue('urlMedia', value)}
                    value={urlMedia || undefined}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3 space-y-2">
                  <Label>Selecciona tu evento</Label>
                  <div className="relative">
                    <Select
                      options={eventList.map((e) => ({ value: e, label: e }))}
                      placeholder="Selecciona un evento"
                      onChange={(value) => {
                        setSelectedEventName(value);
                        setValue('eventName', value);
                      }}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label>Adjunta tu listado de difusión</Label>
                  <FileInput  onChange={(e) => setCustomValue('csvFile', e.target.files)} className="custom-class" />
                </div>
                {/* CONTENEDOR DE CREACIÓN DE EVENTO */}
                <div className="w-full max-w-sm mx-auto mb-6">
                    <Label className="mb-1 block">Crear nuevo evento</Label>
                    <div className="flex items-center space-x-3">
                      <input
                        value={newEventName}
                        onChange={(e) => setNewEventName(e.target.value)}
                        placeholder="Nombre del evento"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                      />
                      <Button
                        onClick={createMessageEvent}
                        variant="primary"
                        size="sm"
                        className="w-11 h-10 flex items-center justify-center rounded-md p-0"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                <div className="col-span-6 sm:col-full flex flex-col space-y-6">
                  <div className="flex space-x-4">
                   <Button  size="sm" variant="primary" onClick={() => setIsOpenConect(false)}> 
                      Vincular 
                    </Button>
                  <Button size="sm" variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Difusión'}
                  </Button>
                    <Button  size="sm" variant="primary" onClick={cancelBroadcast}>   
                      Cancelar Difusión
                    </Button>
                  </div>
                  {/* 
                  {totalMessagesSent !== undefined && (
                    <div className="bg-cyan-600 text-white p-4 rounded-lg shadow-md w-full max-w-md text-center">
                      <p className="text-lg font-semibold">
                        Total de mensajes enviados: <strong>{totalMessagesSent}</strong>
                      </p>
                    </div>
                  )} */}
                </div>
              </div>
            </form>
          </div>
        </div>
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
