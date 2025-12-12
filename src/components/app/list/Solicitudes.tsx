"use client";

import { useEffect, useState } from "react";
import Button from "../../shared/ui/button/Button";
import Badge from "../../shared/ui/badge/Badge";
import { Modal } from "@/components/shared/ui/modal";
import { GenericTable } from "@/components/shared/tables/GenericTable";
import Pagination from "@/components/shared/tables/Pagination";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { endPointBackend } from "@/api";
import axios from "axios";
import { useRouter } from "next/navigation";

type Respuesta = {
  id: number;
  texto: string | null;
  fecha: string;
  autor: string;
};

type Solicitud = {
  id: number;
  asunto: string;
  descripcion: string;
  localidad: string;
  fotoUrl: string | null;
  estado: string;
  fechaCreacion: string;
  respuestas: Respuesta[];
};

export default function RecentOrdersApp() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [respuestaText, setRespuestaText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  const getEstadoVariant = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "EN_PROCESO": return "info";
      case "PENDIENTE": return "warning";
      case "RECHAZADA": return "error";
      case "APROBADO": return "success";
      case "PAUSADOS": return "dark";
      case "FINALIZADOS": return "primary";
      default: return "light";
    }
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "asunto", header: "Asunto" },
    { key: "estado", header: "Estado", render: (row: Solicitud) => <Badge color={getEstadoVariant(row.estado)}>{row.estado}</Badge> },
    { key: "fechaCreacion", header: "Fecha", render: (row: Solicitud) => new Date(row.fechaCreacion).toLocaleDateString() },
    {
      key: "acciones",
      header: "Acciones",
      render: (row: Solicitud) => (
       <Button
        size="sm"
        variant="outline"
        onClick={() => router.push(`/detalle-peticion/${row.id}`)}
      >
        Detalle
      </Button>
      )
    }
  ];

  useEffect(() => {
    fetchSolicitudes();
  }, [page, size]);

  // const fetchSolicitudes = async () => {
  //   try {
  //     const resp = await endPointBackend({ accionBD: "List-Solictudes", params: { page, size } });
  //     setSolicitudes(resp.data.content);
  //     setTotalPages(resp.data.totalPages);
  //   } catch (err) {
  //     console.error("Error cargando solicitudes:", err);
  //   }
  // };

const fetchSolicitudes = async () => {
  try {
    const resp = await axios.get<Solicitud[]>(
      "https://auth-service-qa.up.railway.app/app/solicitudes/list", // endpoint real de tu backend
      {
        params: {
          page,   // número de página
          size,   // tamaño de página
        },
        headers: {
          // si necesitas autenticación con JWT:
          // Authorization: `Bearer ${token}`,
        },
      }
    );

    // Dependiendo de cómo tu backend responda, ajusta estas líneas
    setSolicitudes(resp.data); // si resp.data tiene .content o es directamente el array
    // setTotalPages(resp.data.totalPages || 1);       // si tu backend envía totalPages
  } catch (err) {
    console.error("Error cargando solicitudes:", err);
  }
};


  const openDetalleModal = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setRespuestaText("");
    setModalOpen(true);
  };

  const handleAgregarRespuesta = async () => {
    if (!selectedSolicitud) return;
    try {
      await endPointBackend({
        accionBD: "Agregar-Respuesta",
        body: { solicitudId: selectedSolicitud.id, texto: respuestaText }
      });
      // Actualizar la solicitud localmente
      setSelectedSolicitud({
        ...selectedSolicitud,
        respuestas: [
          ...selectedSolicitud.respuestas,
          { id: Date.now(), texto: respuestaText, fecha: new Date().toISOString(), autor: "Yo" }
        ]
      });
      setRespuestaText("");
      // refrescar lista si quieres
      fetchSolicitudes();
    } catch (err) {
      console.error("Error agregando respuesta:", err);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <GenericTable columns={columns} data={solicitudes} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* MODAL DETALLE */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-xl p-6">
        {selectedSolicitud && (
          <div>
            <h2 className="text-xl font-bold mb-2">{selectedSolicitud.asunto}</h2>
            <p>{selectedSolicitud.descripcion}</p>
            <p><strong>Localidad:</strong> {selectedSolicitud.localidad}</p>
            {selectedSolicitud.fotoUrl && (
              <img src={`https://auth-service-qa.up.railway.app${selectedSolicitud.fotoUrl}`} className="mt-2 mb-4 max-h-60 object-contain" />
            )}
            <h3 className="font-semibold mt-4 mb-1">Respuestas</h3>
            {selectedSolicitud.respuestas.length ? selectedSolicitud.respuestas.map(r => (
              <div key={r.id} className="p-2 border-b border-gray-200">
                <p>{r.texto}</p>
                <small>{r.autor} - {new Date(r.fecha).toLocaleString()}</small>
              </div>
            )) : <p>No hay respuestas</p>}

            <div className="mt-4">
              <TextArea
                name="respuesta"
                value={respuestaText}
                onChange={(e) => setRespuestaText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                rows={3}
              />
              <Button size="sm" onClick={handleAgregarRespuesta} className="mt-2 bg-blue-600 text-white hover:bg-blue-700">
                Agregar Respuesta
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
