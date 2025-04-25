"use client";

import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import axios from "axios";
import GenericTable from "../tables/GenericTable";
import Button from "../ui/button/Button";

type EventStat = {
  id: string | number;
  asunto: string;
  fechaCreacion: string;
  estado: string;
  comentario?: string;
  prospecto?: {
    document: string;
  };
};

export default function RecentOrders() {
  const [data, setData] = useState<EventStat[]>([]);
  const [search, setSearch] = useState("");

  const [selectedSolicitud, setSelectedSolicitud] = useState<EventStat | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/all`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error al cargar las estadísticas:", error);
    }
  };

  const filteredData = data.filter((event) =>
    event.asunto.toLowerCase().includes(search.toLowerCase())
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
              <Button size="sm" onClick={() => console.log("Eliminar", row.id)}>
                Eliminar
              </Button>
            </div>
          )}
        />
      </div>

      {/* Modal */}
      {showModal && selectedSolicitud && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Editar Solicitud
            </h2>

            {/* SELECT PARA ESTADO */}
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

            {/* TEXTAREA PARA NUEVO COMENTARIO */}
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

            {/* HISTORIAL DE COMENTARIOS */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-700 dark:text-gray-300">
                Historial de Comentarios
              </label>
              <div className="border rounded p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 overflow-y-auto max-h-40">
                {(selectedSolicitud?.comentario || "").split("\n").map((coment, index) => (
                  <p key={index} className="text-sm">{coment}</p>
                ))}
              </div>
            </div>

            {/* BOTONES DEL MODAL */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
