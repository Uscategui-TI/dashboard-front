
"use client"
// pages/solicitud/[id].tsx
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react";
import { endPointBackend } from "@/api";
import Button from "@/components/shared/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TextArea from "@/components/form/input/TextArea";
import { useModal } from "@/hooks/useModal";
import AlertModal from "@/components/shared/ui/modal/AlertModal";
import Avatar from "@/components/shared/ui/avatar/Avatar";

type Departamento = {
  id: number;
  name: string;
};

type Municipio = {
  id: number;
  name: string;
  department: Departamento;
};

type Prospecto = {
  id: number;
  name: string;
  lastName: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  cargo: string;
  municipality: Municipio;
  department: Departamento;
  canal: {
    id: number;
    nombre: string;
  };
};

type UsuarioAsignado = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
};

type Solicitud = {
  id: number;
  asunto: string;
  mensaje: string;
  estado: string;
  prioridad: string;
  fechaCreacion: string;
  comentario: string;
  publicCode: string;
  privateCode: string;
  prospecto: Prospecto;
  usuarioAsignado: UsuarioAsignado;
};

const PrioritySolicitudes = [
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Media" },
  { value: "BAJA", label: "Baja" },
];

const StatusSolicitudes = [
    { value: "EN_PROCESO", label: "En Proceso" },
    { value: "PAUSADOS", label: "Pausada" },
    { value: "FINALIZADOS", label: "Finalizada" },
];

type ComentarioItem = {
  fecha: Date;
  fechaFormateada: string;
  texto: string;
};

export const formatearComentarios = (comentario: string): ComentarioItem[] => {
  if (!comentario) return [];

  // Este regex extrae bloques como: [fecha] texto
const regex = /\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?)\]([^\[]*)/g;

  const resultado: ComentarioItem[] = [];
  let match;

  while ((match = regex.exec(comentario)) !== null) {
    const fechaStr = match[1];
    const texto = match[2].trim();

    const fechaRecortada = fechaStr.replace(/\.(\d{3})\d+/, ".$1");
    const fechaObj = new Date(fechaRecortada);

    if (!isNaN(fechaObj.getTime())) {
      const fechaFormateada = fechaObj.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      resultado.push({
        fecha: fechaObj,
        fechaFormateada,
        texto,
      });
    }
  }

  return resultado;
};

