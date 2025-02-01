import { toast } from "react-hot-toast";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/inputs";
import { useState } from "react";
import { LoadingMessages } from '@/components/ui/loadings';

const WhatPanelClient: any = () => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors: errorsGeneral } } = useForm<FieldValues>({
    defaultValues: {

    },
  });

  const setCustomValue = (id: any, value: any) => {
        setValue(id, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
        })
    }

  const urlMedia = watch('urlMedia');

  const onSubmitGenreal = async (formData: any) => {
  try {
    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('csvFile', formData.csvFile[0]);
    formDataToSend.append('urlMedia', formData.urlMedia);
    formDataToSend.append('message', formData.message);
    
    await axios.post(`https://api.uscateguicol.com/upload`, formDataToSend);
    toast.success('Envio de mensajes exitoso');
    router.refresh();
    reset()
  } catch (error: any) {
    toast.error('¡Oops! Algo salió mal.');
  } finally {
    setLoading(false); 
  }
};


  return ( 
    <div className="grid grid-cols-1 pt-6 xl:gap-4 justify-center dark:bg-gray-900">
        {
            loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <LoadingMessages />
                </div>
            )
        }

        <div className="mb-4 col-span-full xl:mb-2">
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                <li className="inline-flex items-center">
                    <a href="#" className="inline-flex items-center text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white">
                    <svg className="w-5 h-5 mr-2.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                        Centro
                    </a>
                </li>
                <li>
                    <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                    <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">WhatsApp Panel</span>
                    </div>
                </li>
                </ol>
            </nav>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                Panel de WhatsApp
            </h1>
        </div>
        
        {/* <!-- Right Content --> */}
        <div className="col">
            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
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
                                {...register('message', {})}
                                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                placeholder="Redacta el mensaje ideal para tu campaña" 
                                required
                            >

                            </textarea>
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="csvFile" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                               Carga tu archivo multimedia
                            </label>
                            <ImageUpload
                                onChange={(value) => setCustomValue('urlMedia', value)}
                                value={urlMedia || ''}
                            />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Actividad</label>
                            <select 
                                id="activity" 
                                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                required
                            >
                                <option value="" selected>Seleccionar</option>
                                <option value="">Evento</option>
                                <option value="">Control de seguridad</option>
                                <option value="">Actividad ludica</option>
                            </select>
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="csvFile" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Carga tus usuarios receptores
                            </label>
                            <input 
                            type="file" 
                            id="csvFile" 
                            {...register('csvFile')}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                            accept=".csv"
                            />
                        </div>
                        <div className="col-span-6 sm:col-full">
                            <button className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-primary-800" type="submit">
                                Enviar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
   );
}
 
export default WhatPanelClient;