"use client";

import Badge from "../../shared/ui/badge/Badge";
import { useEffect, useMemo, useState } from "react";
import Button from "../../shared/ui/button/Button";
import { Modal } from "@/components/shared/ui/modal";
import { GenericTable } from "@/components/shared/tables/GenericTable";
import Pagination from "@/components/shared/tables/Pagination";
import { endPointBackend } from "@/api";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import AlertModal from "@/components/shared/ui/modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import PersonFormPage from "@/components/prospect/forms/CreateProspect.form";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

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

const CategorySolicitudes = [
    { value: "INFORMATIVA", label: "Informativa" },
    { value: "PETICION", label: "Petición" },
    { value: "CONSTRUCCION", label: "Construcción" },
    { value: "PROPUESTA", label: "Propuesta" },
];

const PrioritySolicitudes = [
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Media" },
  { value: "BAJA", label: "Baja" },
];

const StatusSolicitudes = [
    { value: "", label: "Seleccione" },
    { value: "EN_PROCESO", label: "En Proceso" },
    { value: "RECHAZADA", label: "Rechazada" },
    { value: "PAUSADOS", label: "Pausada" },
    { value: "FINALIZADOS", label: "Finalizada" },
];

export default function RecentOrders() {
  const [data, setData] = useState<EventStat[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSolicitud, setSelectedSolicitud] = useState<EventStat | null>(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");

  // MODALES
  const successModal = useModal();
  const errorModal = useModal();
  const prospectModal = useModal();
  const createSolicitudModal = useModal();
  const updateSolicitudModal = useModal();

  // MENSAJES ALERTS
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');


  useEffect(() => {
    endPointBackend({ accionBD: "List-Solictudes", params: { page, size, search: searchTerm } })
    .then((resp) => {
        setData(resp.data.content);
        setTotalPages(resp.data.totalPages);
    })
  }, [page, size, searchTerm]);

  const handleEdit = (row: EventStat) => {
    setSelectedSolicitud(row);
    setNuevoEstado(row.estado);
    setNuevoComentario("");
    updateSolicitudModal.openModal()
  };

  const handleUpdate = async () => {
    if (!selectedSolicitud) return;

    endPointBackend({ 
      accionBD: "Update-Solicitud", 
      id: selectedSolicitud.id, 
      body: {
        estado: nuevoEstado,
        comentario: nuevoComentario,
      } 
    })
    .then((resp) => {
      updateSolicitudModal.closeModal()
      setSuccessMessage(resp.message)
      successModal.openModal()
      setData(prevData => 
        prevData.map(item => 
          item.id === selectedSolicitud.id 
            ? { ...item, estado: nuevoEstado, comentario: nuevoComentario } 
            : item
        )
      );
      setSelectedSolicitud(null);
    })
  };

  const handleDelete = async (id: string | number) => {
    const confirmacion = window.confirm("¿Estás seguro que deseas eliminar esta solicitud?");
    if (!confirmacion) return;
    
    endPointBackend({ accionBD: "Delete-Solicitud", id: id })
    .then((resp) => {
      setSuccessMessage(resp.message)
      successModal.openModal()

      setData(prevData => prevData.filter(item => item.id !== id));
    })
    .catch((resp) => {
      setErrorMessage(resp.message)
      errorModal.openModal()
    })
  };
  
  const handleCreate = async () => {
    endPointBackend({ accionBD: "Create-Solicitud", body: form })
    .then((resp) => {
      switch (resp.status) {
        case 'OK': {   
          setForm(initialForm);
          setData(prev => [resp.data, ...prev]);
          setSuccessMessage(resp.message)
          successModal.openModal()
          break
        }
        case 400: { 
          setForm(initialForm);
          setErrorMessage(resp.message)
          errorModal.openModal()
          break
        }
      }
    })
    .finally(() => {
      createSolicitudModal.closeModal()
    })
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const filteredOptions = useMemo(() => {
  return nuevoEstado === "PENDIENTE"
    ? StatusSolicitudes.filter(opt => opt.value !== "FINALIZADOS")
    : StatusSolicitudes;
}, [nuevoEstado]);


  return (
    <>
      <PageBreadcrumb pageTitle="Listar Solicitudes"/>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">  
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div></div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={prospectModal.openModal}>
              Agregar Prospecto
            </Button>
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={createSolicitudModal.openModal}>
              Crear Solicitud
            </Button>
          </div>
        </div>

        {/* SECTION: TABLA DE SOLICITUDES */}
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
                <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>Editar</Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(row.id)}>Eliminar</Button>
              </div>
            )}
          />
        </div>
        <Pagination key={page} currentPage={page} onPageChange={setPage} totalPages={totalPages}/>

        {/* MODAL CREAR SOLICITUD */}
        <Modal isOpen={createSolicitudModal.isOpen} onClose={createSolicitudModal.closeModal} className="max-w-[700px] p-6 lg:p-10">
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
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Documento del Prospecto</Label>
                <Input name="documento" placeholder="Número de documento" value={form.documento} onChange={handleChange}/>
              </div>

              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Asunto</Label>
                <Input name="asunto" placeholder="Título o asunto de la solicitud" value={form.asunto} onChange={handleChange}/>
              </div>

              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Mensaje</Label>
                <TextArea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  rows={3}
                  error
                  placeholder="Descripción detallada"
                  hint="El texto no debe ser mayor a 400 caracteres"
                />
              </div>

              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Categoría</Label>
                <Select name="categoria" options={CategorySolicitudes} value={form.categoria} onChange={handleChange}/>
              </div>

              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Prioridad</Label>
                <Select name="prioridad" options={PrioritySolicitudes} value={form.prioridad} onChange={handleChange}/>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={createSolicitudModal.closeModal}
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
                Crear
              </button>
            </div> 
          </div>
        </Modal>

        {/* MODAL ACTUALIZAR SOLICITUD */}
        <Modal isOpen={updateSolicitudModal.isOpen} onClose={updateSolicitudModal.closeModal} className="max-w-[700px] p-6 lg:p-10">
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
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Estado</Label>
                <Select options={filteredOptions} value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}/>
              </div>

              <div className="mb-4">
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Nuevo Comentario</Label>
                <TextArea
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  rows={4}
                  error
                  placeholder="Descripción detallada"
                  hint="El texto no debe ser mayor a 400 caracteres"
                />
              </div>


              <div className="mb-4">
                <Label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Historial de Comentarios</Label>
                <div className="appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 flex flex-col gap-5 max-h-[230px] overflow-y-auto">
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
                onClick={updateSolicitudModal.closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Volver
              </button>
              <button
                onClick={handleUpdate}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                Guardar
              </button>
            </div> 
          </div>
        </Modal>
            
        {/* MODAL CREAR PROSPECTO  */}
        <Modal isOpen={prospectModal.isOpen} onClose={prospectModal.closeModal} className="max-w-[1100px] p-6 lg:p-10">
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div className="mb-3">
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                Creación de Prospectos
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Agrega tus prospectos es importante que puedas adjuntar toda la infromación para mejorar las metricas
              </p>
            </div>
  
            <PersonFormPage closeModal={prospectModal.closeModal} />
          </div>
        </Modal>
      </div>
      
      <AlertModal
        isOpen={successModal.isOpen}
        onClose={successModal.closeModal}
        title="Operación Exitosa"
        description={successMessage}
        colorClass="success"
        time={3000}
      />

      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={errorModal.closeModal}
        title="Operación Fallida"
        description={errorMessage}
        colorClass="error"
        time={4000}
      />
    </>
  );
}