export default function SolicitudPage() {
  
  const params = useParams();
  const rawId = params?.code;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [estado, setEstado] = useState("");
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [assignedUser, setAssignedUser] = useState("");
  const [usuarios, setUsuarios] = useState<{ value: string; label: string }[]>([]);

  // MODALES
  const successModal = useModal();
  const errorModal = useModal();

  // MENSAJES ALERTS
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  

  useEffect(() => {
    if (id) {
    endPointBackend({ accionBD: "Get-Solicitud", id: id })
      .then((resp) => {
        setSolicitud(resp.data);
        setEstado(resp.data.estado);
        setAssignedUser(resp.data.usuarioAsignado.id)
      })
    }

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
  }, [id]);

  const handleUpdate = async () => {

    try {
      const resp = await endPointBackend({
        accionBD: "Update-Solicitud",
        id: solicitud?.id,
        body: {
          estado: estado,
          comentario: nuevoComentario,
          usuarioAsignadoId: assignedUser,
        }
      });

      // Cierra el modal
      // Actualiza el estado local sin recargar
      setSolicitud(prev =>
        prev
          ? {
              ...prev,
              estado: estado,
              comentario: nuevoComentario,
              usuarioAsignado: {
                ...prev.usuarioAsignado,
                id: assignedUser,
              },
            }
          : null
      );

      setNuevoComentario("");
      setSuccessMessage(resp.message);  
      successModal.openModal();
    } catch (error) {
      console.error("Error actualizando solicitud:", error);
      setErrorMessage("Ocurrió un error al actualizar la solicitud.");
      errorModal.openModal();
    }
  };

  const filteredOptions = useMemo(() => {
    return estado === "PENDIENTE"
      ? StatusSolicitudes.filter(opt => opt.value !== "FINALIZADOS")
      : StatusSolicitudes;
  }, [estado]);


  if (!solicitud) return <p>Cargando...</p>;

  return (
    <>
      <PageBreadcrumb pageTitle="Gestionar solicitud"/>
      <div>
        <div className="flex flex-col lg:flex-row gap-6 text-white">
          {/* Panel izquierdo */}
          <div className="flex-1 border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] rounded-xl p-6 shadow-md border">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl mb-4">
                Detalles de la Solicitud
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fecha de creación:{" "}
                {new Date(solicitud.fechaCreacion).toLocaleString()}
              </p>
            </div>
            <div className="space-y-3 text-gray-800 dark:text-white/90">
              <p>
                <span className="text-gray-500 dark:text-gray-400 font-semibold">Código Privado:</span><br />
                {solicitud.privateCode}{" "}
                <a
                  href={`https://dashboard.uscateguicol/consulta?code=${solicitud.privateCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline ml-2"
                >
                🔗
                </a>
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400 font-semibold">Codigo Publico:</span><br />
                {solicitud.publicCode}
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400 font-semibold">Asunto:</span><br />
                {solicitud.asunto}
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400 font-semibold">Mensaje:</span><br />
                <span className="whitespace-pre-line">{solicitud.mensaje}</span>
              </p>
            </div>

            <div className="my-6">
              <Label className="block mb-2 font-semibold text-gray-800 dark:text-white/900">Comentario</Label>
              <TextArea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                rows={5}
                error
                placeholder="Descripción detallada"
                hint="El texto no debe ser mayor a 400 caracteres"
              />
            </div>

            <div>
              <Label className="block mb-2 text-gray-700 dark:text-gray-300 font-semibold text-base">Historial de Comentarios</Label>
              <div className="text-sm text-gray-700">
                <div className="max-h-64 overflow-y-auto pr-2">
                  {formatearComentarios(solicitud.comentario)
                  .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
                  .map((comentario, index) => (
                    <div key={index} className="flex items-start space-x-3 my-4">
                      {/* Avatar */}
                      <Avatar src="/images/user/user-01.jpg" size="small" status="online"/>
                      {/* Comentario */}
                      <div>
                        <p className="text-xs text-gray-400">
                          <span className="font-medium">Fecha:</span> {comentario.fechaFormateada}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-white/70 whitespace-pre-line">
                          {comentario.texto}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Panel derecho */}
          <div className="w-full lg:w-[30%] space-y-6">
            {/* Estado y prioridad */}
            <div className="border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] rounded-xl p-6 shadow-md border ">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">Atención</h3>

              <div className="mb-4">
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Prioridad</Label>
                <Select name="prioridad" options={PrioritySolicitudes} value={solicitud.prioridad} disabled={true}/>
              </div>

              <div className="mb-4">
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Estado</Label>
                <Select options={filteredOptions} value={estado} onChange={(e) => setEstado(e.target.value)}/>
              </div>

              <div className="mb-4">
                <Label className="block mb-1 text-gray-700 dark:text-gray-300">Reasignar Usuario</Label>
                <Select 
                  name="usuarioAsignadoId"
                  options={usuarios}
                  value={assignedUser}
                  onChange={(e) => setAssignedUser(e.target.value)}
                />
              </div>
            </div>

            {/* Prospecto */}
            <div className="border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] rounded-xl p-6 shadow-md border ">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">
                Prospecto
              </h3>
              <p className="mb-1 text-gray-500 dark:text-gray-400">
                <strong className="text-gray-800 dark:text-white/90">Nombre:</strong> {solicitud.prospecto.name}{" "}
                {solicitud.prospecto.lastName}
              </p>
              <p className="mb-1 text-gray-500 dark:text-gray-400">
                <strong className="text-gray-800 dark:text-white/90">Email:</strong> {solicitud.prospecto.email}
              </p>
              <p className="mb-1 text-gray-500 dark:text-gray-400">
                <strong className="text-gray-800 dark:text-white/90">Correo:</strong> {solicitud.prospecto.phone}
              </p>
              <p className="mb-1 text-gray-500 dark:text-gray-400">
                <strong className="text-gray-800 dark:text-white/90">Dirección:</strong> {solicitud.prospecto.address}
              </p>
              <p className="mb-1 text-gray-500 dark:text-gray-400">
                <strong className="text-gray-800 dark:text-white/90">Ubicación:</strong>{" "}
                {solicitud.prospecto.municipality.name},{" "}
                {solicitud.prospecto.department.name}
              </p>
              <p className="mb-1 text-gray-500 dark:text-gray-400">
                <strong className="text-gray-800 dark:text-white/90">Cargo:</strong> {solicitud.prospecto.cargo}
              </p>
            </div>

            {/* Secretaria */}
            <div className="border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] rounded-xl p-6 shadow-md border ">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">
                Asignado a
              </h3>
              <div className="text-gray-500 dark:text-gray-400">
                <p className="mb-1">
                  <strong className="text-gray-800 dark:text-white/90">Nombre: </strong>
                  {solicitud.usuarioAsignado.name} {solicitud.usuarioAsignado.lastName}
                </p>
                <p className="mb-1">
                  <strong className="text-gray-800 dark:text-white/90">Correo: </strong>
                  {solicitud.usuarioAsignado.email}
                </p>
                <p className="mb-1">
                  <strong className="text-gray-800 dark:text-white/90">Teléfono: </strong>
                  {solicitud.usuarioAsignado.phone}
                </p>
                <p>
                  <strong className="text-gray-800 dark:text-white/90">Cargo: </strong>
                  {solicitud.usuarioAsignado.phone}
                </p>
              </div>
            </div>

            <div className="w-full">
              <Button
                onClick={handleUpdate}
                type="button"
                className="btn btn-success flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
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
