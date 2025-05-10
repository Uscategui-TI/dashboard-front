"use client";

import Badge from "../../shared/ui/badge/Badge";
import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import Button from "../../shared/ui/button/Button";
import { Modal } from "@/components/shared/ui/modal";
import { GenericTable } from "@/components/shared/tables/GenericTable";
import Pagination from "@/components/shared/tables/Pagination";

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

const initialForm = {
  documento: "",
  asunto: "",
  mensaje: "",
  categoria: "",
  prioridad: "PENDIENTE",
  comentario: "",
};

const getEstadoVariant = (
  estado: string
): "success" | "warning" | "info" | "light" | "dark" | "primary" | "error" => {
  switch (estado.toUpperCase()) {
    case "EN_PROCESO":
      return "info"; 
    case "PENDIENTE":
      return "warning";
    case "RECHAZADA":
      return "error"; 
    case "APROBADO":
      return "success"; 
    case "PAUSADOS":
      return "dark"; 
    case "FINALIZADOS":
      return "primary"; 
    default:
      return "light"; 
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

export default function RecentOrders() {
  const [data, setData] = useState<EventStat[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");

  

  const [selectedSolicitud, setSelectedSolicitud] = useState<EventStat | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");

  useEffect(() => {
    fetchData();
  }, [page, size, searchTerm]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/all`, {
        params: { page, size, search: searchTerm }
      });
  
      setData(response.data.content);   
      setTotalPages(response.data.totalPages);  
    } catch (error) {
      console.error("Error al cargar las solicitudes:", error);
    }
  };

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
  
  const handleCreate = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/crear-solicitud`, form);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      console.error("Error creando solicitud:", error);
    } finally {
      setShowCrearModal(false)
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">  
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Lista de Solicitudes
        </h3>

        <div className="flex items-center gap-3">
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
          data={data}
          searchableColumns={['codigoSolicitud']}
          onSearchChange={(value) => {
            setPage(0); 
            setSearchTerm(value); 
          }}
          actions={(row) => (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
                Editar
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(row.id)}>
                Eliminar
              </Button>
            </div>
          )}
        />
      </div>

      <Pagination key={page} currentPage={page} onPageChange={setPage} totalPages={totalPages}/>

      {/* Modal Actualizar Solicitud */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} className="max-w-[700px] p-6 lg:p-10">
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Editar Solicitud
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Actualiza la información de la solicitud para llevar la tazabilidad de los prospectos
            </p>
          </div>

          <div>
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
          </div>

          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={() => setShowModal(false)}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Volver
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Guardar
            </button>
          </div> 
        </div>
      </Modal>
          
      {/* Modal Crear Solicitud */}
      <Modal isOpen={showCrearModal} onClose={() => setShowCrearModal(false)} className="max-w-[700px] p-6 lg:p-10">
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Crear Solicitud
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Digita la información de la solicitud para llevar la tazabilidad de los prospectos
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Documento del Prospecto</label>
              <input
                name="documento"
                value={form.documento}
                onChange={handleChange}
                placeholder="Número de documento"
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Asunto</label>
              <input
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                placeholder="Título o asunto de la solicitud"
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Mensaje</label>
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción detallada"
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Categoría</label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="">Selecciona una categoría</option>
                <option value="INFORMATIVA">Informativa</option>
                <option value="PETICION">Petición</option>
                <option value="CONSTRUCCION">Construcción</option>
                <option value="PROPUESTA">Propuesta</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Prioridad</label>
              <select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="">Selecciona una prioridad</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={() => setShowCrearModal(false)}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Volver
            </button>
            <button
              onClick={handleCreate}
              type="button"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Guardar
            </button>
          </div> 
        </div>
      </Modal>
    </div>
  );
}
