"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import Button from "@/components/shared/ui/button/Button";
import Badge from "@/components/shared/ui/badge/Badge";
import TextArea from "@/components/form/input/TextArea";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";

// --- TIPOS ---

// Tipo para el catálogo
type Locality = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

// Tipo para la respuesta del catálogo
type BaseResponse<T> = {
  message: string;
  data: T;
};

type Usuario = {
  id: number;
  name: string;
  email: string;
};

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
  localidad: string; // AQUÍ VIENE EL ID (ej: "5")
  estado: string;
  fechaCreacion: string;
  fotoUrl: string | null;
  latitud?: string;
  longitud?: string;
  usuario?: Usuario;
  respuestas: Respuesta[];
};

const StatusSolicitudes = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "PAUSADO", label: "Pausada" },
  { value: "FINALIZADO", label: "Finalizada" },
];

const PrioritySolicitudes = [
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Media" },
  { value: "BAJA", label: "Baja" },
];

export default function SolicitudDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [localities, setLocalities] = useState<Locality[]>([]); // Guardamos el catálogo
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gestionState, setGestionState] = useState({
    estado: "",
    prioridad: "MEDIA",
  });
  
  const [respuestaText, setRespuestaText] = useState("");

  // 1. Cargar Datos (Solicitud + Catálogo)
  const fetchData = async () => {
    try {
      const reqSolicitud = axios.get(`https://auth-service-qa.up.railway.app/app/solicitudes/${id}`);
      
      // Petición 2: El catálogo (trae los nombres)
      const reqLocalities = axios.get<BaseResponse<Locality[]>>(`https://auth-service-qa.up.railway.app/api/v1.0/catalogs/localities`);

      const [respSol, respLoc] = await Promise.all([reqSolicitud, reqLocalities]);

      const dataSol = respSol.data;
      const dataLoc = respLoc.data.data || []; // Extraemos la lista de la BaseResponse

      setSolicitud(dataSol);
      setLocalities(dataLoc);
      
      setGestionState({
        estado: dataSol.estado,
        prioridad:  dataSol.prioridad, 
      });
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // Lógica para encontrar el nombre basado en el ID
  const getLocalityName = () => {
    if (!solicitud) return "Cargando...";
    // Buscamos en el array de localidades aquella cuyo ID coincida con solicitud.localidad
    const found = localities.find(l => l.id.toString() === solicitud.localidad);
    return found ? found.name : `Zona Desconocida (ID: ${solicitud.localidad})`;
  };

  const handleUpdateGlobal = async () => {
    if (!solicitud) return;
    setSaving(true);
    try {
      await axios.put(`https://auth-service-qa.up.railway.app/app/solicitudes/${id}`, {
        asunto: solicitud.asunto,
        descripcion: solicitud.descripcion,
        localidad: solicitud.localidad, // Enviamos el ID original sin cambios
        latitud: solicitud.latitud,
        longitud: solicitud.longitud,
        
        estado: gestionState.estado,
        prioridad: gestionState.prioridad,
      });
      
      alert("Solicitud actualizada correctamente");
    } catch (err) {
      console.error("Error actualizando", err);
      alert("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const addRespuesta = async () => {
    if(!respuestaText.trim()) return;
    try {
      await axios.post(`https://auth-service-qa.up.railway.app/app/solicitudes/respuestas`, {
        solicitudId: id,
        texto: respuestaText,
      });
      setRespuestaText("");
      const resp = await axios.get(`https://auth-service-qa.up.railway.app/app/solicitudes/${id}`);
      setSolicitud(prev => ({...prev!, respuestas: resp.data.respuestas}));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGestionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     setGestionState({
       ...gestionState,
       [e.target.name]: e.target.value
     });
  };

  if (loading) return <p className="p-5">Cargando...</p>;
  if (!solicitud) return <p className="p-5">Solicitud no encontrada</p>;

  // Coordenadas
  const lat = solicitud.latitud || "4.6097";
  const lng = solicitud.longitud || "-74.0817";
  const hasCoordinates = solicitud.latitud && solicitud.longitud;

  // Calculamos el nombre aquí para usarlo en el render
  const nombreLocalidad = getLocalityName();

  return (
    <div>
      <PageBreadcrumb pageTitle={`Solicitud #${solicitud.id}`} homeHref="/solicitud-listar"/>

      <div className="flex flex-col lg:flex-row gap-6 text-white">
        
        {/* --- PANEL IZQUIERDO --- */}
        <div className="flex-1 space-y-6">
            
            <div className="border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] rounded-xl p-6 shadow-md border">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h1 className="font-bold text-gray-800 text-2xl dark:text-white uppercase tracking-tight">
                        {solicitud.asunto}
                    </h1>
                    <div className="flex gap-2">
                        <Badge color="light">
                            {new Date(solicitud.fechaCreacion).toLocaleDateString()}
                        </Badge>
                        <Badge color={solicitud.estado === 'FINALIZADO' ? 'success' : 'primary'}>
                            {solicitud.estado}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-6 text-gray-800 dark:text-white/90">
                    <div>
                        <Label className="mb-2">Descripción del Reporte</Label>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-700 text-sm leading-relaxed">
                            {solicitud.descripcion}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <Label className="mb-1">Localidad / Zona</Label>
                             
                             {/* --- AQUI MOSTRAMOS EL NOMBRE TRADUCIDO --- */}
                             <div className="flex items-center gap-2 text-lg font-medium text-gray-700 dark:text-gray-200 mt-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                
                                {/* Mostramos el nombre calculado, NO el ID */}
                                <span>{nombreLocalidad}</span>
                             </div>

                        </div>
                        <div>
                            <Label className="mb-1">Hora de Creación</Label>
                            <div className="py-2 px-1 text-gray-600 dark:text-gray-400 mt-2">
                                {new Date(solicitud.fechaCreacion).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MAPA --- */}
                {hasCoordinates && (
                    <div className="mt-8">
                        <Label className="mb-3 block font-semibold border-b border-gray-100 pb-2">Ubicación Geográfica</Label>
                        <div className="relative h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                            <iframe
                                key={`${lat}-${lng}`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                title="Mapa"
                                src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                                className="absolute inset-0"
                            />
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-3 right-3 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg shadow-lg text-xs font-bold flex items-center gap-2 transition-all border border-gray-200"
                            >
                                <span>Abrir en Google Maps</span>
                            </a>
                        </div>
                    </div>
                )}

                {/* --- FOTO --- */}
                {solicitud.fotoUrl && (
                    <div className="mt-8">
                        <Label className="mb-3 block font-semibold border-b border-gray-100 pb-2">Evidencia Adjunta</Label>
                        <div className="bg-gray-100 dark:bg-black/20 p-2 rounded-xl">
                            <img src={`${solicitud.fotoUrl}`} alt="Evidencia" className="rounded-lg shadow-sm max-h-96 object-contain mx-auto" />
                        </div>
                    </div>
                )}
            </div>
            
            {/* SECCIÓN RESPUESTAS */}
            <div className="border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] rounded-xl p-6 shadow-md border">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="font-semibold text-gray-800 text-xl dark:text-white/90">Historial de Respuestas</h2>
                    <Badge color="light">{solicitud.respuestas?.length || 0}</Badge>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 custom-scrollbar pr-2">
                    {(solicitud.respuestas || []).length > 0 ? (
                        (solicitud.respuestas || []).map((r) => (
                            <div key={r.id} className="group relative border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.05] p-4 rounded-2xl rounded-tl-none ml-4">
                                <div className="ml-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-sm text-gray-900 dark:text-white">{r.autor}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(r.fecha).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.texto}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center text-sm py-4">No hay respuestas registradas.</p>
                    )}
                </div>
                
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <Label className="mb-2 block text-xs uppercase tracking-wide text-gray-500">Nueva Respuesta</Label>
                    <TextArea
                        value={respuestaText}
                        onChange={(e) => setRespuestaText(e.target.value)}
                        placeholder="Escribe aquí..."
                        rows={3}
                        className="bg-white dark:bg-black/20"
                    />
                    <div className="mt-3 flex justify-end">
                        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={addRespuesta}>Enviar</Button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- PANEL DERECHO (GESTIÓN) --- */}
        <div className="w-full lg:w-[30%] space-y-6">
            <div className="border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] rounded-xl p-6 shadow-lg border ring-1 ring-black/5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 border-b pb-2 border-gray-100">Gestión de Solicitud</h3>
                <div className="space-y-5">
                    <div>
                        <Label className="mb-1">Prioridad</Label>
                        <Select name="prioridad" options={PrioritySolicitudes} value={gestionState.prioridad} onChange={handleGestionChange} />
                    </div>
                    <div>
                        <Label className="mb-1">Estado del Ticket</Label>
                        <Select name="estado" options={StatusSolicitudes} value={gestionState.estado} onChange={handleGestionChange} />
                    </div>
                    <div className="pt-4">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 shadow-md flex justify-center items-center gap-2" onClick={handleUpdateGlobal} disabled={saving}>
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Información del Usuario */}
            <div className="border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] rounded-xl p-6 shadow-md border">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Datos del Solicitante</h3>
                {solicitud.usuario ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">{solicitud.usuario.name.charAt(0).toUpperCase()}</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{solicitud.usuario.name}</span>
                                <span className="text-xs text-gray-500">#{solicitud.usuario.id}</span>
                            </div>
                        </div>
                        <div className="border-t pt-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400">Email</span>
                                <span className="text-sm font-medium text-blue-600 break-all">{solicitud.usuario.email}</span>
                            </div>
                        </div>
                    </div>
                ) : <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">Usuario no asignado.</div>}
            </div>
        </div>
      </div>
    </div>
  );
}