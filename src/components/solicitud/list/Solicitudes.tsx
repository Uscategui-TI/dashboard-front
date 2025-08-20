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
import ConfirmModal from "@/components/shared/ui/modal/ConfirmModal";
import { useNavigation } from "@/util";
import { FileUpload } from "@/components/form/form-elements/FileUpload";

type EventStat = {
  id: string | number;
  asunto: string;
  fechaCreacion: string;
  estado: string;
  comentario?: string;
  prospecto?: {
    document: string;
  };
  publicCode?: string | number;
  privateCode?: string | number;
  usuarioAsignadoId?: string; 
  usuarioAsignado?: {
    id: string;
    name: string;
    roles:string;
  }; 
};

const initialForm = {
  documento: "",
  asunto: "",
  mensaje: "",
  categoria: "",
  prioridad: "PENDIENTE",
  comentario: "",
  usuarioAsignadoId: '',
  fileUrl: "",
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
  { key: "publicCode", header: "Código Solicitud" },
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
  {
    key: "usuarioAsignado",
    header: "Asignado A",
    render: (row: EventStat) =>
    row.usuarioAsignado
      ? `${row.usuarioAsignado.name} (${row.usuarioAsignado.roles?.[0] || 'Sin rol'})`
      : "No asignado",
  }
  
];

const CategorySolicitudes = [
    { value: "INFORMATIVA", label: "Informativa" },
    { value: "PETICION", label: "Petición" },
    { value: "CONSTRUCCION", label: "Construcción" },
    { value: "PROPUESTA", label: "Propuesta" },
    { value: "PETICION", label: "Derecho de petición" },
    { value: "TUTELA", label: "Acción de tutela" },
    { value: "SOLICITUD", label: "Solicitud" },
    { value: "INFORMES", label: "Informes" }
];

const PrioritySolicitudes = [
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Media" },
  { value: "BAJA", label: "Baja" },
];

export default function RecentOrders() {
  const [data, setData] = useState<EventStat[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState<{ value: string; label: string }[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | number | null>(null);


  const { redirectTo } = useNavigation();
  // MODALES
  const successModal = useModal();
  const errorModal = useModal();
  const prospectModal = useModal();
  const createSolicitudModal = useModal();

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

  const handleDelete = async (id: string | number) => {
    setIdToDelete(id);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;

    try {
      const resp = await endPointBackend({ accionBD: "Delete-Solicitud", id: idToDelete });
      setSuccessMessage(resp.message);
      successModal.openModal();
      setData(prevData => prevData.filter(item => item.id !== idToDelete));
    } catch (resp: any) {
      setErrorMessage(resp.message);
      errorModal.openModal();
    } finally {
      setConfirmModalOpen(false);
      setIdToDelete(null);
    }
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


  useEffect(() => {
    endPointBackend({ accionBD: "List-Usuarios" }).then((resp) => {

      const usersArray = Object.keys(resp)
        .filter(key => !isNaN(Number(key))) 
        .sort((a, b) => Number(a) - Number(b))
        .map(key => resp[key]);

      const options = usersArray.map((user: any) => ({
        value: String(user.id), 
        label: `${user.nombreCompleto} (${user.roles?.[0] || 'Sin rol'})`,
      }));

      setUsuarios(options);
    });
  }, []);
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // pedir signed URL
      const res = await fetch("/api/s3-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      const { url } = await res.json();

      // subir el archivo a S3
      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // guardar la URL pública en el formulario
      const publicUrl = url.split("?")[0]; // quitar query params de la signed URL
      setForm((prev: any) => ({ ...prev, fileUrl: publicUrl }));

    } catch (error) {
      console.error("Error subiendo archivo:", error);
    }
  };




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
            searchableColumns={['publicCode']}
            onSearchChange={(value) => {
              setPage(0); 
              setSearchTerm(value); 
            }}
            actions={(row) => (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => redirectTo(`/solicitud/${row.privateCode}`)}>Administrar</Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(row.id)}>Eliminar</Button>
              </div>
            )}
          />
        </div>
        <Pagination key={page} currentPage={page} onPageChange={setPage} totalPages={totalPages}/>

        
        {/* MODAL CREAR SOLICITUD */}
        <Modal
          isOpen={createSolicitudModal.isOpen}
          onClose={createSolicitudModal.closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                Crear Solicitud
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Digita la información de la solicitud para llevar la trazabilidad de los prospectos
              </p>
            </div>

            <div className="space-y-4">
              {/* Documento */}
              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">
                  Documento del Prospecto
                </Label>
                <Input
                  name="documento"
                  placeholder="Número de documento"
                  value={form.documento}
                  onChange={handleChange}
                />
              </div>

              {/* Asunto */}
              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Asunto</Label>
                <Input
                  name="asunto"
                  placeholder="Título o asunto de la solicitud"
                  value={form.asunto}
                  onChange={handleChange}
                />
              </div>

              {/* Mensaje */}
              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Solicitud</Label>
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

              {/* Categoría */}
              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Categoría</Label>
                <Select
                  name="categoria"
                  options={CategorySolicitudes}
                  value={form.categoria}
                  onChange={handleChange}
                />
              </div>

              {/* Prioridad */}
              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Prioridad</Label>
                <Select
                  name="prioridad"
                  options={PrioritySolicitudes}
                  value={form.prioridad}
                  onChange={handleChange}
                />
              </div>

              {/* Usuario asignado */}
              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Asignar Usuario</Label>
                <Select
                  name="usuarioAsignadoId"
                  options={usuarios}
                  value={form.usuarioAsignadoId}
                  onChange={handleChange}
                />
              </div>

              {/* Archivo (usa FileUpload) */}
              <div>
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Archivo</Label>
                <FileUpload
                  onChange={(url) =>
                    setForm((prev) => ({
                      ...prev,
                      fileUrl: url, // 👈 guardamos la URL en el form
                    }))
                  }
                />
                {form.fileUrl && (
                  <p className="mt-2 text-xs text-green-600">
                    Archivo cargado:{" "}
                    <a href={form.fileUrl} target="_blank" className="underline">
                      {form.fileUrl}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Botones */}
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

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setIdToDelete(null);
        }}
        onConfirm={confirmDelete}
        message="¿Estás seguro que deseas eliminar esta solicitud?"
      />
    </>
  );
}
