"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import axios from "axios";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("🎉 ¡Feliz cumpleaños! Que tengas un día lleno de alegría. 🎂");
  const [imageUrl, setImageUrl] = useState("");
  const [data, setData] = useState<Prospect[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const fetchData = async () => {
    try {
      const [birthdaysRes, gendersRes, deptRes, muniRes, communesRes] =
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
    const validProspects = filteredData
      .map((p) => ({
        name: p.name,
        number: p.phone.replace(/\D/g, ""),
      }))
      .filter((p) => /^3\d{9}$/.test(p.number));
  
    let enviados = 0;
  
    for (const prospect of validProspects) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_WHATSAPP_URL}/v1/messages`,
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

  const filteredData = data.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.document.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full overflow-x-auto p-4">
      {isModalOpen && (
        <>
          {/* Fondo oscuro */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Contenedor del modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>

              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                🎉 Personaliza tu mensaje
              </h2>

              <label className="block mb-2 text-sm text-gray-600 dark:text-gray-300">Mensaje</label>
              <textarea
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full mb-4 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              />

              <div className="mb-4">
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-300">Adjunta tu archivo multimedia (opcional)</label>
                <ImageUpload onChange={(url) => setImageUrl(url)} value={imageUrl ?? ""} />
              </div>


              <button
                onClick={async () => {
                  setIsModalOpen(false);
                  await handleSendBirthdayMessages(customMessage, imageUrl);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                Enviar mensajes
              </button>
            </div>
          </div>
        </>
      )}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Cumpleaños de Prospectos
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
          <button
            onClick={() => setSearch("")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Limpiar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border bg-blue-600 text-white hover:bg-blue-700 border-gray-300  px-4 py-2.5 text-sm font-medium  shadow  hover:text-gray-800 dark:border-blue-700 dark:bg-blue-800 dark:text-white-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Enviar felicitación de cumpleaños
          </button>
        </div>
      </div>

      <div className="min-w-[1000px]">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              {["Nombre", "Apellido", "Teléfono", "Email", "Documento", 
                "Cargo", "Fecha Nac.", "Género"].map((header, idx) => (
                <TableCell
                  key={idx}
                  isHeader
                  className="py-3 px-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredData.length === 0 ? (
              <TableRow>
                <td colSpan={8} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No hay prospectos que cumplan años en esta fecha.
                </td>
              </TableRow>
            ) : (
              filteredData.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="py-3 px-2 text-gray-700 text-theme-sm dark:text-white/90">{p.name}</TableCell>
                  <TableCell className="py-3 px-2 text-gray-700 text-theme-sm dark:text-white/90">{p.lastName}</TableCell>
                  <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.phone}</TableCell>
                  <TableCell className="py-3 px-2 text-gray-500 max-w-[200px] text-theme-sm truncate dark:text-gray-400">{p.email}</TableCell>
                  <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.document}</TableCell>
                  <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.cargo}</TableCell>
                  <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">
                    {p.birthDate ? new Date(p.birthDate).toISOString().split("T")[0] : "-"}
                  </TableCell>
                  <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.gender?.name ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
