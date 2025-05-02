"use client";

import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import axios from "axios";
import GenericTable from "../tables/GenericTable";
import Button from "../ui/button/Button";
import CrearSolicitudModal from "./FormularioSolicitudModal";

type EventStat = {
  id: string | number;
  asunto: string;
  fechaCreacion: string;
  estado: string;
  comentario?: string;
  prospecto?: {
    document: string;
  };
  codigoSolicitud?: string | number;
};

export default function RecentOrders() {
  const [data, setData] = useState<EventStat[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showCrearModal, setShowCrearModal] = useState(false);

  const [selectedSolicitud, setSelectedSolicitud] = useState<EventStat | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/all`, {
        params: { page, size }
      });
  
      setData(response.data.content);   
      setTotalPages(response.data.totalPages);  
    } catch (error) {
      console.error("Error al cargar las solicitudes:", error);
    }
  };

  const filteredData = data.filter((event) =>
    event.asunto.toLowerCase().includes(search.toLowerCase()) ||
    event.codigoSolicitud?.toString().toLowerCase().includes(search.toLowerCase())
  );

  const getEstadoVariant = (estado: string): "success" | "warning" | "error" => {
    switch (estado) {
      case "EN_PROCESO":
        return "success";
      case "PENDIENTE":
        return "warning";
      case "RECHAZADA":
        return "error";
      case "APROBADO":
        return "success";
      default:
        return "error";
    }
  };

  const columns = [
    { key: "codigoSolicitud", header: "Código Solicitud" },
    { key: "asunto", header: "Asunto" },
    {
      key: "Prospecto",
      header: "Prospecto",
      render: (row: EventStat) => row.prospecto?.document || "-",
    },
    {
      key: "fechaCreacion",
      header: "Fecha",
      render: (row: EventStat) =>
        new Date(row.fechaCreacion).toLocaleDateString(),
    },
    {
      key: "estado",
      header: "Estado",
      render: (row: EventStat) => (
        <Badge color={getEstadoVariant(row.estado)}>{row.estado}</Badge>
      ),
    },
  ];

  const handleEdit = (row: EventStat) => {
    setSelectedSolicitud(row);
    setNuevoEstado(row.estado);
    setNuevoComentario("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedSolicitud) return;
  
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/${selectedSolicitud.id}/actualizar`, {
        estado: nuevoEstado,
        comentario: nuevoComentario,
      });
  
      setShowModal(false);
      setSelectedSolicitud(null); // <-- Agregar esta línea
      fetchData(); // recargar datos
    } catch (error) {
      console.error("Error al guardar la solicitud:", error);
    }
  };
  const handleDelete = async (id: string | number) => {
    const confirmacion = window.confirm("¿Estás seguro que deseas eliminar esta solicitud?");
    if (!confirmacion) return;
  
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/${id}/eliminar`);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar la solicitud:", error);
    }
  };
  
  

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">  
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Lista de Solicitudes
        </h3>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre de evento"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
          <button
            onClick={() => setSearch("")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Limpiar
          </button>
          <Button
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowCrearModal(true)}
          >
            Crear Solicitud
          </Button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <GenericTable<EventStat>
          columns={columns}
          data={filteredData}
          actions={(row) => (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleEdit(row)}>
                Editar
              </Button>
              <Button size="sm" onClick={() => handleDelete(row.id)}>
                Eliminar
              </Button>
            </div>
          )}
        />
      </div>
      <div className="flex justify-center mt-4 gap-2 flex-wrap">
        <button onClick={() => setPage(0)} disabled={page === 0}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&laquo;</button>
        <button onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={page === 0}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&lt;</button>

        {Array.from({ length: totalPages }).map((_, index) => (
          <button key={index} onClick={() => setPage(index)}
            className={`px-3 py-1 border rounded text-sm ${page === index ? "bg-blue-500 text-white" : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200"}`}>
            {index + 1}
          </button>
        ))}

        <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))} disabled={page === totalPages - 1}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&gt;</button>
        <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&raquo;</button>
      </div>


      {/* Modal */}
      {showModal && selectedSolicitud && (
        <>
          
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-40"
            onClick={() => setShowModal(false)} 
          />

          {/* Modal centrado */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg relative transform transition-all duration-300 scale-95 hover:scale-100"
              onClick={(e) => e.stopPropagation()} 
            >

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
              >
                ✕
              </button>


              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Editar Solicitud
              </h2>


              <div className="mb-4">
                <label className="block mb-1 text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="RECHAZADA">Rechazada</option>
                  <option value="APROBADO">Aprobado</option>
                  <option value="PAUSADOS">Pausado</option>
                  <option value="FINALIZADOS">Finalizados</option>
                </select>
              </div>

  
              <div className="mb-4">
                <label className="block mb-1 text-gray-700 dark:text-gray-300">
                  Nuevo Comentario
                </label>
                <textarea
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  rows={3}
                />
              </div>


              <div className="mb-4">
                <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                  Historial de Comentarios
                </label>

                <div className="border rounded p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 overflow-y-auto max-h-40 space-y-2">
                  {(selectedSolicitud?.comentario || "")
                    .split(/\n+/) // divide por saltos de línea
                    .map((coment, index) => {
                      const texto = coment.split("]").slice(1).join("]").trim(); // quita timestamp
                      if (!texto) return null;

                      return (
                        <div
                          key={index}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm max-w-xl self-start"
                        >
                          {texto}
                        </div>
                      );
                    })}
                </div>
              </div>


              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleSave}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      <CrearSolicitudModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onSuccess={() => {
          setShowCrearModal(false);
          fetchData(); 
        }}
      />
    </div>
  );
}
