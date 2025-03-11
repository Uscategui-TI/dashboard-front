import { toast } from "react-hot-toast";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LoadingMessages } from '@/components/ui/loadings';

const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

const WhatPanelClient = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  const { register, handleSubmit, reset } = useForm<FieldValues>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${authUrl}/api/messages/total/all`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const onSubmitGeneral = async (formData: any) => {
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('csvFile', formData.csvFile[0]);
      formDataToSend.append('message', formData.message);
      
      await axios.post(`${apiWhatsApp}/upload`, formDataToSend);
      toast.success('Envio de mensajes exitoso');
      
      await axios.post(`${authUrl}/api/messages/add`, {
        eventName: formData.eventName,
        messageCount: formData.csvFile.length
      });
      
      fetchEvents();
      reset();
    } catch (error) {
      toast.error('¡Oops! Algo salió mal.');
    } finally {
      setLoading(false);
    }
  };

  const cancelBroadcast = async () => {
    try {
      await axios.post(`${apiWhatsApp}/cancel-broadcast`);
      toast.success('Difusión cancelada');
    } catch (error) {
      toast.error('Error al cancelar la difusión');
    }
  };

  return (
    <div className="grid grid-cols-1 pt-6 xl:gap-4 justify-center dark:bg-gray-900">
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-50">
          <LoadingMessages />
          <button 
            className="mt-4 text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onClick={cancelBroadcast}>
            Cancelar Difusión
          </button>
        </div>
      )}

      <div className="mb-4 col-span-full xl:mb-2">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">Panel de WhatsApp</h1>
      </div>

      <div className="col">
        <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold dark:text-white">Personaliza tu campaña</h3>
          <form onSubmit={handleSubmit(onSubmitGeneral)} encType="multipart/form-data">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre del Evento</label>
                <input 
                  type="text" 
                  {...register('eventName', { required: true })} 
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                  required />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cargar Archivo CSV</label>
                <input 
                  type="file" 
                  {...register('csvFile')} 
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                  accept=".csv" required />
              </div>
              <div className="col-span-6 sm:col-full">
                <button className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-primary-800" type="submit">
                  Enviar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="col">
        <div className="p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold dark:text-white">Eventos Recientes</h3>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Evento</th>
                <th scope="col" className="px-6 py-3">Mensajes Enviados</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event: { eventName: string; messageCount: number }) => (
                  <tr key={event.eventName} className="border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4">{event.eventName}</td>
                    <td className="px-6 py-4">{event.messageCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay eventos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WhatPanelClient;
