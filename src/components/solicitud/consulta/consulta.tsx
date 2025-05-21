"use client";

import { endPointBackend } from "@/api";
import { useEffect, useRef, useState } from "react";

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "EN_PROCESO":
      return "bg-green-100 text-green-700";
    case "FINALIZADOS":
      return "bg-green-400 text-green-700";
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-700";
    case "RECHAZADA":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatearComentarios = (comentario: string) => {
  if (!comentario) return "";

  const bloques = comentario
    .split(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]/)
    .filter(Boolean);

  type ComentarioItem = {
    fecha: Date;
    fechaFormateada: string;
    texto: string;
  };

  const resultado: ComentarioItem[] = [];

  for (let i = 0; i < bloques.length; i += 2) {
    const fechaISO = bloques[i + 1];
    const texto = bloques[i];

    if (fechaISO && texto) {
      const fechaRecortada = fechaISO.replace(/\.(\d{3})\d+/, ".$1");
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
          texto: texto.trim(),
        });
      }
    }
  }

  const ordenado = resultado.toSorted((a, b) => b.fecha.getTime() - a.fecha.getTime());

  return ordenado.map((item, index) => (
    <div key={index} className="my-2">
      <p className="font-semibold text-gray-700">[{item.fechaFormateada}]</p>
      <p className="whitespace-pre-line text-gray-600">{item.texto}</p>
    </div>
  ));
};

export default function ConsultaSolicitudPage() {
  const [codigo, setCodigo] = useState("");
  const [solicitud, setSolicitud] = useState<any>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement | null>(null);

  const handleConsultar = async () => {
    setError("");
    setSolicitud(null);

    if (!codigo.trim()) {
      setError("Ingrese un código de solicitud.");
      return;
    }

    endPointBackend({ accionBD: "Get-Solicitud", id: codigo })
    .then((resp) => {
      setSolicitud(resp.data);
    })
  };

  useEffect(() => {
    if (solicitud && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [solicitud]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Consulta tu Solicitud
        </h1>
        <p className="text-center text-gray-500 text-sm">
          Ingresa el código de seguimiento para ver el estado de tu solicitud.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ej: ABC123"
            className="flex-1 border rounded-lg px-4 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleConsultar}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-all"
          >
            Consultar
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-100 p-2 rounded text-center">
            {error}
          </p>
        )}

        {solicitud && (
          <div className="border rounded-xl p-5 bg-gray-50 space-y-3 shadow-inner">
            <h2 className="text-xl font-semibold text-gray-800">
              Detalles de la Solicitud
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p><span className="font-medium">Código:</span> {solicitud.codigoSolicitud}</p>
              <p><span className="font-medium">Solicitante: </span>{solicitud.prospecto?.name} {solicitud.prospecto?.lastName}</p>
              <p>
                <span className="font-medium">Estado:</span>{" "}
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(solicitud.estado)}`}>
                  {solicitud.estado}
                </span>
              </p>
              <p><span className="font-medium">Categoria :</span> {solicitud.categoria} </p>
              <p><span className="font-medium">Fecha Radicación:</span> {new Date(solicitud.fechaCreacion).toLocaleDateString("es-ES")} </p>
              <p><span className="font-medium">Ultima Actualización:</span> {new Date(solicitud.fechaActualizacion).toLocaleDateString("es-ES")} </p>
              <p><span className="font-medium">Asignado a:</span> -------- </p>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-medium">Asunto:</p>
              <p className="text-gray-600">{solicitud.asunto}</p>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-medium">Descripción:</p>
              <p className="text-gray-600">{solicitud.mensaje}</p>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">Observaciones:</p>
              <div className="max-h-64 overflow-y-auto pr-2">
                {formatearComentarios(solicitud.comentario)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}