import { toast } from "react-hot-toast";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/inputs";
import { useState,useEffect } from "react";
import { LoadingMessages } from '@/components/ui/loadings';

const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

const WhatPanelClient: any = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [totalMessagesSent, setTotalMessagesSent] = useState<number | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [eventList, setEventList] = useState<string[]>([]);
  const [selectedEventName, setSelectedEventName] = useState<string | null>(null); // nuevo estado

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
        toast.error('❌ Por favor, sube un archivo CSV.');
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
      toast.success('Envio de mensajes exitoso');

      router.refresh();
      reset(); // esto limpia el form pero ya no afecta el evento seleccionado
      setIsBroadcasting(false);
    } catch (error: any) {
      toast.error('¡Oops! Algo salió mal.');
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
      toast.error("Por favor escribe un nombre para el evento.");
      return;
    }

    try {
      const response = await axios.post(`${authUrl}/api/messages/create`, {
        eventName: newEventName,
      });

      const createdEvent = response.data.eventName;
      toast.success("✅ Evento creado exitosamente");

      setEventList(prev => [...prev, createdEvent]);
      setNewEventName('');
    } catch (error) {
      console.error("Error al crear el evento:", error);
      toast.error("Error al crear el evento");
    }
  };

  const saveEventStats = async (eventName: string, total: number) => {
    try {
      await axios.post(`${authUrl}/api/message-stats/all`, {
        eventName,
        totalMessagesSent: total
      });
      toast.success("📊 Estadísticas guardadas correctamente");
    } catch (error) {
      console.error("Error al guardar estadísticas:", error);
      toast.error("❌ No se pudieron guardar las estadísticas del evento");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${authUrl}/api/messages/events`);
      const eventsFromDb = response.data.map((e: any) => e.eventName);
      setEventList(eventsFromDb);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      toast.error("❌ No se pudieron cargar los eventos");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="grid grid-cols-1 pt-6 xl:gap-4 justify-center dark:bg-gray-900">
      {loading && (
        <div className="flex flex-col gap-4 fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <LoadingMessages />
          <button
            className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onClick={cancelBroadcast}
          >
            Cancelar Difusión
          </button>
        </div>
      )}

      <div className="col">
        <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold dark:text-white">Personaliza tu campaña</h3>
          <form onSubmit={handleSubmit(onSubmitGenreal)} encType="multipart/form-data">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Mensaje
                </label>
                <textarea
                  rows={12}
                  id="message"
                  {...register('message')}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
                  placeholder="Redacta el mensaje ideal para tu campaña"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Carga tu archivo multimedia
                </label>
                <ImageUpload
                  onChange={(value) => setCustomValue('urlMedia', value)}
                  value={urlMedia || undefined}
                />
              </div>

              <div className="col-span-6 sm:col-span-3 space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Nombre del Evento</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    placeholder="Escribe el nombre del evento"
                    className="flex-1 shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={createMessageEvent}
                    className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    +
                  </button>
                </div>

                <select
                  id="activity"
                  {...register('activity')}
                  onChange={(e) => {
                    setValue('activity', e.target.value);
                    setSelectedEventName(e.target.value); // guarda el evento actual
                  }}
                  className="mt-2 shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="" disabled hidden>Seleccionar Evento</option>
                  {eventList.map((event, index) => (
                    <option key={index} value={event}>{event}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Carga tus usuarios receptores
                </label>
                <input
                  type="file"
                  id="csvFile"
                  {...register('csvFile')}
                  accept=".csv"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="col-span-6 sm:col-full flex flex-col items-center space-y-4">
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Enviar
                  </button>
                  <button
                    type="button"
                    onClick={cancelBroadcast}
                    className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Cancelar Difusión
                  </button>
                </div>

                {totalMessagesSent !== undefined && (
                  <div className="bg-cyan-600 text-white p-4 rounded-lg shadow-md w-full max-w-md text-center">
                    <p className="text-lg font-semibold">
                      Total de mensajes enviados: <strong>{totalMessagesSent}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhatPanelClient;