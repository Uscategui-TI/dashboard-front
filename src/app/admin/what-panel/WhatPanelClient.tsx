import { toast } from "react-hot-toast";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/inputs";
import { useState, useEffect } from "react";
import { LoadingMessages } from '@/components/ui/loadings';

const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
const apiBackend = process.env.NEXT_PUBLIC_BACKEND_URL;

const WhatPanelClient: any = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState("");
  const [totalMessages, setTotalMessages] = useState<number | null>(null);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors: errorsGeneral } } = useForm<FieldValues>({
    defaultValues: {},
  });

  const setCustomValue = (id: any, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const urlMedia = watch('urlMedia');

  const onSubmitGenreal = async (formData: any) => {
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('csvFile', formData.csvFile[0]);
      formDataToSend.append('urlMedia', formData.urlMedia);
      formDataToSend.append('message', formData.message);
      
      await axios.post(`${apiWhatsApp}/upload`, formDataToSend);
      
      await axios.post(`${apiBackend}/api/messages/add`, {
        eventName,
        messageCount: formData.csvFile.length // Ajustar según la cantidad de mensajes enviados
      });

      toast.success('Envio de mensajes exitoso');
      router.refresh();
      reset();
    } catch (error: any) {
      toast.error('¡Oops! Algo salió mal.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalMessages = async () => {
    try {
      const response = await axios.get(`${apiBackend}/api/messages/total/${eventName}`);
      setTotalMessages(response.data.totalMessages);
    } catch (error) {
      console.error("Error obteniendo el total de mensajes: ", error);
    }
  };

  return ( 
    <div className="grid grid-cols-1 pt-6 xl:gap-4 justify-center dark:bg-gray-900">
      {loading && (
        <div className="flex flex-col gap-4 fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <LoadingMessages />
        </div>
      )}
      <div className="mb-4 col-span-full xl:mb-2">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Panel de WhatsApp
        </h1>
      </div>
      <div className="col">
        <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold dark:text-white">Personaliza tu campaña</h3>
          <form onSubmit={handleSubmit(onSubmitGenreal)} encType="multipart/form-data">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre del Evento</label>
                <input 
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mensaje</label>
                <textarea 
                  rows={4}
                  id="message"
                  {...register('message', {})}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Redacta el mensaje ideal para tu campaña" 
                  required
                ></textarea>
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Carga tus usuarios receptores</label>
                <input 
                  type="file" 
                  id="csvFile" 
                  {...register('csvFile')}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                  accept=".csv"
                />
              </div>
              <div className="col-span-6">
                <button className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-primary-800" type="submit">
                  Enviar
                </button>
              </div>
            </div>
          </form>
          {eventName && (
            <div className="mt-4">
              <button onClick={fetchTotalMessages} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Ver Total de Mensajes</button>
              {totalMessages !== null && <p className="mt-2 text-lg font-semibold">Total Mensajes: {totalMessages}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatPanelClient;
