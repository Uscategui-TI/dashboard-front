"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface Prospect {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  document: string;
  address: string;
  cargo: string;
  birthDate: string;
  gender: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
  municipality: {
    id: number;
    name: string;
    department: {
      id: number;
      name: string;
    };
  };
  comune: {
    id: number;
    nameco: string;
  } | null;
  localidad: string | null;
  idEvento: number;
}

export default function ProspectTablecumpleanos() {
  const [customMessage, setCustomMessage] = useState("🎉 ¡Feliz cumpleaños! Que tengas un día lleno de alegría. 🎂");
  const [imageUrl, setImageUrl] = useState("");
  const [data, setData] = useState<Prospect[]>([]);

  const { isOpen, openModal, closeModal } = useModal();
  

  const fetchData = async () => {
    try {
      const [birthdaysRes ] =
        await Promise.all([
          axios.get<Prospect[]>(
            `${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/birthdays/today`
          ),
          axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/gender/all`),
          axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/departments/all`),
          axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/municipalities/all`),
          axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/communes/all`),
        ]);

      setData(birthdaysRes.data);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };
  
  const handleSendBirthdayMessages = async (mensaje: string, image?: string) => {
    const validProspects = data
      .map((p) => ({
        name: p.name,
        number: p.phone.replace(/\D/g, ""),
      }))
      .filter((p) => /^3\d{9}$/.test(p.number));
  
    let enviados = 0;
  
    for (const prospect of validProspects) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_WHATSAPP_URL}/broadcast-direct`,
          {
            number: `57${prospect.number}`,
            message: mensaje.replace("{nombre}", prospect.name),
            ...(image ? { urlMedia: image } : {}),
          },
          { timeout: 10000 }
        );
  
        if (response.status === 200) {
          enviados++;
          console.log(`✅ Enviado a: 57${prospect.number}`);
        }
  
        await new Promise((r) => setTimeout(r, 3000));
      } catch (error) {
        console.error(`❌ Error con 57${prospect.number}:`, error);
      }
    }
  
    alert(`🎉 Mensajes enviados: ${enviados}`);
  };

  useEffect(() => {
    fetchData(); // Cargar cumpleaños de hoy por defecto
  }, []);


  return (
    <>
      <div className="w-full h-full overflow-x-auto">
        <div className="max-w-md h-full w-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            🎉 Cumpleañeros del Día
          </h2>

          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-49 overflow-y-auto custom-scrollbar">
            {data.length === 0 ? (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                😔 No hay cumpleañeros el día de hoy.
              </div>
            ) : (
              data.map((p) => {
                const birthDate = new Date(p.birthDate);
                const age = new Date().getFullYear() - birthDate.getFullYear();
                const formattedDate = birthDate.toISOString().split("T")[0];

                return (
                  <li key={p.id} className="py-3">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {p.name} {p.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{p.cargo}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      🎂 {formattedDate} · {age} años
                    </p>
                  </li>
                );
              })
            )}
          </ul>

          <button
            onClick={() => openModal()}
            disabled={data.length === 0}
            className={`w-full px-4 py-2 mt-2 rounded-lg text-white text-sm font-semibold transition ${
              data.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-pink-500 hover:bg-pink-600"
            }`}
          >
            🎈 Felicitar a Todos
          </button>

          <div className="text-sm text-center text-gray-500 dark:text-gray-400">
            ¡Hazles saber que los recuerdas!
          </div>
        </div>
      </div>
    
      <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                Envia tus Felicitaciones
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Puedes enviar felicitaciones a todos tus prospectos redactales un mensaje
                y puedes agregar una imagen para este dia especial.
              </p>
            </div>
  
            <div className="flex flex-col gap-4 mt-4">
                <label className="block text-sm text-gray-600 dark:text-gray-300">Personaliza tu Mensaje</label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />

                <div className="mb-4">
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-300">Adjunta tu archivo multimedia (opcional)</label>
                  <ImageUpload onChange={(url) => setImageUrl(url)} value={imageUrl ?? ""} />
                </div>
            </div>
  
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Volver
              </button>
              <button
                onClick={async () => {
                  closeModal()
                  await handleSendBirthdayMessages(customMessage, imageUrl);
                }}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
              Enviar Mensajes
              </button>
            </div> 
          </div>
      </Modal>
    </>
  );
}
